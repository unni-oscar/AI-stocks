<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Watchlist extends Model
{
    protected $table = 'watchlists';
    
    protected $fillable = [
        'user_id',
        'symbol'
    ];
}
