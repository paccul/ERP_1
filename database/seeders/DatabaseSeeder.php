<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        if (\Illuminate\Support\Facades\App::environment('production')) {
            $this->call([
                RolePermissionSeeder::class,
                ChartOfAccountsSeeder::class,
                ShiftSeeder::class,
                AdminUserSeeder::class,
            ]);
        } else {
            $this->call([
                RolePermissionSeeder::class,
                ChartOfAccountsSeeder::class,
                ShiftSeeder::class,
                AdminUserSeeder::class,
                DemoSeeder::class,
            ]);
        }
    }
}
