<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IgroupName extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'industry_new_name_id',
    ];

    /**
     * Get the industry new name for this igroup name
     */
    public function industryNewName()
    {
        return $this->belongsTo(IndustryNewName::class);
    }

    /**
     * Get all isubgroup names for this igroup name
     */
    public function isubgroupNames()
    {
        return $this->hasMany(IsubgroupName::class);
    }

    /**
     * Get all stocks for this igroup name
     */
    public function stocks()
    {
        return $this->hasMany(MasterStock::class);
    }

    /**
     * Get all unique igroup names
     */
    public static function getIgroupNames()
    {
        return static::pluck('name')->sort()->values();
    }

    /**
     * Get igroup names by industry new name
     */
    public static function getByIndustryNewName($industryNewNameId)
    {
        return static::where('industry_new_name_id', $industryNewNameId)->pluck('name')->sort()->values();
    }
} 