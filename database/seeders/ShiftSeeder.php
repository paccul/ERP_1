<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shifts = [
            [
                'code' => 'S1',
                'name' => 'Pagi',
                'starts_at' => '07:00',
                'ends_at' => '15:00',
            ],
            [
                'code' => 'S2',
                'name' => 'Siang',
                'starts_at' => '15:00',
                'ends_at' => '23:00',
            ],
            [
                'code' => 'S3',
                'name' => 'Malam',
                'starts_at' => '23:00',
                'ends_at' => '07:00',
            ],
        ];

        foreach ($shifts as $shift) {
            DB::table('shifts')->insertOrIgnore(array_merge($shift, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
