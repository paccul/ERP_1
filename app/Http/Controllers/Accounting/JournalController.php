<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Accounting\JournalPostingService;
use Exception;

class JournalController extends Controller
{
    protected $postingService;
    
    public function __construct(JournalPostingService $postingService)
    {
        $this->postingService = $postingService;
    }
    
    public function index(): Response
    {
        $journals = DB::table('journal_entries')
            ->orderBy('date', 'desc')
            ->orderBy('number', 'desc')
            ->get();
            
        return Inertia::render('Accounting/Journals/Index', [
            'journals' => $journals,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Accounting/Journals/Form', [
            'accounts' => DB::table('accounts')->where('is_active', true)->orderBy('code')->get(),
            'sites' => DB::table('sites')->where('status', 'active')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
            'lines.*.memo' => 'nullable|string|max:255',
            'lines.*.site_id' => 'nullable|exists:sites,id',
        ]);
        
        DB::beginTransaction();
        try {
            $year = date('Y', strtotime($validated['date']));
            $month = date('m', strtotime($validated['date']));
            $last = DB::table('journal_entries')->where('number', 'like', "JU-$year$month-%")->count();
            $number = "JU-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
            
            $journalId = DB::table('journal_entries')->insertGetId([
                'number' => $number,
                'date' => $validated['date'],
                'reference' => $validated['reference'],
                'description' => $validated['description'],
                'source_type' => 'manual',
                'status' => 'draft',
                'created_by' => auth()->id(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $linesData = [];
            foreach ($validated['lines'] as $line) {
                if ($line['debit'] == 0 && $line['credit'] == 0) continue;
                
                $linesData[] = [
                    'journal_entry_id' => $journalId,
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'],
                    'credit' => $line['credit'],
                    'memo' => $line['memo'] ?? null,
                    'site_id' => $line['site_id'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (empty($linesData)) {
                throw new Exception("Jurnal harus memiliki baris transaksi.");
            }
            
            DB::table('journal_lines')->insert($linesData);
            
            DB::commit();
            
            activity()
                ->causedBy($request->user())
                ->event('created')
                ->log('Membuat draft jurnal ' . $number);
                
            return redirect()->route('journals.show', $journalId)->with('success', 'Draft Jurnal berhasil dibuat.');
        } catch (Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function show(string $id): Response
    {
        $journal = DB::table('journal_entries')->where('id', $id)->first();
        if (!$journal) abort(404);
        
        $lines = DB::table('journal_lines')
            ->join('accounts', 'journal_lines.account_id', '=', 'accounts.id')
            ->leftJoin('sites', 'journal_lines.site_id', '=', 'sites.id')
            ->where('journal_entry_id', $id)
            ->select('journal_lines.*', 'accounts.code as account_code', 'accounts.name as account_name', 'sites.name as site_name')
            ->get();
            
        return Inertia::render('Accounting/Journals/Show', [
            'journal' => $journal,
            'lines' => $lines,
        ]);
    }
    
    public function post(Request $request, string $id)
    {
        try {
            $this->postingService->post($id);
            
            activity()
                ->causedBy($request->user())
                ->event('posted')
                ->log('Membukukan jurnal ID ' . $id);
                
            return back()->with('success', 'Jurnal berhasil dibukukan (posted).');
        } catch (\App\Services\Accounting\UnbalancedJournalException $e) {
            return back()->with('error', 'Gagal membukukan: ' . $e->getMessage());
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
    
    public function reverse(Request $request, string $id)
    {
        try {
            $reversalId = $this->postingService->reverse($id, auth()->id());
            
            activity()
                ->causedBy($request->user())
                ->event('reversed')
                ->log('Melakukan auto-reversal pada jurnal ID ' . $id);
                
            return redirect()->route('journals.show', $reversalId)->with('success', 'Jurnal pembalik berhasil dibuat dan dibukukan.');
        } catch (Exception $e) {
            return back()->with('error', 'Gagal membalik jurnal: ' . $e->getMessage());
        }
    }
}
