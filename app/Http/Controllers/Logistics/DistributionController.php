<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Logistics\DistributionService;
use App\Enums\RecipientType;
use Exception;

class DistributionController extends Controller
{
    protected $distributionService;
    
    public function __construct(DistributionService $distributionService)
    {
        $this->distributionService = $distributionService;
    }
    
    public function index(): Response
    {
        $distributions = DB::table('distributions')
            ->orderBy('distributed_at', 'desc')
            ->orderBy('id', 'desc')
            ->get();
            
        return Inertia::render('Logistics/Distributions/Index', [
            'distributions' => $distributions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Logistics/Distributions/Form', [
            'items' => DB::table('items')->where('stock_on_hand', '>', 0)->orderBy('name')->get(),
            'personnels' => DB::table('personnel')->where('status', 'active')->orderBy('full_name')->get(),
            'sites' => DB::table('sites')->where('status', 'active')->orderBy('name')->get(),
            'recipientTypes' => array_column(RecipientType::cases(), 'value'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_type' => 'required|string|in:personnel,site,client',
            'recipient_id' => 'required|integer',
            'note' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.item_id' => 'required|exists:items,id',
            'lines.*.quantity' => 'required|numeric|min:0.01',
        ]);
        
        try {
            $distId = $this->distributionService->distribute(
                $validated['recipient_type'],
                $validated['recipient_id'],
                $validated['lines'],
                $validated['note'] ?? '',
                auth()->id()
            );
            
            activity()
                ->causedBy($request->user())
                ->event('created')
                ->log("Membuat distribusi logistik ID $distId ke " . $validated['recipient_type']);
                
            return redirect()->route('logistics.distributions.show', $distId)->with('success', 'Distribusi berhasil dicatat.');
        } catch (Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }
    
    public function show(string $id): Response
    {
        $distribution = DB::table('distributions')->where('id', $id)->first();
        if (!$distribution) abort(404);
        
        $lines = DB::table('distribution_lines')
            ->join('items', 'distribution_lines.item_id', '=', 'items.id')
            ->where('distribution_id', $id)
            ->select('distribution_lines.*', 'items.code', 'items.name', 'items.unit')
            ->get();
            
        // Fetch recipient name
        $recipientName = 'Unknown';
        if ($distribution->recipient_type === 'personnel') {
            $rec = DB::table('personnel')->where('id', $distribution->recipient_id)->first();
            if ($rec) $recipientName = $rec->full_name;
        } elseif ($distribution->recipient_type === 'site') {
            $rec = DB::table('sites')->where('id', $distribution->recipient_id)->first();
            if ($rec) $recipientName = $rec->name;
        } elseif ($distribution->recipient_type === 'client') {
            $rec = DB::table('clients')->where('id', $distribution->recipient_id)->first();
            if ($rec) $recipientName = $rec->name;
        }
            
        return Inertia::render('Logistics/Distributions/Show', [
            'distribution' => $distribution,
            'lines' => $lines,
            'recipientName' => $recipientName,
        ]);
    }
}
