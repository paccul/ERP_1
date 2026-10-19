<?php

use App\Enums\SiteStatus;
use App\Support\Database\SchemaConstraints;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('npwp')->nullable();
            $table->text('billing_address')->nullable();
            $table->string('pic_name')->nullable();
            $table->string('pic_phone')->nullable();
            $table->string('pic_email')->nullable();
            $table->date('contract_ends_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->string('name');
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedSmallInteger('guards_per_shift')->default(1);
            $table->decimal('monthly_rate_per_guard', 18, 2)->default('0.00');
            $table->enum('status', array_column(SiteStatus::cases(), 'value'))->default(SiteStatus::Active->value);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['client_id', 'status']);
        });

        SchemaConstraints::check('sites', 'sites_guards_per_shift_min_one', 'guards_per_shift >= 1', ['guards_per_shift']);
        SchemaConstraints::check('sites', 'sites_rate_non_negative', 'monthly_rate_per_guard >= 0', ['monthly_rate_per_guard']);
        SchemaConstraints::check(
            'sites',
            'sites_coordinates_valid',
            '(latitude IS NULL OR latitude BETWEEN -90 AND 90) AND (longitude IS NULL OR longitude BETWEEN -180 AND 180)',
            ['latitude', 'longitude'],
        );

        Schema::create('checkpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->unsignedSmallInteger('sequence');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['site_id', 'sequence']);
        });

        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
        Schema::dropIfExists('checkpoints');
        Schema::dropIfExists('sites');
        Schema::dropIfExists('clients');
    }
};
