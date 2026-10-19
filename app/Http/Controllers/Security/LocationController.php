<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Http\Requests\Security\LocationRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(): Response
    {
        $locations = DB::table('sites')
            ->orderBy('name')
            ->get()
            ->map(function ($site) {
                $site->is_active = ($site->status ?? 'active') === 'active';
                return $site;
            });
            
        return Inertia::render('Security/Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(LocationRequest $request)
    {
        $validated = $request->validated();
        
        DB::table('sites')->insert(array_merge(\Illuminate\Support\Arr::except($validated, ['is_active']), [
            'status' => ($validated['is_active'] ?? true) ? 'active' : 'inactive',
            'client_id' => $validated['client_id'] ?? 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Menambahkan lokasi jaga ' . $validated['name']);
            
        return redirect()->back()->with('success', 'Lokasi berhasil ditambahkan.');
    }

    public function update(LocationRequest $request, string $id)
    {
        $validated = $request->validated();
        
        DB::table('sites')
            ->where('id', $id)
            ->update(array_merge(\Illuminate\Support\Arr::except($validated, ['is_active']), [
                'status' => ($validated['is_active'] ?? true) ? 'active' : 'inactive',
                'updated_at' => now(),
            ]));
        
        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log('Memperbarui lokasi jaga ' . $validated['name']);
            
        return redirect()->back()->with('success', 'Lokasi berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        DB::table('sites')->where('id', $id)->delete();
        activity()->causedBy(request()->user())->event('deleted')->log('Menghapus lokasi / pos keamanan');
        return redirect()->route('security.locations.index')->with('success', 'Lokasi berhasil dihapus.');
    }
}




