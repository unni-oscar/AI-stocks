<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sector extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * Get all industry new names for this sector
     */
    public function industryNewNames()
    {
        return $this->hasMany(IndustryNewName::class);
    }

    /**
     * Get all stocks in this sector
     */
    public function stocks()
    {
        return $this->hasMany(MasterStock::class);
    }

    /**
     * Get all unique sector names
     */
    public static function getSectorNames()
    {
        return static::pluck('name')->sort()->values();
    }

    /**
     * Get the complete hierarchy for a sector
     */
    public function getHierarchy()
    {
        return $this->load([
            'industryNewNames.igroupNames.isubgroupNames'
        ]);
    }
} 