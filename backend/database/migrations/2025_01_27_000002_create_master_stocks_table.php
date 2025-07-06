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
        Schema::create('master_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('symbol', 50);
            $table->string('series', 10)->default('EQ');
            $table->string('company_name', 255)->nullable();
            $table->string('isin', 20)->nullable();
            $table->string('face_value', 20)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('sector', 100)->nullable();
            
            // Latest trading data
            $table->decimal('latest_close', 10, 2)->nullable();
            $table->decimal('latest_open', 10, 2)->nullable();
            $table->decimal('latest_high', 10, 2)->nullable();
            $table->decimal('latest_low', 10, 2)->nullable();
            $table->bigInteger('latest_volume')->nullable();
            $table->decimal('latest_deliv_per', 5, 2)->nullable();
            $table->date('latest_trade_date')->nullable();
            
            // Historical averages
            $table->decimal('avg_3_days_deliv', 5, 2)->nullable();
            $table->decimal('avg_7_days_deliv', 5, 2)->nullable();
            $table->decimal('avg_30_days_deliv', 5, 2)->nullable();
            $table->decimal('avg_180_days_deliv', 5, 2)->nullable();
            
            // Market cap and other metrics
            $table->decimal('market_cap', 15, 2)->nullable();
            $table->decimal('pe_ratio', 10, 2)->nullable();
            $table->decimal('book_value', 10, 2)->nullable();
            $table->decimal('dividend_yield', 5, 2)->nullable();
            
            // Status flags
            $table->boolean('is_active')->default(true);
            $table->boolean('is_nifty50')->default(false);
            $table->boolean('is_nifty100')->default(false);
            $table->boolean('is_nifty500')->default(false);
            
            // Metadata
            $table->integer('total_trading_days')->default(0);
            $table->date('first_trade_date')->nullable();
            $table->date('last_trade_date')->nullable();
            $table->timestamp('last_updated')->nullable();
            
            $table->timestamps();
            
            // Composite primary key
            $table->unique(['symbol', 'series']);
            $table->index('latest_trade_date');
            $table->index('is_active');
            $table->index(['is_nifty50', 'is_nifty100', 'is_nifty500']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_stocks');
    }
};
