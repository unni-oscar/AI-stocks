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
            $table->foreign('master_stock_id')
                  ->references('id')
                  ->on('master_stocks')
                  ->onDelete('set null')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bhavcopy_data', function (Blueprint $table) {
            $table->dropForeign(['master_stock_id']);
        });
    }
}; 