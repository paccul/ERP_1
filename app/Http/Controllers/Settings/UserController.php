<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')
            ->select('id', 'name', 'email', 'is_active', 'created_at')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('Settings/Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Settings/Users/Form', [
            'user' => null,
            'roles' => Role::pluck('name'),
        ]);
    }

    public function store(UserRequest $request)
    {
        $validated = $request->validated();
        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);
        
        $user->syncRoles($validated['roles']);
        
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->event('created')
            ->log('Menambahkan pengguna baru');
            
        return redirect()->route('settings.users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(string $id): Response
    {
        $user = User::with('roles')->findOrFail($id);
        
        return Inertia::render('Settings/Users/Form', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'roles' => $user->roles->pluck('name'),
            ],
            'roles' => Role::pluck('name'),
        ]);
    }

    public function update(UserRequest $request, string $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validated();
        
        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ];
        
        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }
        
        $user->update($data);
        $user->syncRoles($validated['roles']);
        
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->event('updated')
            ->log('Memperbarui data pengguna');
            
        return redirect()->route('settings.users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Tidak dapat menonaktifkan akun sendiri.');
        }
        
        // As per PRD, users are deactivated, not deleted. But the UI might have a delete button.
        $user->update(['is_active' => false]);
        
        activity()
            ->causedBy(auth()->user())
            ->performedOn($user)
            ->event('deactivated')
            ->log('Menonaktifkan pengguna');
            
        return back()->with('success', 'Pengguna berhasil dinonaktifkan.');
    }
}
