<?php

namespace App\Services\Accounting;

use Exception;
use Illuminate\Support\Facades\DB;

class UnbalancedJournalException extends Exception
{
    // Custom exception for unbalanced journals
}

class JournalPostingService
{
    /**
     * Post a draft journal entry.
     *
     * @param int|string $journalEntryId
     * @throws UnbalancedJournalException
     * @throws Exception
     */
    public function post($journalEntryId)
    {
        return DB::transaction(function () use ($journalEntryId) {
            $journal = DB::table('journal_entries')->where('id', $journalEntryId)->first();
            
            if (!$journal) {
                throw new Exception("Journal not found.");
            }
            
            if ($journal->status !== 'draft') {
                throw new Exception("Only draft journals can be posted.");
            }
            
            $lines = DB::table('journal_lines')->where('journal_entry_id', $journal->id)->get();
            
            if ($lines->isEmpty()) {
                throw new Exception("Journal has no lines.");
            }
            
            $totalDebit = $lines->sum('debit');
            $totalCredit = $lines->sum('credit');
            
            // Check for balance, allowing for minor floating point differences
            if (abs($totalDebit - $totalCredit) > 0.001) {
                throw new UnbalancedJournalException("Journal is unbalanced. Debit: $totalDebit, Credit: $totalCredit");
            }
            
            // Post it
            DB::table('journal_entries')
                ->where('id', $journal->id)
                ->update([
                    'status' => 'posted',
                    'posted_at' => now(),
                    'updated_at' => now(),
                ]);
                
            return true;
        });
    }
    
    /**
     * Reverse a posted journal entry.
     *
     * @param int|string $journalEntryId
     * @param int|string|null $userId
     * @return int The ID of the newly created reversal journal
     * @throws Exception
     */
    public function reverse($journalEntryId, $userId = null)
    {
        return DB::transaction(function () use ($journalEntryId, $userId) {
            $original = DB::table('journal_entries')->where('id', $journalEntryId)->first();
            
            if (!$original) {
                throw new Exception("Original journal not found.");
            }
            
            if ($original->status !== 'posted') {
                throw new Exception("Only posted journals can be reversed.");
            }
            
            // Generate reversal number
            $year = date('Y');
            $month = date('m');
            $lastReversal = DB::table('journal_entries')
                ->where('number', 'like', "REV-$year$month-%")
                ->count();
            $newNumber = "REV-$year$month-" . str_pad($lastReversal + 1, 4, '0', STR_PAD_LEFT);
            
            // Create reversal journal
            $reversalId = DB::table('journal_entries')->insertGetId([
                'number' => $newNumber,
                'date' => now()->toDateString(), // Can be same date or today
                'reference' => 'Reversal of ' . $original->number,
                'description' => 'Auto Reversal of Jurnal ' . $original->number,
                'status' => 'posted', // Reverse directly posts
                'posted_at' => now(),
                'reversal_of_id' => $original->id,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Create reversed lines (swap debit and credit)
            $originalLines = DB::table('journal_lines')->where('journal_entry_id', $original->id)->get();
            $reversedLines = [];
            
            foreach ($originalLines as $line) {
                $reversedLines[] = [
                    'journal_entry_id' => $reversalId,
                    'account_id' => $line->account_id,
                    'debit' => $line->credit, // swapped
                    'credit' => $line->debit, // swapped
                    'memo' => 'Reversal: ' . $line->memo,
                    'site_id' => $line->site_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            DB::table('journal_lines')->insert($reversedLines);
            
            return $reversalId;
        });
    }
}
