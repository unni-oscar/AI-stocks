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
        Schema::create('delivery_spike_counts', function (Blueprint $table) {
            $table->id();
            $table->string('symbol')->index();
            $table->integer('spikes_1w')->default(0);
            $table->integer('spikes_1m')->default(0);
            $table->integer('spikes_3m')->default(0);
            $table->integer('spikes_6m')->default(0);
            $table->timestamp('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_spike_counts');
    }
};
