<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IsubgroupName extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'igroup_name_id',
    ];

    /**
     * Get the igroup name for this isubgroup name
     */
    public function igroupName()
    {
        return $this->belongsTo(IgroupName::class);
    }

    /**
     * Get all stocks for this isubgroup name
     */
    public function stocks()
    {
        return $this->hasMany(MasterStock::class);
    }

    /**
     * Get all unique isubgroup names
     */
    public static function getIsubgroupNames()
    {
        return static::pluck('name')->sort()->values();
    }

    /**
     * Get isubgroup names by igroup name
     */
    public static function getByIgroupName($igroupNameId)
    {
        return static::where('igroup_name_id', $igroupNameId)->pluck('name')->sort()->values();
    }
} 