<?php

namespace App\Services\Reporting;

use Illuminate\Support\Facades\DB;
use App\Enums\AccountCategory;
use App\Enums\NormalBalance;

class FinancialReportService
{
    /**
     * Get Ledger (Buku Besar) for an account within a date range.
     */
    public function getLedger(int $accountId, string $startDate, string $endDate)
    {
        $account = DB::table('accounts')->where('id', $accountId)->first();
        if (!$account) return null;
        
        // Calculate beginning balance (before startDate)
        $beginning = DB::table('journal_lines')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted')
            ->where('journal_entries.date', '<', $startDate)
            ->where('journal_lines.account_id', $accountId)
            ->select(
                DB::raw('SUM(debit) as total_debit'),
                DB::raw('SUM(credit) as total_credit')
            )
            ->first();
            
        $isDebitNormal = in_array($account->category, ['asset', 'expense']);
        $begBalance = 0;
        
        if ($beginning) {
            if ($isDebitNormal) {
                $begBalance = $beginning->total_debit - $beginning->total_credit;
            } else {
                $begBalance = $beginning->total_credit - $beginning->total_debit;
            }
        }
        
        // Get mutations within date range
        $mutations = DB::table('journal_lines')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->where('journal_lines.account_id', $accountId)
            ->select('journal_entries.date', 'journal_entries.number', 'journal_entries.reference', 'journal_lines.memo', 'journal_lines.debit', 'journal_lines.credit')
            ->orderBy('journal_entries.date')
            ->orderBy('journal_entries.id')
            ->get();
            
        // Calculate running balance
        $lines = [];
        $runningBalance = $begBalance;
        
        foreach ($mutations as $m) {
            if ($isDebitNormal) {
                $runningBalance += ($m->debit - $m->credit);
            } else {
                $runningBalance += ($m->credit - $m->debit);
            }
            
            $m->balance = $runningBalance;
            $lines[] = $m;
        }
        
        return [
            'account' => $account,
            'beginning_balance' => $begBalance,
            'mutations' => $lines,
            'ending_balance' => $runningBalance,
            'is_debit_normal' => $isDebitNormal
        ];
    }

    /**
     * Get Income Statement (Laba Rugi).
     */
    public function getIncomeStatement(string $startDate, string $endDate)
    {
        $balances = DB::table('journal_lines')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', 'posted')
            ->whereBetween('journal_entries.date', [$startDate, $endDate])
            ->whereIn('accounts.category', ['revenue', 'expense'])
            ->select(
                'accounts.id', 'accounts.code', 'accounts.name', 'accounts.category',
                DB::raw('SUM(debit) as total_debit'),
                DB::raw('SUM(credit) as total_credit')
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.category')
            ->orderBy('accounts.code')
            ->get();
            
        $revenues = [];
        $expenses = [];
        $totalRevenue = 0;
        $totalExpense = 0;
        
        foreach ($balances as $b) {
            if ($b->category === 'revenue') {
                $net = $b->total_credit - $b->total_debit; // Normal credit
                $b->net = $net;
                $revenues[] = $b;
                $totalRevenue += $net;
            } else {
                $net = $b->total_debit - $b->total_credit; // Normal debit
                $b->net = $net;
                $expenses[] = $b;
                $totalExpense += $net;
            }
        }
        
        return [
            'revenues' => $revenues,
            'total_revenue' => $totalRevenue,
            'expenses' => $expenses,
            'total_expense' => $totalExpense,
            'net_income' => $totalRevenue - $totalExpense
        ];
    }
    
    /**
     * Get Balance Sheet (Neraca).
     */
    public function getBalanceSheet(string $asOfDate)
    {
        $balances = DB::table('journal_lines')
            ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->where('journal_entries.status', 'posted')
            ->where('journal_entries.date', '<=', $asOfDate)
            ->select(
                'accounts.id', 'accounts.code', 'accounts.name', 'accounts.category',
                DB::raw('SUM(debit) as total_debit'),
                DB::raw('SUM(credit) as total_credit')
            )
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.category')
            ->orderBy('accounts.code')
            ->get();
            
        $assets = [];
        $liabilities = [];
        $equities = [];
        
        $totalAsset = 0;
        $totalLiability = 0;
        $totalEquity = 0;
        
        // Income statement accounts to retained earnings
        $retainedEarnings = 0;
        
        foreach ($balances as $b) {
            if ($b->category === 'asset') {
                $net = $b->total_debit - $b->total_credit;
                $b->net = $net;
                $assets[] = $b;
                $totalAsset += $net;
            } elseif ($b->category === 'liability') {
                $net = $b->total_credit - $b->total_debit;
                $b->net = $net;
                $liabilities[] = $b;
                $totalLiability += $net;
            } elseif ($b->category === 'equity') {
                $net = $b->total_credit - $b->total_debit;
                $b->net = $net;
                $equities[] = $b;
                $totalEquity += $net;
            } elseif ($b->category === 'revenue') {
                $net = $b->total_credit - $b->total_debit;
                $retainedEarnings += $net;
            } elseif ($b->category === 'expense') {
                $net = $b->total_debit - $b->total_credit;
                $retainedEarnings -= $net;
            }
        }
        
        // Add retained earnings to equity
        $totalEquity += $retainedEarnings;
        
        return [
            'assets' => $assets,
            'total_asset' => $totalAsset,
            'liabilities' => $liabilities,
            'total_liability' => $totalLiability,
            'equities' => $equities,
            'retained_earnings' => $retainedEarnings,
            'total_equity' => $totalEquity,
            'total_liability_equity' => $totalLiability + $totalEquity,
            'is_balanced' => round($totalAsset, 2) === round($totalLiability + $totalEquity, 2)
        ];
    }
}
