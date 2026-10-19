<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->input('month', date('Y-m'));
        
        // SEC-05 & SEC-06 logic: Monthly Attendance & Overtime
        $reports = DB::table('attendances')
            ->join('roster_assignments', 'attendances.roster_assignment_id', '=', 'roster_assignments.id')
            ->join('personnel', 'roster_assignments.personnel_id', '=', 'personnel.id')
            ->where('roster_assignments.date', 'like', $month . '%')
            ->select(
                'personnel.id',
                'personnel.full_name as personnel_name',
                DB::raw('COUNT(attendances.id) as total_attendance'),
                DB::raw('SUM(CASE WHEN attendances.status = "late" THEN 1 ELSE 0 END) as total_late'),
                DB::raw('SUM(CASE WHEN attendances.status = "absent" THEN 1 ELSE 0 END) as total_absent'),
                DB::raw('SUM(attendances.overtime_hours) as total_overtime_hours')
            )
            ->groupBy('personnel.id', 'personnel.full_name')
            ->get();
            
        return Inertia::render('Security/Reports/Index', [
            'reports' => $reports,
            'currentMonth' => $month,
        ]);
    }
}
