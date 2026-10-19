<?php

use App\Enums\ApplicantStatus;
use App\Enums\BkoStatus;
use App\Enums\GadaLevel;
use App\Enums\Gender;
use App\Enums\PersonnelStatus;
use App\Enums\RosterSource;
use App\Support\Database\SchemaConstraints;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->unique();
            $table->string('full_name');
            $table->date('birth_date')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->enum('status', array_column(ApplicantStatus::cases(), 'value'))->default(ApplicantStatus::New->value);
            $table->dateTime('test_scheduled_at')->nullable();
            $table->text('reviewer_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });

        Schema::create('personnel', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->unique();
            $table->string('full_name');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', array_column(Gender::cases(), 'value'))->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('kta_number')->nullable();
            $table->date('kta_expires_at')->nullable();
            $table->enum('gada_level', array_column(GadaLevel::cases(), 'value'))->nullable();
            $table->string('gada_cert_number')->nullable();
            $table->string('position')->nullable();
            $table->date('joined_at')->nullable();
            $table->enum('status', array_column(PersonnelStatus::cases(), 'value'))->default(PersonnelStatus::Active->value);
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('ptkp_status', 8)->default('TK/0');
            $table->decimal('base_salary', 18, 2)->default('0.00');
            $table->decimal('allowance', 18, 2)->default('0.00');
            $table->foreignId('applicant_id')->nullable()->unique()->constrained('applicants')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'site_id']);
            $table->index('kta_expires_at');
        });

        SchemaConstraints::check('personnel', 'personnel_salary_non_negative', 'base_salary >= 0 AND allowance >= 0', ['base_salary', 'allowance']);

        Schema::create('bko_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnel')->restrictOnDelete();
            $table->foreignId('from_site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('to_site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->date('starts_on');
            $table->date('ends_on');
            $table->text('reason')->nullable();
            $table->enum('status', array_column(BkoStatus::cases(), 'value'))->default(BkoStatus::Pending->value);
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('decided_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamps();

            $table->index(['status', 'starts_on']);
        });

        SchemaConstraints::check('bko_requests', 'bko_requests_period_valid', 'ends_on >= starts_on', ['ends_on', 'starts_on']);
        SchemaConstraints::check('bko_requests', 'bko_requests_sites_differ', 'from_site_id <> to_site_id', ['from_site_id', 'to_site_id']);

        Schema::create('roster_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personnel_id')->constrained('personnel')->restrictOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->date('date');
            $table->enum('source', array_column(RosterSource::cases(), 'value'))->default(RosterSource::Plot->value);
            $table->foreignId('bko_request_id')->nullable()->constrained('bko_requests')->nullOnDelete();
            $table->timestamps();

            $table->unique(['personnel_id', 'date', 'shift_id']);
            $table->index(['site_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roster_assignments');
        Schema::dropIfExists('bko_requests');
        Schema::dropIfExists('personnel');
        Schema::dropIfExists('applicants');
    }
};
