<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        $today = date('Y-m-d');
        
        $attendances = DB::table('attendances')
            ->join('roster_assignments', 'attendances.roster_assignment_id', '=', 'roster_assignments.id')
            ->join('personnel', 'roster_assignments.personnel_id', '=', 'personnel.id')
            ->join('sites', 'roster_assignments.site_id', '=', 'sites.id')
            ->where('roster_assignments.date', $today)
            ->select(
                'attendances.*',
                'personnel.full_name as personnel_name',
                'sites.name as location_name'
            )
            ->get();
            
        // Get user's active schedule for today (if they are a security personnel)
        $user = auth()->user();
        $mySchedule = null;
        
        if ($user) {
            $personnel = DB::table('personnel')->where('user_id', $user->id)->first();
            if ($personnel) {
                $mySchedule = DB::table('roster_assignments')
                    ->join('shifts', 'roster_assignments.shift_id', '=', 'shifts.id')
                    ->join('sites', 'roster_assignments.site_id', '=', 'sites.id')
                    ->where('roster_assignments.personnel_id', $personnel->id)
                    ->where('roster_assignments.date', $today)
                    ->select(
                        'roster_assignments.id',
                        'sites.name as location_name',
                        'sites.latitude',
                        'sites.longitude',
                        'shifts.name as shift_name',
                        'shifts.start_time',
                        'shifts.end_time'
                    )
                    ->first();
            }
        }
            
        return Inertia::render('Security/Attendances/Index', [
            'attendances' => $attendances,
            'mySchedule' => $mySchedule,
        ]);
    }

    public function checkIn(Request $request)
    {
        $validated = $request->validate([
            'roster_assignment_id' => 'required|exists:roster_assignments,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_path' => 'nullable|string', // Usually a file upload, but simplified here
        ]);
        
        // Ensure not already checked in
        $exists = DB::table('attendances')
            ->where('roster_assignment_id', $validated['roster_assignment_id'])
            ->exists();
            
        if ($exists) {
            throw ValidationException::withMessages([
                'roster_assignment_id' => 'Anda sudah melakukan check-in untuk jadwal ini.',
            ]);
        }
        
        $schedule = DB::table('roster_assignments')
            ->join('shifts', 'roster_assignments.shift_id', '=', 'shifts.id')
            ->where('roster_assignments.id', $validated['roster_assignment_id'])
            ->first();
            
        // Basic shift validation (late check)
        $now = now();
        $shiftStart = \Carbon\Carbon::parse($schedule->date . ' ' . $schedule->start_time);
        
        $status = 'present';
        if ($now->greaterThan($shiftStart->addMinutes(15))) {
            $status = 'late';
        }
        
        DB::table('attendances')->insert([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'roster_assignment_id' => $validated['roster_assignment_id'],
            'check_in_time' => $now,
            'check_in_latitude' => $validated['latitude'],
            'check_in_longitude' => $validated['longitude'],
            'check_in_photo' => $validated['photo_path'] ?? null,
            'status' => $status,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        return redirect()->back()->with('success', 'Check-in berhasil.');
    }

    public function checkOut(Request $request)
    {
        $validated = $request->validate([
            'roster_assignment_id' => 'required|exists:roster_assignments,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);
        
        $attendance = DB::table('attendances')
            ->where('roster_assignment_id', $validated['roster_assignment_id'])
            ->first();
            
        if (!$attendance) {
            throw ValidationException::withMessages([
                'roster_assignment_id' => 'Anda belum melakukan check-in.',
            ]);
        }
        
        if ($attendance->check_out_time) {
            throw ValidationException::withMessages([
                'roster_assignment_id' => 'Anda sudah melakukan check-out.',
            ]);
        }
        
        DB::table('attendances')
            ->where('id', $attendance->id)
            ->update([
                'check_out_time' => now(),
                'check_out_latitude' => $validated['latitude'],
                'check_out_longitude' => $validated['longitude'],
                'updated_at' => now(),
            ]);
            
        return redirect()->back()->with('success', 'Check-out berhasil.');
    }
}
