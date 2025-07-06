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
            // Add foreign key columns
            $table->foreignId('industry_id')->nullable()->constrained('industries')->onDelete('set null');
            $table->foreignId('sector_id')->nullable()->constrained('sectors')->onDelete('set null');
            
            // Add additional columns from CSV
            $table->string('security_code', 20)->nullable();
            $table->string('issuer_name', 255)->nullable();
            $table->string('security_name', 255)->nullable();
            $table->string('status', 50)->nullable();
            $table->string('group', 10)->nullable();
            $table->string('instrument', 50)->nullable();
            
            // Add indexes for fast filtering
            $table->index('industry_id');
            $table->index('sector_id');
            $table->index('security_code');
            $table->index('status');
            $table->index('group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_stocks', function (Blueprint $table) {
            $table->dropForeign(['industry_id']);
            $table->dropForeign(['sector_id']);
            $table->dropColumn(['industry_id', 'sector_id', 'security_code', 'issuer_name', 'security_name', 'status', 'group', 'instrument']);
        });
    }
}; 