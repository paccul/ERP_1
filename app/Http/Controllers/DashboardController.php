<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        
        // 5 summary cards
        // 1. Personel Aktif
        $activePersonnel = DB::table('personnel')->where('status', 'active')->count();
        
        // 2. Lokasi Aktif
        $activeSites = DB::table('sites')->where('status', 'active')->count();
        
        // 3. Permohonan BKO Pending
        $pendingBko = DB::table('bko_requests')->where('status', 'pending')->count();
        
        // 4. Piutang Jatuh Tempo
        $overdueInvoices = DB::table('invoices')
            ->where('status', 'issued')
            ->where('due_at', '<', now()->toDateString())
            ->count();
            
        // 5. Stok Logistik Menipis
        $lowStockItems = DB::table('items')
            ->whereRaw('stock_on_hand <= min_stock')
            ->count();
            
        // Role permissions
        // Let's assume roles logic or simplified permission checks
        // We will just pass the values and let frontend conditionally render them if user has permission
        // Using spatie/laravel-permission style
        
        return Inertia::render('Dashboard', [
            'metrics' => [
                'active_personnel' => $activePersonnel,
                'active_sites' => $activeSites,
                'pending_bko' => $pendingBko,
                'overdue_invoices' => $overdueInvoices,
                'low_stock_items' => $lowStockItems,
            ],
            'permissions' => [
                'can_view_personnel' => $user->can('security.view'),
                'can_view_sites' => $user->can('security.view'),
                'can_view_bko' => $user->can('security.view'),
                'can_view_finance' => $user->can('finance.view'),
                'can_view_logistics' => $user->can('logistics.view'),
            ]
        ]);
    }
}
