<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            // Aset
            ['code' => '1001', 'name' => 'Kas / Bank', 'category' => 'asset', 'normal_balance' => 'debit', 'is_system' => true],
            ['code' => '1101', 'name' => 'Piutang Usaha', 'category' => 'asset', 'normal_balance' => 'debit', 'is_system' => true],
            
            // Liabilitas
            ['code' => '2101', 'name' => 'PPN Keluaran', 'category' => 'liability', 'normal_balance' => 'credit', 'is_system' => true],
            ['code' => '2102', 'name' => 'Utang Gaji', 'category' => 'liability', 'normal_balance' => 'credit', 'is_system' => true],
            ['code' => '2103', 'name' => 'Utang BPJS', 'category' => 'liability', 'normal_balance' => 'credit', 'is_system' => true],
            ['code' => '2104', 'name' => 'Utang PPh 21', 'category' => 'liability', 'normal_balance' => 'credit', 'is_system' => true],
            
            // Ekuitas
            ['code' => '3001', 'name' => 'Modal Disetor', 'category' => 'equity', 'normal_balance' => 'credit', 'is_system' => false],
            ['code' => '3101', 'name' => 'Laba Ditahan', 'category' => 'equity', 'normal_balance' => 'credit', 'is_system' => true],
            
            // Pendapatan
            ['code' => '4001', 'name' => 'Pendapatan Jasa Pengamanan', 'category' => 'revenue', 'normal_balance' => 'credit', 'is_system' => true],
            
            // Beban
            ['code' => '5001', 'name' => 'Beban Gaji Personel', 'category' => 'expense', 'normal_balance' => 'debit', 'is_system' => true],
            ['code' => '5002', 'name' => 'Beban Logistik & Perlengkapan', 'category' => 'expense', 'normal_balance' => 'debit', 'is_system' => true],
        ];

        foreach ($accounts as $account) {
            DB::table('accounts')->insertOrIgnore(array_merge($account, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
