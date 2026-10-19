<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Menyemai skenario transaksi 12 bulan untuk validasi integritas laporan keuangan.
        
        $institutionId = DB::table('institution_settings')->insertGetId([
            'id' => 1,
            'name' => 'PT Garda Security',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $clientId = DB::table('clients')->insertGetId([
            'name' => 'PT Demo Klien',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $siteId = DB::table('sites')->insertGetId([
            'client_id' => $clientId,
            'name' => 'Pabrik Cikarang',
            'guards_per_shift' => 10,
            'monthly_rate_per_guard' => 5000000.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // We will seed 1 year of invoices and payrolls later during module implementation testing.
        // For now, this is a placeholder structure.
    }
}
