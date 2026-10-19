<?php

use App\Support\Database\SchemaConstraints;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institution_settings', function (Blueprint $table) {
            // Tepat satu baris: id dikunci ke 1 oleh constraint di bawah.
            $table->unsignedBigInteger('id')->primary();
            $table->string('name');
            $table->string('license_number')->nullable();
            $table->string('npwp')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('logo_path')->nullable();
            $table->decimal('vat_rate', 5, 2)->default('11.00');
            $table->decimal('bpjs_kes_rate', 5, 2)->default('1.00');
            $table->decimal('bpjs_tk_rate', 5, 2)->default('2.00');
            $table->decimal('overtime_hourly_rate', 18, 2)->default('0.00');
            $table->json('bsc_targets')->nullable();
            $table->timestamps();
        });

        SchemaConstraints::check('institution_settings', 'institution_settings_single_row', 'id = 1', ['id']);
        SchemaConstraints::check(
            'institution_settings',
            'institution_settings_rates_valid',
            'vat_rate BETWEEN 0 AND 100 AND bpjs_kes_rate BETWEEN 0 AND 100 AND bpjs_tk_rate BETWEEN 0 AND 100 AND overtime_hourly_rate >= 0',
            ['vat_rate', 'bpjs_kes_rate', 'bpjs_tk_rate', 'overtime_hourly_rate'],
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('institution_settings');
    }
};
