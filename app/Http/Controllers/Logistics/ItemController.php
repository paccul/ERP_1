<?php

namespace App\Http\Controllers\Logistics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Logistics\StockService;
use Exception;

class ItemController extends Controller
{
    protected $stockService;
    
    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }
    
    public function index(): Response
    {
        $items = DB::table('items')
            ->orderBy('category')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('Logistics/Items/Index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:items,code|max:255',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'unit' => 'required|string|max:32',
            'size' => 'nullable|string|max:32',
            'min_stock' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);
        
        DB::table('items')->insert(array_merge($validated, [
            'stock_on_hand' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Mendaftarkan barang baru: ' . $validated['code']);
            
        return redirect()->back()->with('success', 'Barang berhasil ditambahkan.');
    }

    public function show(string $id): Response
    {
        $item = DB::table('items')->where('id', $id)->first();
        if (!$item) abort(404);
        
        $movements = DB::table('stock_movements')
            ->where('item_id', $id)
            ->orderBy('occurred_at', 'desc')
            ->orderBy('id', 'desc')
            ->get();
            
        return Inertia::render('Logistics/Items/Show', [
            'item' => $item,
            'movements' => $movements,
        ]);
    }
    
    public function update(Request $request, string $id)
    {
        $item = DB::table('items')->where('id', $id)->first();
        if (!$item) abort(404);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'unit' => 'required|string|max:32',
            'size' => 'nullable|string|max:32',
            'min_stock' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);
        
        DB::table('items')->where('id', $id)->update(array_merge($validated, [
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log('Memperbarui barang: ' . $item->code);
            
        return redirect()->back()->with('success', 'Data barang berhasil diperbarui.');
    }

    public function stockIn(Request $request, string $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'note' => 'nullable|string',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
        ]);
        
        try {
            $this->stockService->stockIn(
                $id,
                $validated['quantity'],
                $validated['note'] ?? 'Barang masuk',
                $validated['reference_type'] ?? null,
                $validated['reference_id'] ?? null
            );
            
            activity()
                ->causedBy($request->user())
                ->event('stock_in')
                ->log("Barang masuk untuk ID $id sebanyak {$validated['quantity']}");
                
            return redirect()->back()->with('success', 'Stok berhasil ditambahkan.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
    
    public function adjustStock(Request $request, string $id)
    {
        $validated = $request->validate([
            'difference' => 'required|numeric|not_in:0',
            'note' => 'required|string',
        ]);
        
        try {
            $this->stockService->adjustStock(
                $id,
                $validated['difference'],
                $validated['note']
            );
            
            activity()
                ->causedBy($request->user())
                ->event('stock_adjust')
                ->log("Penyesuaian stok opname untuk ID $id sebesar {$validated['difference']}");
                
            return redirect()->back()->with('success', 'Stok berhasil disesuaikan.');
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
