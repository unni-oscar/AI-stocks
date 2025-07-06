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
        Schema::create('industries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->unique();
            $table->string('new_name', 255)->nullable(); // Industry New Name
            $table->string('igroup_name', 255)->nullable(); // Igroup Name
            $table->string('isubgroup_name', 255)->nullable(); // ISubgroup Name
            $table->timestamps();
            
            $table->index('name');
            $table->index('new_name');
            $table->index('igroup_name');
            $table->index('isubgroup_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('industries');
    }
}; 