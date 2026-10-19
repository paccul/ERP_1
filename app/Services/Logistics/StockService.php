<?php

namespace App\Services\Logistics;

use Exception;
use Illuminate\Support\Facades\DB;
use App\Enums\StockMovementType;

class StockService
{
    /**
     * Memasukkan barang ke gudang (in).
     */
    public function stockIn(int|string $itemId, float $quantity, string $note = '', ?string $refType = null, ?int $refId = null)
    {
        if ($quantity <= 0) {
            throw new Exception("Kuantitas harus lebih besar dari nol.");
        }

        return DB::transaction(function () use ($itemId, $quantity, $note, $refType, $refId) {
            $item = DB::table('items')->where('id', $itemId)->lockForUpdate()->first();
            if (!$item) {
                throw new Exception("Barang tidak ditemukan.");
            }

            $balance = $item->stock_on_hand + $quantity;

            // Update items
            DB::table('items')->where('id', $itemId)->update([
                'stock_on_hand' => $balance,
                'updated_at' => now(),
            ]);

            // Insert stock movement
            $movementId = DB::table('stock_movements')->insertGetId([
                'item_id' => $itemId,
                'type' => 'in',
                'quantity' => $quantity,
                'balance_after' => $balance,
                'reference_type' => $refType,
                'reference_id' => $refId,
                'occurred_at' => now(),
                'note' => $note,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create Draft Journal (Integrasi Jurnal LOG -> ACC)
            $this->createDraftJournal('in', $item, $quantity, $note, $movementId);

            return $balance;
        });
    }

    /**
     * Penyesuaian stok opname (adjust). Quantity bisa positif (nambah) atau negatif (kurang).
     */
    public function adjustStock(int|string $itemId, float $difference, string $note = '')
    {
        if ($difference == 0) {
            throw new Exception("Nilai penyesuaian tidak boleh nol.");
        }

        return DB::transaction(function () use ($itemId, $difference, $note) {
            $item = DB::table('items')->where('id', $itemId)->lockForUpdate()->first();
            if (!$item) {
                throw new Exception("Barang tidak ditemukan.");
            }

            $balance = $item->stock_on_hand + $difference;
            
            if ($balance < 0) {
                throw new Exception("Stok tidak mencukupi untuk dikurangi. Maksimal pengurangan: " . $item->stock_on_hand);
            }

            // Update items
            DB::table('items')->where('id', $itemId)->update([
                'stock_on_hand' => $balance,
                'updated_at' => now(),
            ]);

            // Insert stock movement
            $movementId = DB::table('stock_movements')->insertGetId([
                'item_id' => $itemId,
                'type' => 'adjust',
                'quantity' => $difference,
                'balance_after' => $balance,
                'occurred_at' => now(),
                'note' => $note,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create Draft Journal
            $this->createDraftJournal('adjust', $item, $difference, $note, $movementId);

            return $balance;
        });
    }

    private function createDraftJournal($type, $item, $qty, $note, $refId)
    {
        $year = date('Y');
        $month = date('m');
        $last = DB::table('journal_entries')->where('number', 'like', "JU-$year$month-%")->count();
        $number = "JU-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
        
        $totalVal = abs($qty * $item->unit_price);
        if ($totalVal <= 0) return; // No value to journal

        $journalId = DB::table('journal_entries')->insertGetId([
            'number' => $number,
            'date' => now()->toDateString(),
            'reference' => 'LOG-' . strtoupper($type) . '-' . $refId,
            'description' => "Otomatis dari Logistik: $note",
            'source_type' => 'logistics',
            'source_id' => $refId,
            'status' => 'draft',
            'created_by' => auth()->id() ?? 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Cari akun persediaan dan beban/modal
        $persediaanId = DB::table('accounts')->where('code', 'like', '14%')->value('id');
        $lawanId = DB::table('accounts')->where('code', 'like', '5%')->value('id'); // Beban perlengkapan/COGS
        
        if (!$persediaanId || !$lawanId) return; // Silent if COA not ready
        
        $isAdd = ($qty > 0);

        DB::table('journal_lines')->insert([
            [
                'journal_entry_id' => $journalId,
                'account_id' => $persediaanId,
                'debit' => $isAdd ? $totalVal : 0,
                'credit' => $isAdd ? 0 : $totalVal,
                'memo' => "Persediaan: {$item->name}",
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'journal_entry_id' => $journalId,
                'account_id' => $lawanId,
                'debit' => $isAdd ? 0 : $totalVal,
                'credit' => $isAdd ? $totalVal : 0,
                'memo' => "Lawan Persediaan: {$item->name}",
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
