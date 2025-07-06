<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliverySpikeCount extends Model
{
    protected $table = 'delivery_spike_counts';
    public $timestamps = false;
    protected $fillable = [
        'symbol', 'spikes_1w', 'spikes_1m', 'spikes_3m', 'spikes_6m', 'updated_at'
    ];
} 