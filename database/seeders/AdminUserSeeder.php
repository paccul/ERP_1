<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
        * Run the database seeds.
        */
    public function run(): void
    {
        // First, ensure role exists. It should exist if RolePermissionSeeder ran.
        $role = Role::firstOrCreate(['name' => 'Administrator Sistem']);

        // Create the default admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@garda.local'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('P@ssw0rdProd!2026'), // Strong default password
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
        
        $admin->assignRole($role);

        $financeRole = Role::firstOrCreate(['name' => 'Staf Keuangan']);
        $financeStaff = User::firstOrCreate(
            ['email' => 'finance@garda.local'],
            [
                'name' => 'Staf Keuangan',
                'password' => Hash::make('P@ssw0rdProd!2026'),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );
        $financeStaff->assignRole($financeRole);
    }
}
