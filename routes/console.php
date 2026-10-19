<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:run')->dailyAt('01:00');

Schedule::call(function () {
    $expiredPersonnels = DB::table('personnel')
        ->where('status', 'active')
        ->whereNotNull('kta_expiry')
        ->where('kta_expiry', '<', now()->toDateString())
        ->get();
        
    foreach ($expiredPersonnels as $p) {
        Log::warning("KTA Personel Kedaluwarsa: NIK {$p->nik} - {$p->full_name}");
    }
})->dailyAt('08:00');
