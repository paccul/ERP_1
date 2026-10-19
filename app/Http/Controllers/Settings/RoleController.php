<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\RoleRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::withCount('users', 'permissions')->orderBy('name')->get();
        return Inertia::render('Settings/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    private function getGroupedPermissions()
    {
        // Group permissions by their prefix (e.g. 'users.view' -> 'users')
        $permissions = Permission::orderBy('name')->get();
        $grouped = [];
        
        foreach ($permissions as $p) {
            $parts = explode('.', $p->name);
            $module = $parts[0];
            $action = $parts[1] ?? 'other';
            
            if (!isset($grouped[$module])) {
                $grouped[$module] = [
                    'module' => $module,
                    'permissions' => []
                ];
            }
            
            $grouped[$module]['permissions'][] = [
                'id' => $p->id,
                'name' => $p->name,
                'action' => $action,
            ];
        }
        
        return array_values($grouped);
    }

    public function create(): Response
    {
        return Inertia::render('Settings/Roles/Form', [
            'role' => null,
            'permissionGroups' => $this->getGroupedPermissions(),
        ]);
    }

    public function store(RoleRequest $request)
    {
        $validated = $request->validated();
        
        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
        ]);
        
        $role->syncPermissions($validated['permissions']);
        
        activity()
            ->causedBy($request->user())
            ->performedOn($role)
            ->event('created')
            ->log('Membuat role baru');
            
        return redirect()->route('settings.roles.index')->with('success', 'Role berhasil dibuat.');
    }

    public function edit(string $id): Response
    {
        $role = Role::with('permissions')->findOrFail($id);
        
        return Inertia::render('Settings/Roles/Form', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->pluck('name'),
            ],
            'permissionGroups' => $this->getGroupedPermissions(),
        ]);
    }

    public function update(RoleRequest $request, string $id)
    {
        $role = Role::findOrFail($id);
        
        // Prevent editing superadmin if we had logic for it, but for now we assume they are editable except name maybe
        if ($role->name === 'superadmin' && $request->user()->hasRole('superadmin')) {
            // Usually we prevent editing core roles, but let's just allow for now or skip name update
            $validated = $request->except('name'); // keep original name
        } else {
            $validated = $request->validated();
        }
        
        $role->update([
            'description' => $validated['description'] ?? $role->description,
        ]);
        
        // Only update name if it was validated and passed
        if (isset($validated['name'])) {
            $role->name = $validated['name'];
            $role->save();
        }
        
        $role->syncPermissions($validated['permissions'] ?? $request->input('permissions', []));
        
        activity()
            ->causedBy($request->user())
            ->performedOn($role)
            ->event('updated')
            ->log('Memperbarui role');
            
        return redirect()->route('settings.roles.index')->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $role = Role::withCount('users')->findOrFail($id);
        
        if ($role->name === 'superadmin') {
            return back()->with('error', 'Role superadmin tidak dapat dihapus.');
        }
        
        if ($role->users_count > 0) {
            return back()->with('error', 'Role masih digunakan oleh ' . $role->users_count . ' pengguna.');
        }
        
        $role->delete();
        
        activity()
            ->causedBy(auth()->user())
            ->event('deleted')
            ->log('Menghapus role ' . $role->name);
            
        return back()->with('success', 'Role berhasil dihapus.');
    }
}
