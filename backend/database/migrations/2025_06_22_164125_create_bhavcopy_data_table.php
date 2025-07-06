<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bhavcopy_data', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('master_stock_id')->nullable();
            $table->string('symbol', 50);
            $table->string('series', 10);
            $table->date('trade_date');
            $table->decimal('prev_close', 10, 2)->nullable();
            $table->decimal('open_price', 10, 2)->nullable();
            $table->decimal('high_price', 10, 2)->nullable();
            $table->decimal('low_price', 10, 2)->nullable();
            $table->decimal('last_price', 10, 2)->nullable();
            $table->decimal('close_price', 10, 2)->nullable();
            $table->decimal('avg_price', 10, 2)->nullable();
            $table->bigInteger('total_traded_qty')->nullable();
            $table->decimal('turnover_lacs', 10, 2)->nullable();
            $table->bigInteger('no_of_trades')->nullable();
            $table->bigInteger('deliv_qty')->nullable();
            $table->decimal('deliv_per', 5, 2)->nullable();
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index(['symbol', 'trade_date']);
            $table->index('trade_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bhavcopy_data');
    }
};
