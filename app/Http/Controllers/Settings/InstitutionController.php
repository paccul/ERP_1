<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateInstitutionRequest;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InstitutionController extends Controller
{
    public function edit(): Response
    {
        // Must have institution.view permission (handled by route middleware)
        $institution = DB::table('institution_settings')->first();
        
        // Let's get the organization units as well for the list view
        $orgUnits = DB::table('org_units')->orderBy('sort_order')->get();

        return Inertia::render('Settings/Institution/Edit', [
            'institution' => $institution,
            'orgUnits' => $orgUnits,
        ]);
    }

    public function visual(): Response
    {
        $orgUnits = DB::table('org_units')->get();
        return Inertia::render('Settings/Institution/OrgChart', [
            'orgUnits' => $orgUnits,
        ]);
    }

    public function update(UpdateInstitutionRequest $request)
    {
        $validated = $request->validated();
        $institution = DB::table('institution_settings')->first();

        if ($institution) {
            DB::table('institution_settings')
                ->where('id', $institution->id)
                ->update(array_merge($validated, ['updated_at' => now()]));
        } else {
            // Should be seeded by DemoSeeder, but just in case
            DB::table('institution_settings')->insert(array_merge($validated, [
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Log activity
        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log('Memperbarui identitas institusi');

        return redirect()->back()->with('success', 'Identitas institusi berhasil diperbarui.');
    }
}
