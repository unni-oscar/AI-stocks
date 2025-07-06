<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BhavcopyData extends Model
{
    protected $table = 'bhavcopy_data';
    
    protected $fillable = [
        'master_stock_id',
        'symbol',
        'series',
        'trade_date',
        'prev_close',
        'open_price',
        'high_price',
        'low_price',
        'last_price',
        'close_price',
        'avg_price',
        'total_traded_qty',
        'turnover_lacs',
        'no_of_trades',
        'deliv_qty',
        'deliv_per',
    ];
    
    protected $casts = [
        'trade_date' => 'date',
        'prev_close' => 'decimal:2',
        'open_price' => 'decimal:2',
        'high_price' => 'decimal:2',
        'low_price' => 'decimal:2',
        'last_price' => 'decimal:2',
        'close_price' => 'decimal:2',
        'avg_price' => 'decimal:2',
        'total_traded_qty' => 'integer',
        'turnover_lacs' => 'decimal:2',
        'no_of_trades' => 'integer',
        'deliv_qty' => 'integer',
        'deliv_per' => 'decimal:2',
    ];

    /**
     * Get the master stock for this bhavcopy data
     */
    public function masterStock()
    {
        return $this->belongsTo(MasterStock::class, 'master_stock_id');
    }
}
