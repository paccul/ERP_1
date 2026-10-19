<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Finance\PayrollService;
use Exception;
use Barryvdh\DomPDF\Facade\Pdf;

class PayrollController extends Controller
{
    protected $payrollService;
    
    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }
    
    public function index(): Response
    {
        $payrollRuns = DB::table('payroll_runs')
            ->join('sites', 'payroll_runs.site_id', '=', 'sites.id')
            ->select('payroll_runs.*', 'sites.name as site_name')
            ->orderBy('payroll_runs.period', 'desc')
            ->orderBy('sites.name')
            ->get();
            
        return Inertia::render('Finance/Payrolls/Index', [
            'payrollRuns' => $payrollRuns,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Finance/Payrolls/Form', [
            'sites' => DB::table('sites')->where('status', 'active')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'period' => 'required|date_format:Y-m',
        ]);
        
        try {
            $runId = $this->payrollService->generate(
                $validated['site_id'],
                $validated['period'],
                auth()->id()
            );
            
            activity()
                ->causedBy($request->user())
                ->event('created')
                ->log("Generate draft payroll Site ID {$validated['site_id']} periode {$validated['period']}");
                
            return redirect()->route('finance.payrolls.show', $runId)->with('success', 'Draft Payroll berhasil dibuat.');
        } catch (Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }
    
    public function show(string $id): Response
    {
        $run = DB::table('payroll_runs')
            ->join('sites', 'payroll_runs.site_id', '=', 'sites.id')
            ->select('payroll_runs.*', 'sites.name as site_name')
            ->where('payroll_runs.id', $id)
            ->first();
            
        if (!$run) abort(404);
        
        $payslips = DB::table('payslips')
            ->join('personnel', 'payslips.personnel_id', '=', 'personnel.id')
            ->where('payroll_run_id', $id)
            ->select('payslips.*', 'personnel.full_name as personnel_name', 'personnel.nik')
            ->get();
            
        return Inertia::render('Finance/Payrolls/Show', [
            'run' => $run,
            'payslips' => $payslips,
        ]);
    }
    
    public function post(Request $request, string $id)
    {
        try {
            $this->payrollService->post($id, auth()->id());
            
            activity()
                ->causedBy($request->user())
                ->event('posted')
                ->log("Posting payroll run ID $id");
                
            return back()->with('success', 'Payroll berhasil diposting dan dijurnal.');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
    
    public function downloadPayslip(string $id)
    {
        $payslip = DB::table('payslips')
            ->join('personnel', 'payslips.personnel_id', '=', 'personnel.id')
            ->join('payroll_runs', 'payslips.payroll_run_id', '=', 'payroll_runs.id')
            ->join('sites', 'payroll_runs.site_id', '=', 'sites.id')
            ->where('payslips.id', $id)
            ->select('payslips.*', 'personnel.full_name', 'personnel.nik', 'payroll_runs.period', 'sites.name as site_name')
            ->first();
            
        if (!$payslip) abort(404);
        
        $pdf = Pdf::loadView('pdf.payslip', compact('payslip'));
        return $pdf->download("Slip-Gaji-{$payslip->nik}-{$payslip->period}.pdf");
    }
}
