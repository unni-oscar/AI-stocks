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
        // Drop foreign key and column from master_stocks
        Schema::table('master_stocks', function (Blueprint $table) {
            if (Schema::hasColumn('master_stocks', 'industry_id')) {
                $table->dropForeign(['industry_id']);
                $table->dropColumn('industry_id');
            }
        });

        // Now drop the industries table
        Schema::dropIfExists('industries');
        
        // Create sectors table if it doesn't exist
        if (!Schema::hasTable('sectors')) {
            Schema::create('sectors', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }
        
        // Create industry_new_names table if it doesn't exist
        if (!Schema::hasTable('industry_new_names')) {
            Schema::create('industry_new_names', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('sector_id')->constrained('sectors')->onDelete('cascade');
                $table->timestamps();
            });
        }
        
        // Create igroup_names table if it doesn't exist
        if (!Schema::hasTable('igroup_names')) {
            Schema::create('igroup_names', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('industry_new_name_id')->constrained('industry_new_names')->onDelete('cascade');
                $table->timestamps();
            });
        }
        
        // Create isubgroup_names table if it doesn't exist
        if (!Schema::hasTable('isubgroup_names')) {
            Schema::create('isubgroup_names', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('igroup_name_id')->constrained('igroup_names')->onDelete('cascade');
                $table->timestamps();
            });
        }
        
        // Update master_stocks table to use the new structure
        Schema::table('master_stocks', function (Blueprint $table) {
            // Add new foreign keys only if they don't exist
            if (!Schema::hasColumn('master_stocks', 'sector_id')) {
                $table->foreignId('sector_id')->nullable()->constrained('sectors')->onDelete('set null');
            }
            if (!Schema::hasColumn('master_stocks', 'industry_new_name_id')) {
                $table->foreignId('industry_new_name_id')->nullable()->constrained('industry_new_names')->onDelete('set null');
            }
            if (!Schema::hasColumn('master_stocks', 'igroup_name_id')) {
                $table->foreignId('igroup_name_id')->nullable()->constrained('igroup_names')->onDelete('set null');
            }
            if (!Schema::hasColumn('master_stocks', 'isubgroup_name_id')) {
                $table->foreignId('isubgroup_name_id')->nullable()->constrained('isubgroup_names')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_stocks', function (Blueprint $table) {
            $table->dropForeign(['sector_id']);
            $table->dropForeign(['industry_new_name_id']);
            $table->dropForeign(['igroup_name_id']);
            $table->dropForeign(['isubgroup_name_id']);
            $table->dropColumn(['sector_id', 'industry_new_name_id', 'igroup_name_id', 'isubgroup_name_id']);
        });

        Schema::dropIfExists('isubgroup_names');
        Schema::dropIfExists('igroup_names');
        Schema::dropIfExists('industry_new_names');
        Schema::dropIfExists('sectors');
    }
}; 