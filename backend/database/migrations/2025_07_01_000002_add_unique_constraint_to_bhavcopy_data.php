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
        Schema::table('bhavcopy_data', function (Blueprint $table) {
            // Add unique constraint to prevent duplicate records for same stock on same day
            $table->unique(['symbol', 'series', 'trade_date'], 'unique_stock_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bhavcopy_data', function (Blueprint $table) {
            $table->dropUnique('unique_stock_date');
        });
    }
}; 