<?php

namespace App\Services\Finance;

use Exception;
use Illuminate\Support\Facades\DB;
use App\Enums\InvoiceStatus;
use App\Services\Accounting\JournalPostingService;

class InvoiceService
{
    protected $postingService;
    
    public function __construct(JournalPostingService $postingService)
    {
        $this->postingService = $postingService;
    }

    public function generate(int $clientId, string $period, float $vatRate, ?int $userId = null)
    {
        return DB::transaction(function () use ($clientId, $period, $vatRate, $userId) {
            // Find active sites for this client
            $sites = DB::table('sites')
                ->where('client_id', $clientId)
                ->where('is_active', true)
                ->get();
                
            if ($sites->isEmpty()) {
                throw new Exception("Klien tidak memiliki lokasi (site) yang aktif.");
            }
            
            $yearStr = str_replace('-', '', $period);
            $last = DB::table('invoices')->where('number', 'like', "INV-$yearStr-%")->count();
            $number = "INV-$yearStr-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
            
            $invoiceId = DB::table('invoices')->insertGetId([
                'number' => $number,
                'client_id' => $clientId,
                'period' => $period,
                'issued_at' => null, // Not yet issued
                'due_at' => null,
                'status' => InvoiceStatus::Draft->value,
                'subtotal' => 0,
                'vat_rate' => $vatRate,
                'vat_amount' => 0,
                'total' => 0,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $subtotal = 0;
            $lines = [];
            
            foreach ($sites as $site) {
                // Count active guards for this site
                // We'll just approximate it by how many personnel are assigned to this site in roster
                // Or simply active personnel with this site_id if using site_id in personnel
                // Wait, personnel doesn't have site_id directly in the new schema, but let's count from roster
                $guards = DB::table('personnel')
                    ->where('status', 'active')
                    ->whereExists(function ($query) use ($site) {
                        $query->select(DB::raw(1))
                              ->from('roster_assignments')
                              ->whereColumn('roster_assignments.personnel_id', 'personnel.id')
                              ->where('roster_assignments.site_id', $site->id)
                              ->where('roster_assignments.is_bko', false)
                              ->where('roster_assignments.status', 'active');
                    })
                    ->count();
                    
                if ($guards == 0) {
                    // Fallback to manual rate config or something, but we just put 0 guards or ignore
                    continue;
                }
                
                $rate = $site->rate_per_personnel ?? 0;
                $amount = round($guards * $rate, 2);
                $subtotal += $amount;
                
                $lines[] = [
                    'invoice_id' => $invoiceId,
                    'site_id' => $site->id,
                    'description' => "Jasa Pengamanan {$site->name} ($guards personil)",
                    'guards' => $guards,
                    'rate' => $rate,
                    'amount' => $amount,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (empty($lines)) {
                throw new Exception("Tidak ada personil aktif di site milik klien ini.");
            }
            
            DB::table('invoice_lines')->insert($lines);
            
            $vatAmount = round($subtotal * ($vatRate / 100), 2);
            $total = $subtotal + $vatAmount;
            
            DB::table('invoices')->where('id', $invoiceId)->update([
                'subtotal' => $subtotal,
                'vat_amount' => $vatAmount,
                'total' => $total,
            ]);
            
            return $invoiceId;
        });
    }

    public function issue(int $invoiceId, ?int $userId = null)
    {
        return DB::transaction(function () use ($invoiceId, $userId) {
            $invoice = DB::table('invoices')->where('id', $invoiceId)->lockForUpdate()->first();
            if (!$invoice) throw new Exception("Invoice tidak ditemukan.");
            if ($invoice->status !== InvoiceStatus::Draft->value) throw new Exception("Hanya invoice Draft yang dapat diterbitkan.");
            
            $now = now();
            
            // Integrasi Jurnal: Debit Piutang, Kredit Pendapatan + PPN Keluaran
            $piutangId = DB::table('accounts')->where('code', 'like', '12%')->value('id');
            $pendapatanId = DB::table('accounts')->where('code', 'like', '41%')->value('id');
            $ppnId = DB::table('accounts')->where('code', 'like', '21%')->value('id');
            
            $journalEntryId = null;
            if ($piutangId && $pendapatanId && $ppnId) {
                $year = date('Y');
                $month = date('m');
                $last = DB::table('journal_entries')->where('number', 'like', "JU-$year$month-%")->count();
                $number = "JU-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
                
                $journalEntryId = DB::table('journal_entries')->insertGetId([
                    'number' => $number,
                    'date' => $now->toDateString(),
                    'reference' => 'INV-' . $invoice->number,
                    'description' => "Penerbitan Tagihan Klien " . $invoice->number,
                    'source_type' => 'finance',
                    'source_id' => $invoiceId,
                    'status' => 'draft',
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                DB::table('journal_lines')->insert([
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $piutangId,
                        'debit' => $invoice->total,
                        'credit' => 0,
                        'memo' => "Piutang Tagihan {$invoice->number}",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $pendapatanId,
                        'debit' => 0,
                        'credit' => $invoice->subtotal,
                        'memo' => "Pendapatan Jasa",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $ppnId,
                        'debit' => 0,
                        'credit' => $invoice->vat_amount,
                        'memo' => "PPN Keluaran",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
                
                $this->postingService->post($journalEntryId);
            }
            
            DB::table('invoices')->where('id', $invoiceId)->update([
                'status' => InvoiceStatus::Issued->value,
                'issued_at' => $now,
                'due_at' => $now->copy()->addDays(14), // Default due date 14 days
                'journal_entry_id' => $journalEntryId,
                'updated_at' => now(),
            ]);
            
            return $invoiceId;
        });
    }

    public function pay(int $invoiceId, float $amount, int $cashAccountId, ?int $userId = null)
    {
        return DB::transaction(function () use ($invoiceId, $amount, $cashAccountId, $userId) {
            $invoice = DB::table('invoices')->where('id', $invoiceId)->lockForUpdate()->first();
            if (!$invoice) throw new Exception("Invoice tidak ditemukan.");
            if ($invoice->status !== InvoiceStatus::Issued->value) throw new Exception("Invoice belum diterbitkan atau sudah lunas/batal.");
            
            if ($amount <= 0) throw new Exception("Jumlah pembayaran harus lebih dari 0.");
            
            $totalPaid = DB::table('invoice_payments')->where('invoice_id', $invoiceId)->sum('amount');
            $remaining = $invoice->total - $totalPaid;
            
            if ($amount > $remaining) {
                throw new Exception("Jumlah pembayaran ($amount) melebihi sisa tagihan ($remaining).");
            }
            
            $piutangId = DB::table('accounts')->where('code', 'like', '12%')->value('id');
            $journalEntryId = null;
            
            if ($piutangId) {
                $year = date('Y');
                $month = date('m');
                $last = DB::table('journal_entries')->where('number', 'like', "JU-$year$month-%")->count();
                $number = "JU-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
                
                $journalEntryId = DB::table('journal_entries')->insertGetId([
                    'number' => $number,
                    'date' => now()->toDateString(),
                    'reference' => 'PAY-' . $invoice->number,
                    'description' => "Pembayaran Tagihan " . $invoice->number,
                    'source_type' => 'finance',
                    'source_id' => $invoiceId,
                    'status' => 'draft',
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                DB::table('journal_lines')->insert([
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $cashAccountId,
                        'debit' => $amount,
                        'credit' => 0,
                        'memo' => "Terima Pembayaran",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $piutangId,
                        'debit' => 0,
                        'credit' => $amount,
                        'memo' => "Pelunasan Piutang",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
                
                $this->postingService->post($journalEntryId);
            }
            
            DB::table('invoice_payments')->insert([
                'invoice_id' => $invoiceId,
                'paid_at' => now(),
                'amount' => $amount,
                'cash_account_id' => $cashAccountId,
                'journal_entry_id' => $journalEntryId,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Check if fully paid
            if ($totalPaid + $amount >= $invoice->total) {
                DB::table('invoices')->where('id', $invoiceId)->update([
                    'status' => InvoiceStatus::Paid->value,
                    'updated_at' => now(),
                ]);
            }
            
            return true;
        });
    }
}



