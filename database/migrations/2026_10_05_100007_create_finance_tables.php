<?php

use App\Enums\InvoiceStatus;
use App\Enums\PayrollStatus;
use App\Support\Database\SchemaConstraints;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->string('period', 7); // YYYY-MM
            $table->date('issued_at')->nullable();
            $table->date('due_at')->nullable();
            $table->enum('status', array_column(InvoiceStatus::cases(), 'value'))->default(InvoiceStatus::Draft->value);
            $table->decimal('subtotal', 18, 2)->default('0.00');
            $table->decimal('vat_rate', 5, 2)->default('0.00');
            $table->decimal('vat_amount', 18, 2)->default('0.00');
            $table->decimal('total', 18, 2)->default('0.00');
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index(['status', 'due_at']);
        });

        SchemaConstraints::check(
            'invoices',
            'invoices_amounts_valid',
            'subtotal >= 0 AND vat_amount >= 0 AND total >= 0 AND vat_rate BETWEEN 0 AND 100',
            ['subtotal', 'vat_amount', 'total', 'vat_rate'],
        );

        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->string('description');
            $table->unsignedInteger('guards');
            $table->decimal('rate', 18, 2);
            $table->decimal('amount', 18, 2);
            $table->timestamps();

            $table->index('invoice_id');
            $table->index('site_id');
        });

        SchemaConstraints::check('invoice_lines', 'invoice_lines_amount_matches', 'rate >= 0 AND ROUND(guards * rate, 2) = amount', ['guards', 'rate', 'amount']);

        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->restrictOnDelete();
            $table->date('paid_at');
            $table->decimal('amount', 18, 2);
            $table->foreignId('cash_account_id')->constrained('accounts')->restrictOnDelete();
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('invoice_id');
        });

        // Total pembayaran <= total invoice dijaga InvoiceService dengan lockForUpdate (butuh agregasi lintas tabel).
        SchemaConstraints::check('invoice_payments', 'invoice_payments_amount_positive', 'amount > 0', ['amount']);

        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->string('period', 7); // YYYY-MM
            $table->foreignId('site_id')->constrained('sites')->restrictOnDelete();
            $table->enum('status', array_column(PayrollStatus::cases(), 'value'))->default(PayrollStatus::Draft->value);
            $table->foreignId('journal_entry_id')->nullable()->constrained('journal_entries')->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['period', 'site_id']);
        });

        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('personnel_id')->constrained('personnel')->restrictOnDelete();
            $table->decimal('base_salary', 18, 2)->default('0.00');
            $table->decimal('allowance', 18, 2)->default('0.00');
            $table->decimal('overtime', 18, 2)->default('0.00');
            $table->decimal('bpjs_kes', 18, 2)->default('0.00');
            $table->decimal('bpjs_tk', 18, 2)->default('0.00');
            $table->decimal('pph21', 18, 2)->default('0.00');
            $table->decimal('net_pay', 18, 2)->default('0.00');
            $table->timestamps();

            $table->unique(['payroll_run_id', 'personnel_id']);
            $table->index('personnel_id');
        });

        SchemaConstraints::check(
            'payslips',
            'payslips_amounts_non_negative',
            'base_salary >= 0 AND allowance >= 0 AND overtime >= 0 AND bpjs_kes >= 0 AND bpjs_tk >= 0 AND pph21 >= 0 AND net_pay >= 0',
            ['base_salary', 'allowance', 'overtime', 'bpjs_kes', 'bpjs_tk', 'pph21', 'net_pay'],
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('invoice_payments');
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('invoices');
    }
};
