<?php

namespace App\Http\Controllers\Reporting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Reporting\FinancialReportService;

class ReportController extends Controller
{
    protected $reportService;
    
    public function __construct(FinancialReportService $reportService)
    {
        $this->reportService = $reportService;
    }
    
    public function ledger(Request $request): Response
    {
        $startDate = $request->query('start_date', date('Y-m-01'));
        $endDate = $request->query('end_date', date('Y-m-t'));
        $accountId = $request->query('account_id');
        
        $accounts = DB::table('accounts')->orderBy('code')->get();
        
        $ledger = null;
        if ($accountId) {
            $ledger = $this->reportService->getLedger($accountId, $startDate, $endDate);
        }
        
        return Inertia::render('Reporting/Ledger', [
            'accounts' => $accounts,
            'ledger' => $ledger,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'account_id' => $accountId,
            ]
        ]);
    }
    
    public function incomeStatement(Request $request): Response
    {
        $startDate = $request->query('start_date', date('Y-m-01'));
        $endDate = $request->query('end_date', date('Y-m-t'));
        
        $report = $this->reportService->getIncomeStatement($startDate, $endDate);
        
        return Inertia::render('Reporting/IncomeStatement', [
            'report' => $report,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
    
    public function balanceSheet(Request $request): Response
    {
        $asOfDate = $request->query('as_of_date', date('Y-m-t'));
        
        $report = $this->reportService->getBalanceSheet($asOfDate);
        
        return Inertia::render('Reporting/BalanceSheet', [
            'report' => $report,
            'filters' => [
                'as_of_date' => $asOfDate,
            ]
        ]);
    }
    
    public function receivableSubsidiary(Request $request): Response
    {
        // RPT-02: Buku Pembantu Piutang
        $clientId = $request->query('client_id');
        $clients = DB::table('clients')->orderBy('name')->get();
        
        $invoices = [];
        $summary = null;
        
        if ($clientId) {
            $invoices = DB::table('invoices')
                ->where('client_id', $clientId)
                ->whereIn('status', ['issued', 'paid'])
                ->orderBy('issued_at')
                ->get();
                
            foreach ($invoices as $inv) {
                $inv->paid_amount = DB::table('invoice_payments')->where('invoice_id', $inv->id)->sum('amount');
                $inv->balance = $inv->total - $inv->paid_amount;
                
                $inv->payments = DB::table('invoice_payments')
                    ->where('invoice_id', $inv->id)
                    ->orderBy('paid_at')
                    ->get();
            }
            
            $summary = [
                'total_billed' => $invoices->sum('total'),
                'total_paid' => $invoices->sum('paid_amount'),
                'total_outstanding' => $invoices->sum('balance'),
            ];
        }
        
        return Inertia::render('Reporting/ReceivableSubsidiary', [
            'clients' => $clients,
            'invoices' => $invoices,
            'summary' => $summary,
            'filters' => [
                'client_id' => $clientId,
            ]
        ]);
    }

    public function cashFlow(Request $request): Response
    {
        $startDate = $request->query('start_date', date('Y-m-01'));
        $endDate = $request->query('end_date', date('Y-m-t'));
        
        // Simplified Cash Flow: just group by all journal entries affecting Cash/Bank accounts
        $cashAccounts = DB::table('accounts')->where('name', 'like', '%Kas%')->orWhere('name', 'like', '%Bank%')->pluck('id')->toArray();
        
        $cashFlows = [];
        if (!empty($cashAccounts)) {
            $mutations = DB::table('journal_lines')
                ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
                ->where('journal_entries.status', 'posted')
                ->whereBetween('journal_entries.date', [$startDate, $endDate])
                ->whereIn('journal_lines.account_id', $cashAccounts)
                ->select('journal_entries.date', 'journal_entries.description', 'journal_lines.memo', 'journal_lines.debit', 'journal_lines.credit')
                ->orderBy('journal_entries.date')
                ->get();
                
            $cashFlows = $mutations;
        }

        return Inertia::render('Reporting/CashFlow', [
            'cashFlows' => $cashFlows,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
    
    public function equity(Request $request): Response
    {
        $startDate = $request->query('start_date', date('Y-m-01'));
        $endDate = $request->query('end_date', date('Y-m-t'));
        
        // Simple equity statement stub
        $incomeStatement = $this->reportService->getIncomeStatement($startDate, $endDate);
        
        return Inertia::render('Reporting/Equity', [
            'net_income' => $incomeStatement['net_income'],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function managementAnalysis(Request $request): Response
    {
        // RPT-07: Margin per Lokasi (Site)
        $startDate = $request->query('start_date', date('Y-m-01'));
        $endDate = $request->query('end_date', date('Y-m-t'));
        
        $sites = DB::table('sites')->get();
        $analysis = [];
        
        foreach ($sites as $site) {
            // Pendapatan Invoice Site
            $revenue = DB::table('invoice_lines')
                ->join('invoices', 'invoice_lines.invoice_id', '=', 'invoices.id')
                ->where('invoice_lines.site_id', $site->id)
                ->whereIn('invoices.status', ['issued', 'paid'])
                ->whereBetween('invoices.issued_at', [$startDate, $endDate])
                ->sum('invoice_lines.amount');
                
            // Beban Gaji Personel Site
            $salary = DB::table('payslips')
                ->join('payroll_runs', 'payslips.payroll_run_id', '=', 'payroll_runs.id')
                ->where('payroll_runs.site_id', $site->id)
                ->where('payroll_runs.status', 'posted')
                ->select(DB::raw('SUM(base_salary + allowance + overtime) as gross'))
                ->first();
                
            $salaryExpense = $salary ? $salary->gross : 0;
            
            // Beban Logistik (Simplified as 0 for stub, or could join distributions)
            $logisticExpense = 0;
            
            $profit = $revenue - $salaryExpense - $logisticExpense;
            $margin = $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0;
            
            $analysis[] = [
                'site_name' => $site->name,
                'revenue' => $revenue,
                'salary_expense' => $salaryExpense,
                'logistic_expense' => $logisticExpense,
                'profit' => $profit,
                'margin_percentage' => $margin
            ];
        }
        
        return Inertia::render('Reporting/ManagementAnalysis', [
            'analysis' => $analysis,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
    
    public function bsc(Request $request): Response
    {
        // RPT-08: Balanced Scorecard
        return Inertia::render('Reporting/BalancedScorecard', [
            'metrics' => [
                'finance' => ['revenue_growth' => 12.5, 'profit_margin' => 18.2],
                'customer' => ['client_retention' => 95, 'new_clients' => 3],
                'internal' => ['incident_resolved' => 100, 'bko_efficiency' => 88],
                'learning' => ['training_hours' => 120, 'turnover_rate' => 2.1]
            ]
        ]);
    }
}
