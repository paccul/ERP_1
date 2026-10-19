<?php

use App\Enums\RecipientType;
use App\Enums\StockMovementType;
use App\Support\Database\SchemaConstraints;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('unit', 32);
            $table->string('size', 32)->nullable();
            $table->decimal('min_stock', 12, 2)->default('0.00');
            $table->decimal('unit_price', 18, 2)->default('0.00');
            $table->decimal('stock_on_hand', 12, 2)->default('0.00');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
        });

        SchemaConstraints::check('items', 'items_stock_non_negative', 'stock_on_hand >= 0', ['stock_on_hand']);
        SchemaConstraints::check('items', 'items_amounts_non_negative', 'min_stock >= 0 AND unit_price >= 0', ['min_stock', 'unit_price']);

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->restrictOnDelete();
            $table->enum('type', array_column(StockMovementType::cases(), 'value'));
            // in/out selalu positif; adjust bertanda (selisih opname) dan tidak boleh nol.
            $table->decimal('quantity', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->dateTime('occurred_at');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['item_id', 'occurred_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        SchemaConstraints::check(
            'stock_movements',
            'stock_movements_quantity_valid',
            "((type = 'adjust' AND quantity <> 0) OR (type <> 'adjust' AND quantity > 0)) AND balance_after >= 0",
            ['type', 'quantity', 'balance_after'],
        );
        SchemaConstraints::appendOnly('stock_movements');

        Schema::create('distributions', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->dateTime('distributed_at');
            $table->enum('recipient_type', array_column(RecipientType::cases(), 'value'));
            $table->unsignedBigInteger('recipient_id');
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['recipient_type', 'recipient_id']);
        });

        Schema::create('distribution_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('distribution_id')->constrained('distributions')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->restrictOnDelete();
            $table->decimal('quantity', 12, 2);
            $table->timestamps();

            $table->index('item_id');
        });

        SchemaConstraints::check('distribution_lines', 'distribution_lines_quantity_positive', 'quantity > 0', ['quantity']);
    }

    public function down(): void
    {
        Schema::dropIfExists('distribution_lines');
        Schema::dropIfExists('distributions');
        SchemaConstraints::dropAppendOnly('stock_movements');
        Schema::dropIfExists('items');
    }
};
