<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->input('month', date('Y-m'));
        
        $schedules = DB::table('roster_assignments')
            ->join('personnel', 'roster_assignments.personnel_id', '=', 'personnel.id')
            ->join('sites', 'roster_assignments.site_id', '=', 'sites.id')
            ->join('shifts', 'roster_assignments.shift_id', '=', 'shifts.id')
            ->where('roster_assignments.date', 'like', $month . '%')
            ->select(
                'roster_assignments.*',
                'personnel.full_name as personnel_name',
                'sites.name as location_name',
                'shifts.name as shift_name',
                'shifts.start_time',
                'shifts.end_time'
            )
            ->get();
            
        return Inertia::render('Security/Schedules/Index', [
            'schedules' => $schedules,
            'currentMonth' => $month,
            'personnels' => DB::table('personnel')->where('status', 'active')->get(),
            'locations' => DB::table('sites')->where('status', 'active')->get(),
            'shifts' => DB::table('shifts')->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnel,id',
            'site_id' => 'required|exists:sites,id',
            'shift_id' => 'required|exists:shifts,id',
            'date' => 'required|date',
        ]);
        
        // Conflict validation
        $conflict = DB::table('roster_assignments')
            ->where('personnel_id', $validated['personnel_id'])
            ->where('date', $validated['date'])
            ->exists();
            
        if ($conflict) {
            throw ValidationException::withMessages([
                'date' => 'Personel sudah memiliki jadwal pada tanggal tersebut.',
            ]);
        }
        
        DB::table('roster_assignments')->insert(array_merge($validated, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Membuat jadwal jaga');
            
        return redirect()->back()->with('success', 'Jadwal berhasil ditambahkan.');
    }
}
