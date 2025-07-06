<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndustryNewName extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sector_id',
    ];

    /**
     * Get the sector for this industry new name
     */
    public function sector()
    {
        return $this->belongsTo(Sector::class);
    }

    /**
     * Get all igroup names for this industry new name
     */
    public function igroupNames()
    {
        return $this->hasMany(IgroupName::class);
    }

    /**
     * Get all stocks for this industry new name
     */
    public function stocks()
    {
        return $this->hasMany(MasterStock::class);
    }

    /**
     * Get all unique industry new names
     */
    public static function getIndustryNewNames()
    {
        return static::pluck('name')->sort()->values();
    }

    /**
     * Get industry new names by sector
     */
    public static function getBySector($sectorId)
    {
        return static::where('sector_id', $sectorId)->pluck('name')->sort()->values();
    }
} 