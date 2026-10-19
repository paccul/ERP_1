<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Http\Requests\Security\PersonnelRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelController extends Controller
{
    public function index(): Response
    {
        $personnels = DB::table('personnel')
            ->orderBy('full_name')
            ->get();
            
        return Inertia::render('Security/Personnels/Index', [
            'personnels' => $personnels,
        ]);
    }

    public function create(\Illuminate\Http\Request $request): Response
    {
        $applicant_id = $request->query('applicant_id');
        $applicant = null;
        if ($applicant_id) {
            $applicant = DB::table('applicants')->where('id', $applicant_id)->first();
        }
        
        return Inertia::render('Security/Personnels/Form', [
            'personnel' => null,
            'applicant' => $applicant,
            'users' => DB::table('users')->select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(PersonnelRequest $request)
    {
        $validated = $request->validated();
        
        DB::table('personnel')->insert(array_merge($validated, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Menambahkan personel keamanan ' . $validated['full_name']);
            
        return redirect()->route('security.personnels.index')->with('success', 'Personel berhasil ditambahkan.');
    }

    public function edit(string $id): Response
    {
        $personnel = DB::table('personnel')->where('id', $id)->first();
        if (!$personnel) abort(404);
        
        return Inertia::render('Security/Personnels/Form', [
            'personnel' => $personnel,
            'users' => DB::table('users')->select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(PersonnelRequest $request, string $id)
    {
        $validated = $request->validated();
        
        DB::table('personnel')
            ->where('id', $id)
            ->update(array_merge($validated, [
                'updated_at' => now(),
            ]));
        
        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log('Memperbarui personel keamanan ' . $validated['full_name']);
            
        return redirect()->route('security.personnels.index')->with('success', 'Personel berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        DB::table('personnel')->where('id', $id)->delete();
        activity()->causedBy(request()->user())->event('deleted')->log('Menghapus personel keamanan');
        return redirect()->route('security.personnels.index')->with('success', 'Personel berhasil dihapus.');
    }
}
