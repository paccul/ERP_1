<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define Modules & Permissions
        $modules = [
            'security',
            'recruitment',
            'logistics',
            'finance',
            'accounting',
            'reports',
            'users',
            'institution'
        ];

        $permissions = [];
        foreach ($modules as $module) {
            $permissions[] = $module . '.view';
            $permissions[] = $module . '.manage';
        }

        // 2. Create Permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 3. Define Roles & Their Permissions
        $roles = [
            'Administrator Sistem' => $permissions, // All permissions
            
            'Manajer Operasional' => [
                'security.view', 'security.manage',
            ],
            
            'Staf Rekrutmen' => [
                'recruitment.view', 'recruitment.manage',
                'security.view', // Can view personnel to convert candidates
            ],
            
            'Staf Logistik' => [
                'logistics.view', 'logistics.manage',
            ],
            
            'Staf Keuangan' => [
                'finance.view', 'finance.manage',
            ],
            
            'Akuntan' => [
                'accounting.view', 'accounting.manage',
                'reports.view', 'reports.manage',
            ],
            
            'Direksi' => [
                'reports.view',
            ],
        ];

        // 4. Create Roles and Assign Permissions
        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }
    }
}
