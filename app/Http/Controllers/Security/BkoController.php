<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BkoController extends Controller
{
    public function index(): Response
    {
        $requests = DB::table('bko_requests')
            ->join('personnel', 'bko_requests.personnel_id', '=', 'personnel.id')
            ->join('sites as from_site', 'bko_requests.from_site_id', '=', 'from_site.id')
            ->join('sites as to_site', 'bko_requests.to_site_id', '=', 'to_site.id')
            ->join('shifts', 'bko_requests.shift_id', '=', 'shifts.id')
            ->select(
                'bko_requests.*',
                'personnel.full_name as personnel_name',
                'from_site.name as from_site_name',
                'to_site.name as to_site_name',
                'shifts.name as shift_name'
            )
            ->orderBy('bko_requests.created_at', 'desc')
            ->get();
            
        return Inertia::render('Security/BKO/Index', [
            'requests' => $requests,
            'personnels' => DB::table('personnel')->where('status', 'active')->orderBy('full_name')->get(),
            'sites' => DB::table('sites')->where('status', 'active')->orderBy('name')->get(),
            'shifts' => DB::table('shifts')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnel,id',
            'from_site_id' => 'required|exists:sites,id',
            'to_site_id' => 'required|exists:sites,id|different:from_site_id',
            'shift_id' => 'required|exists:shifts,id',
            'starts_on' => 'required|date',
            'ends_on' => 'required|date|after_or_equal:starts_on',
            'reason' => 'nullable|string',
        ]);
        
        DB::table('bko_requests')->insert(array_merge($validated, [
            'status' => 'pending',
            'requested_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Mengajukan permohonan BKO personel');
            
        return redirect()->back()->with('success', 'Pengajuan BKO berhasil dibuat.');
    }
    
    public function approve(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'decision_note' => 'nullable|string',
        ]);
        
        $bko = DB::table('bko_requests')->where('id', $id)->first();
        if (!$bko) abort(404);
        
        DB::transaction(function () use ($bko, $validated) {
            DB::table('bko_requests')
                ->where('id', $bko->id)
                ->update([
                    'status' => $validated['status'],
                    'decided_by' => auth()->id(),
                    'decided_at' => now(),
                    'decision_note' => $validated['decision_note'],
                    'updated_at' => now(),
                ]);
                
            if ($validated['status'] === 'approved') {
                // Resolusi konflik otomatis:
                // 1. Hapus jadwal existing di rentang tanggal untuk personel ini
                DB::table('roster_assignments')
                    ->where('personnel_id', $bko->personnel_id)
                    ->whereBetween('date', [$bko->starts_on, $bko->ends_on])
                    ->delete();
                    
                // 2. Buat jadwal BKO baru
                $starts = \Carbon\Carbon::parse($bko->starts_on);
                $ends = \Carbon\Carbon::parse($bko->ends_on);
                
                $inserts = [];
                for ($d = $starts; $d->lte($ends); $d->addDay()) {
                    $inserts[] = [
                        'personnel_id' => $bko->personnel_id,
                        'site_id' => $bko->to_site_id,
                        'shift_id' => $bko->shift_id,
                        'date' => $d->toDateString(),
                        'source' => 'bko',
                        'bko_request_id' => $bko->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                
                DB::table('roster_assignments')->insert($inserts);
            }
        });
        
        activity()
            ->causedBy($request->user())
            ->event('status_updated')
            ->log('Merespons pengajuan BKO dengan status ' . $validated['status']);
            
        return redirect()->back()->with('success', 'Pengajuan BKO berhasil diproses.');
    }
}
