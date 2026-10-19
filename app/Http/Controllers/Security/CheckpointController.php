<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CheckpointController extends Controller
{
    public function index(): Response
    {
        $checkpoints = DB::table('checkpoints')
            ->join('sites', 'checkpoints.site_id', '=', 'sites.id')
            ->select('checkpoints.*', 'sites.name as site_name')
            ->orderBy('sites.name')
            ->orderBy('checkpoints.sequence')
            ->get();
            
        return Inertia::render('Security/Checkpoints/Index', [
            'checkpoints' => $checkpoints,
            'sites' => DB::table('sites')->where('status', 'active')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'code' => 'required|string|unique:checkpoints,code|max:255',
            'name' => 'required|string|max:255',
            'sequence' => 'required|integer|min:1',
        ]);
        
        DB::table('checkpoints')->insert(array_merge($validated, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));
        
        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log('Menambahkan master checkpoint ' . $validated['code']);
            
        return redirect()->back()->with('success', 'Checkpoint berhasil ditambahkan.');
    }
}
