<?php

namespace App\Services\Finance;

use Exception;
use Illuminate\Support\Facades\DB;
use App\Enums\PayrollStatus;
use App\Services\Accounting\JournalPostingService;

class PayrollService
{
    protected $postingService;
    
    public function __construct(JournalPostingService $postingService)
    {
        $this->postingService = $postingService;
    }

    public function generate(int $siteId, string $period, ?int $userId = null)
    {
        return DB::transaction(function () use ($siteId, $period, $userId) {
            // Check if already exists
            $exists = DB::table('payroll_runs')->where('site_id', $siteId)->where('period', $period)->exists();
            if ($exists) {
                throw new Exception("Payroll untuk site dan periode ini sudah ada.");
            }
            
            // Find active personnel assigned to this site in this period
            // Approximation: personnel with active status and assigned to this site in roster
            $year = substr($period, 0, 4);
            $month = substr($period, 5, 2);
            $startDate = "$year-$month-01";
            $endDate = date('Y-m-t', strtotime($startDate));
            
            // We fetch assignments overlapping with this month
            $assignments = DB::table('roster_assignments')
                ->where('site_id', $siteId)
                ->where('status', 'active')
                ->where('start_date', '<=', $endDate)
                ->where(function ($q) use ($startDate) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', $startDate);
                })
                ->get()
                ->groupBy('personnel_id');
                
            if ($assignments->isEmpty()) {
                throw new Exception("Tidak ada personil yang ditugaskan di site ini pada periode $period.");
            }
            
            $runId = DB::table('payroll_runs')->insertGetId([
                'period' => $period,
                'site_id' => $siteId,
                'status' => PayrollStatus::Draft->value,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $payslips = [];
            
            foreach ($assignments as $personnelId => $assigns) {
                $personnel = DB::table('personnel')->where('id', $personnelId)->first();
                if (!$personnel) continue;
                
                // Mock calculation logic
                // In real world, attendance data is counted.
                $baseSalary = 3500000; // Mock UMK
                $allowance = 500000; // Mock Tunjangan Jabatan
                
                // Mock Overtime calculation from attendance
                $overtimeCount = DB::table('attendances')
                    ->join('roster_assignments', 'attendances.roster_assignment_id', '=', 'roster_assignments.id')
                    ->where('roster_assignments.personnel_id', $personnelId)
                    ->where('roster_assignments.site_id', $siteId)
                    ->whereBetween('attendances.check_in', ["$startDate 00:00:00", "$endDate 23:59:59"])
                    ->where('attendances.status', 'present')
                    ->where('attendances.is_overtime', true)
                    ->count();
                    
                $overtime = $overtimeCount * 50000; // Mock overtime rate
                
                // Gross
                $gross = $baseSalary + $allowance + $overtime;
                
                // Deductions (Mock % based on standard)
                $bpjsKes = round($baseSalary * 0.01, 2); // 1% employee
                $bpjsTk = round($baseSalary * 0.02, 2); // 2% employee JHT
                
                // PPh21 TER Mock Calculation
                // PPh21 = (Gross - PTKP) * Rate (Simplified TER)
                $pph21 = round(($gross > 4500000) ? ($gross * 0.0025) : 0, 2);
                
                $netPay = $gross - $bpjsKes - $bpjsTk - $pph21;
                
                $payslips[] = [
                    'payroll_run_id' => $runId,
                    'personnel_id' => $personnelId,
                    'base_salary' => $baseSalary,
                    'allowance' => $allowance,
                    'overtime' => $overtime,
                    'bpjs_kes' => $bpjsKes,
                    'bpjs_tk' => $bpjsTk,
                    'pph21' => $pph21,
                    'net_pay' => $netPay,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            DB::table('payslips')->insert($payslips);
            
            return $runId;
        });
    }

    public function post(int $runId, ?int $userId = null)
    {
        return DB::transaction(function () use ($runId, $userId) {
            $run = DB::table('payroll_runs')->where('id', $runId)->lockForUpdate()->first();
            if (!$run) throw new Exception("Payroll Run tidak ditemukan.");
            if ($run->status !== PayrollStatus::Draft->value) throw new Exception("Hanya payroll Draft yang dapat diposting.");
            
            // Calculate totals
            $totals = DB::table('payslips')
                ->where('payroll_run_id', $runId)
                ->select(
                    DB::raw('SUM(base_salary + allowance + overtime) as gross'),
                    DB::raw('SUM(bpjs_kes + bpjs_tk) as bpjs'),
                    DB::raw('SUM(pph21) as pph21'),
                    DB::raw('SUM(net_pay) as net_pay')
                )
                ->first();
                
            $gross = $totals->gross;
            $bpjs = $totals->bpjs;
            $pph21 = $totals->pph21;
            $netPay = $totals->net_pay;
            
            // Journal Integration:
            // Db Beban Gaji (Gross)
            // Kr Utang BPJS
            // Kr Utang PPh21
            // Kr Utang Gaji (Net)
            
            $bebanGajiId = DB::table('accounts')->where('code', 'like', '5%')->where('name', 'like', '%Gaji%')->value('id');
            $utangGajiId = DB::table('accounts')->where('code', 'like', '2%')->where('name', 'like', '%Gaji%')->value('id');
            $utangBpjsId = DB::table('accounts')->where('code', 'like', '2%')->where('name', 'like', '%BPJS%')->value('id');
            $utangPphId = DB::table('accounts')->where('code', 'like', '2%')->where('name', 'like', '%PPh%')->value('id');
            
            $journalEntryId = null;
            
            if ($bebanGajiId && $utangGajiId && $utangBpjsId && $utangPphId) {
                $yearStr = str_replace('-', '', $run->period);
                $last = DB::table('journal_entries')->where('number', 'like', "JU-$yearStr-%")->count();
                $number = "JU-$yearStr-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
                
                $journalEntryId = DB::table('journal_entries')->insertGetId([
                    'number' => $number,
                    'date' => now()->toDateString(),
                    'reference' => 'PAYROLL-' . $runId,
                    'description' => "Payroll Site ID {$run->site_id} Periode {$run->period}",
                    'source_type' => 'finance',
                    'source_id' => $runId,
                    'status' => 'draft',
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                DB::table('journal_lines')->insert([
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $bebanGajiId,
                        'debit' => $gross,
                        'credit' => 0,
                        'memo' => "Beban Gaji Bruto",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $utangBpjsId,
                        'debit' => 0,
                        'credit' => $bpjs,
                        'memo' => "Potongan BPJS",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $utangPphId,
                        'debit' => 0,
                        'credit' => $pph21,
                        'memo' => "Potongan PPh 21",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'journal_entry_id' => $journalEntryId,
                        'account_id' => $utangGajiId,
                        'debit' => 0,
                        'credit' => $netPay,
                        'memo' => "Utang Gaji Bersih",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                ]);
                
                $this->postingService->post($journalEntryId);
            }
            
            DB::table('payroll_runs')->where('id', $runId)->update([
                'status' => PayrollStatus::Posted->value,
                'journal_entry_id' => $journalEntryId,
                'updated_at' => now(),
            ]);
            
            return true;
        });
    }
}
