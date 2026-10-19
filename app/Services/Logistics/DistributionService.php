<?php

namespace App\Services\Logistics;

use Exception;
use Illuminate\Support\Facades\DB;
use App\Enums\StockMovementType;

class DistributionService
{
    /**
     * Mendistribusikan barang keluar dari gudang dengan pessimistic locking.
     */
    public function distribute(string $recipientType, int|string $recipientId, array $lines, string $note = '', ?int $userId = null)
    {
        return DB::transaction(function () use ($recipientType, $recipientId, $lines, $note, $userId) {
            
            // 1. Generate Distribution Number
            $year = date('Y');
            $month = date('m');
            $last = DB::table('distributions')->where('number', 'like', "OUT-$year$month-%")->count();
            $number = "OUT-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
            
            // 2. Insert Distribution Header
            $distId = DB::table('distributions')->insertGetId([
                'number' => $number,
                'distributed_at' => now(),
                'recipient_type' => $recipientType,
                'recipient_id' => $recipientId,
                'note' => $note,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // 3. Process Each Line
            $distLines = [];
            
            foreach ($lines as $line) {
                $itemId = $line['item_id'];
                $qty = (float) $line['quantity'];
                
                if ($qty <= 0) {
                    throw new Exception("Kuantitas distribusi harus lebih dari nol.");
                }
                
                // PESSIMISTIC LOCKING: lockForUpdate() prevents race conditions
                $item = DB::table('items')->where('id', $itemId)->lockForUpdate()->first();
                if (!$item) {
                    throw new Exception("Barang tidak ditemukan (ID: $itemId).");
                }
                
                $balance = $item->stock_on_hand - $qty;
                
                if ($balance < 0) {
                    throw new Exception("Stok tidak mencukupi untuk '{$item->name}'. Tersedia: {$item->stock_on_hand}, Diminta: {$qty}");
                }
                
                // Update item stock
                DB::table('items')->where('id', $itemId)->update([
                    'stock_on_hand' => $balance,
                    'updated_at' => now(),
                ]);
                
                // Record stock movement (out)
                DB::table('stock_movements')->insert([
                    'item_id' => $itemId,
                    'type' => 'out',
                    'quantity' => $qty,
                    'balance_after' => $balance,
                    'reference_type' => 'distribution',
                    'reference_id' => $distId,
                    'occurred_at' => now(),
                    'note' => 'Distribusi ke ' . $recipientType . ' ID: ' . $recipientId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $distLines[] = [
                    'distribution_id' => $distId,
                    'item_id' => $itemId,
                    'quantity' => $qty,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            // 4. Insert lines
            DB::table('distribution_lines')->insert($distLines);
            
            // 5. Create Draft Journal (Beban Perlengkapan)
            $this->createDraftJournal($distId, $lines, $note);
            
            return $distId;
        });
    }
    
    private function createDraftJournal($distId, $lines, $note)
    {
        $year = date('Y');
        $month = date('m');
        $last = DB::table('journal_entries')->where('number', 'like', "JU-$year$month-%")->count();
        $number = "JU-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
        
        $totalVal = 0;
        foreach ($lines as $line) {
            $item = DB::table('items')->where('id', $line['item_id'])->first();
            if ($item) {
                $totalVal += (float) $line['quantity'] * $item->unit_price;
            }
        }
        
        if ($totalVal <= 0) return;

        $journalId = DB::table('journal_entries')->insertGetId([
            'number' => $number,
            'date' => now()->toDateString(),
            'reference' => 'DIST-' . $distId,
            'description' => "Distribusi Logistik: $note",
            'source_type' => 'logistics',
            'source_id' => $distId,
            'status' => 'draft',
            'created_by' => auth()->id() ?? 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $persediaanId = DB::table('accounts')->where('code', 'like', '14%')->value('id');
        $bebanId = DB::table('accounts')->where('code', 'like', '5%')->value('id');
        
        if (!$persediaanId || !$bebanId) return;

        DB::table('journal_lines')->insert([
            [
                'journal_entry_id' => $journalId,
                'account_id' => $bebanId,
                'debit' => $totalVal,
                'credit' => 0,
                'memo' => 'Beban Distribusi Logistik',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'journal_entry_id' => $journalId,
                'account_id' => $persediaanId,
                'debit' => 0,
                'credit' => $totalVal,
                'memo' => 'Pengurangan Persediaan Distribusi',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
