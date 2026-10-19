<?php

use App\Enums\AccountCategory;
use App\Enums\CashFlowGroup;
use App\Enums\JournalStatus;
use App\Enums\NormalBalance;
use App\Support\Database\SchemaConstraints;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('category', array_column(AccountCategory::cases(), 'value'));
            $table->enum('normal_balance', array_column(NormalBalance::cases(), 'value'));
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->restrictOnDelete();
            $table->enum('cash_flow_group', array_column(CashFlowGroup::cases(), 'value'))->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('parent_id');
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->date('date');
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->enum('status', array_column(JournalStatus::cases(), 'value'))->default(JournalStatus::Draft->value);
            $table->dateTime('posted_at')->nullable();
            // unique: satu jurnal hanya bisa dibalik satu kali.
            $table->foreignId('reversal_of_id')->nullable()->unique()->constrained('journal_entries')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'date']);
            $table->index(['source_type', 'source_id']);
        });

        Schema::create('journal_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained('journal_entries')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->decimal('debit', 18, 2)->default('0.00');
            $table->decimal('credit', 18, 2)->default('0.00');
            $table->string('memo')->nullable();
            $table->foreignId('site_id')->nullable()->constrained('sites')->restrictOnDelete();
            $table->timestamps();

            $table->index(['account_id', 'journal_entry_id']);
            $table->index('site_id');
        });

        SchemaConstraints::check(
            'journal_lines',
            'journal_lines_single_side_amount',
            'debit >= 0 AND credit >= 0 AND ((debit = 0) <> (credit = 0))',
            ['debit', 'credit'],
        );
        SchemaConstraints::balancedPostedJournals();
    }

    public function down(): void
    {
        SchemaConstraints::dropBalancedPostedJournals();
        Schema::dropIfExists('journal_lines');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('accounts');
    }
};
