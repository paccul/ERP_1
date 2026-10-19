<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('org_units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title')->nullable();
            // Siklus parent_id dicegah di OrgUnitService, bukan di database.
            $table->foreignId('parent_id')->nullable()->constrained('org_units')->restrictOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['parent_id', 'sort_order']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('password');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('is_active');
        });

        Schema::dropIfExists('org_units');
    }
};
