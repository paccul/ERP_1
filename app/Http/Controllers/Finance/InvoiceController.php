<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Finance\InvoiceService;
use Exception;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    protected $invoiceService;
    
    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }
    
    public function index(): Response
    {
        $invoices = DB::table('invoices')
            ->join('clients', 'invoices.client_id', '=', 'clients.id')
            ->select('invoices.*', 'clients.name as client_name')
            ->orderBy('invoices.created_at', 'desc')
            ->get();
            
        return Inertia::render('Finance/Invoices/Index', [
            'invoices' => $invoices,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Finance/Invoices/Form', [
            'clients' => DB::table('clients')->whereNull('deleted_at')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'period' => 'required|date_format:Y-m',
            'vat_rate' => 'required|numeric|min:0|max:100',
        ]);
        
        try {
            $invoiceId = $this->invoiceService->generate(
                $validated['client_id'],
                $validated['period'],
                $validated['vat_rate'],
                auth()->id()
            );
            
            activity()
                ->causedBy($request->user())
                ->event('created')
                ->log("Generate draft tagihan klien ID {$validated['client_id']} periode {$validated['period']}");
                
            return redirect()->route('finance.invoices.show', $invoiceId)->with('success', 'Draft Tagihan berhasil dibuat.');
        } catch (Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }
    
    public function show(string $id): Response
    {
        $invoice = DB::table('invoices')
            ->join('clients', 'invoices.client_id', '=', 'clients.id')
            ->select('invoices.*', 'clients.name as client_name', 'clients.address as client_address')
            ->where('invoices.id', $id)
            ->first();
            
        if (!$invoice) abort(404);
        
        $lines = DB::table('invoice_lines')
            ->where('invoice_id', $id)
            ->get();
            
        $payments = DB::table('invoice_payments')
            ->join('accounts', 'invoice_payments.cash_account_id', '=', 'accounts.id')
            ->where('invoice_id', $id)
            ->select('invoice_payments.*', 'accounts.name as account_name')
            ->orderBy('paid_at', 'desc')
            ->get();
            
        return Inertia::render('Finance/Invoices/Show', [
            'invoice' => $invoice,
            'lines' => $lines,
            'payments' => $payments,
            'cashAccounts' => DB::table('accounts')->where('category', 'asset')->where('name', 'like', '%Kas%')->orWhere('name', 'like', '%Bank%')->get(),
        ]);
    }
    
    public function issue(Request $request, string $id)
    {
        try {
            $this->invoiceService->issue($id, auth()->id());
            
            activity()
                ->causedBy($request->user())
                ->event('issued')
                ->log("Menerbitkan tagihan ID $id");
                
            return back()->with('success', 'Tagihan berhasil diterbitkan.');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
    
    public function pay(Request $request, string $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'cash_account_id' => 'required|exists:accounts,id',
        ]);
        
        try {
            $this->invoiceService->pay($id, $validated['amount'], $validated['cash_account_id'], auth()->id());
            
            activity()
                ->causedBy($request->user())
                ->event('paid')
                ->log("Mencatat pembayaran tagihan ID $id sebesar {$validated['amount']}");
                
            return back()->with('success', 'Pembayaran berhasil dicatat.');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
    
    public function downloadPdf(string $id)
    {
        // This is a stub for PDF download using dompdf
        $invoice = DB::table('invoices')
            ->join('clients', 'invoices.client_id', '=', 'clients.id')
            ->select('invoices.*', 'clients.name as client_name', 'clients.address as client_address')
            ->where('invoices.id', $id)
            ->first();
            
        if (!$invoice) abort(404);
        
        $lines = DB::table('invoice_lines')->where('invoice_id', $id)->get();
        
        $pdf = Pdf::loadView('pdf.invoice', compact('invoice', 'lines'));
        return $pdf->download("Invoice-{$invoice->number}.pdf");
    }
}
