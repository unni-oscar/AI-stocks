<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Industry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'new_name',
        'igroup_name',
        'isubgroup_name',
    ];

    /**
     * Get all stocks in this industry
     */
    public function stocks()
    {
        return $this->hasMany(MasterStock::class);
    }

    /**
     * Get all unique industry names
     */
    public static function getIndustryNames()
    {
        return static::pluck('name')->sort()->values();
    }

    /**
     * Get all unique industry new names
     */
    public static function getIndustryNewNames()
    {
        return static::whereNotNull('new_name')->pluck('new_name')->sort()->values();
    }

    /**
     * Get all unique igroup names
     */
    public static function getIgroupNames()
    {
        return static::whereNotNull('igroup_name')->pluck('igroup_name')->sort()->values();
    }

    /**
     * Get all unique isubgroup names
     */
    public static function getIsubgroupNames()
    {
        return static::whereNotNull('isubgroup_name')->pluck('isubgroup_name')->sort()->values();
    }
} 