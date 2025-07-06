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
        // Drop foreign keys from master_stocks first
        Schema::table('master_stocks', function (Blueprint $table) {
            // Drop foreign keys if they exist
            if (Schema::hasColumn('master_stocks', 'sector_id')) {
                $table->dropForeign(['sector_id']);
                $table->dropColumn('sector_id');
            }
            if (Schema::hasColumn('master_stocks', 'industry_new_name_id')) {
                $table->dropForeign(['industry_new_name_id']);
                $table->dropColumn('industry_new_name_id');
            }
            if (Schema::hasColumn('master_stocks', 'igroup_name_id')) {
                $table->dropForeign(['igroup_name_id']);
                $table->dropColumn('igroup_name_id');
            }
            if (Schema::hasColumn('master_stocks', 'isubgroup_name_id')) {
                $table->dropForeign(['isubgroup_name_id']);
                $table->dropColumn('isubgroup_name_id');
            }
        });

        // Drop tables in reverse order (child tables first)
        Schema::dropIfExists('isubgroup_names');
        Schema::dropIfExists('igroup_names');
        Schema::dropIfExists('industry_new_names');
        Schema::dropIfExists('sectors');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is for cleanup, so down() is intentionally empty
        // The main migration will recreate these tables
    }
};
