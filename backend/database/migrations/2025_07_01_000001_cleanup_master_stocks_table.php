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
        Schema::table('master_stocks', function (Blueprint $table) {
            // Remove trading data columns that don't belong in master table
            $table->dropColumn([
                'latest_close',
                'latest_open', 
                'latest_high',
                'latest_low',
                'latest_volume',
                'latest_deliv_per',
                'latest_trade_date',
                'avg_3_days_deliv',
                'avg_7_days_deliv',
                'avg_30_days_deliv',
                'avg_180_days_deliv',
                'market_cap',
                'pe_ratio',
                'book_value',
                'dividend_yield',
                'total_trading_days',
                'first_trade_date',
                'last_trade_date',
                'last_updated'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_stocks', function (Blueprint $table) {
            // Add back the columns if needed to rollback
            $table->decimal('latest_close', 10, 2)->nullable();
            $table->decimal('latest_open', 10, 2)->nullable();
            $table->decimal('latest_high', 10, 2)->nullable();
            $table->decimal('latest_low', 10, 2)->nullable();
            $table->bigInteger('latest_volume')->nullable();
            $table->decimal('latest_deliv_per', 5, 2)->nullable();
            $table->date('latest_trade_date')->nullable();
            $table->decimal('avg_3_days_deliv', 5, 2)->nullable();
            $table->decimal('avg_7_days_deliv', 5, 2)->nullable();
            $table->decimal('avg_30_days_deliv', 5, 2)->nullable();
            $table->decimal('avg_180_days_deliv', 5, 2)->nullable();
            $table->decimal('market_cap', 15, 2)->nullable();
            $table->decimal('pe_ratio', 10, 2)->nullable();
            $table->decimal('book_value', 10, 2)->nullable();
            $table->decimal('dividend_yield', 5, 2)->nullable();
            $table->integer('total_trading_days')->default(0);
            $table->date('first_trade_date')->nullable();
            $table->date('last_trade_date')->nullable();
            $table->timestamp('last_updated')->nullable();
        });
    }
}; 