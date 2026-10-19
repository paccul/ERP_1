<?php

namespace App\Http\Controllers\PSB;

use App\Http\Controllers\Controller;
use App\Http\Requests\PSB\ApplicantRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class ApplicantController extends Controller
{
    public function index(): Response
    {
        $applicants = DB::table('applicants')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('PSB/Applicants/Index', [
            'applicants' => $applicants,
        ]);
    }

    public function create(): Response
    {
        // Generate registration number
        $year = date('Y');
        $month = date('m');
        $last = DB::table('applicants')->where('nik', 'like', "REG-$year$month-%")->count();
        $newRegNumber = "REG-$year$month-" . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
        
        return Inertia::render('PSB/Applicants/Form', [
            'applicant' => null,
            'defaultRegNumber' => $newRegNumber,
        ]);
    }

    public function store(ApplicantRequest $request)
    {
        $validated = $request->validated();
        
        $id = \Illuminate\Support\Str::uuid()->toString();
        
        DB::table('applicants')->insert(array_merge($validated, [
            'id' => $id,
            'status' => 'baru',
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Mendaftarkan pelamar baru ' . $validated['full_name']);
            
        return redirect()->route('psb.applicants.index')->with('success', 'Pelamar berhasil didaftarkan.');
    }

    public function edit(string $id): Response
    {
        $applicant = DB::table('applicants')->where('id', $id)->first();
        if (!$applicant) abort(404);
        
        return Inertia::render('PSB/Applicants/Form', [
            'applicant' => $applicant,
            'defaultRegNumber' => $applicant->nik,
        ]);
    }

    public function update(ApplicantRequest $request, string $id)
    {
        $validated = $request->validated();
        
        DB::table('applicants')
            ->where('id', $id)
            ->update(array_merge($validated, [
                'updated_at' => now(),
            ]));
        
        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log('Memperbarui data pelamar ' . $validated['full_name']);
            
        return redirect()->route('psb.applicants.index')->with('success', 'Data pelamar berhasil diperbarui.');
    }
    
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:baru,seleksi,diterima,ditolak',
            'notes' => 'nullable|string'
        ]);
        
        $applicant = DB::table('applicants')->where('id', $id)->first();
        if (!$applicant) abort(404);
        
        DB::table('applicants')
            ->where('id', $id)
            ->update([
                'status' => $validated['status'],
                'notes' => $validated['notes'],
                'updated_at' => now(),
            ]);
            
        // If diterima, redirect to personnel creation with applicant data
        if ($validated['status'] === 'diterima') {
            activity()
                ->causedBy($request->user())
                ->event('accepted')
                ->log('Menerima pelamar ' . $applicant->full_name);
                
            return redirect()->route('security.personnels.create', [
                'applicant_id' => $applicant->id,
            ])->with('success', 'Pelamar diterima. Silakan lengkapi data personel.');
        }
        
        activity()
            ->causedBy($request->user())
            ->event('status_updated')
            ->log('Mengubah status pelamar ' . $applicant->full_name . ' menjadi ' . $validated['status']);
            
        return redirect()->back()->with('success', 'Status pelamar berhasil diubah.');
    }
}
