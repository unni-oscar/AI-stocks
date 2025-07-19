<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'symbol',
        'series',
        'company_name',
        'isin',
        'face_value',
        'is_active',
        'is_nifty50',
        'is_nifty100',
        'is_nifty500',
        // Hierarchical fields
        'sector_id',
        'industry_new_name_id',
        'igroup_name_id',
        'isubgroup_name_id',
        'security_code',
        'issuer_name',
        'security_name',
        'status',
        'group',
        'instrument',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_nifty50' => 'boolean',
        'is_nifty100' => 'boolean',
        'is_nifty500' => 'boolean'
    ];

    /**
     * Get the bhavcopy data for this stock
     */
    public function bhavcopyData()
    {
        return $this->hasMany(BhavcopyData::class, 'symbol', 'symbol');
    }

    /**
     * Get the sector for this stock
     */
    public function sector()
    {
        return $this->belongsTo(Sector::class);
    }

    /**
     * Get the industry new name for this stock
     */
    public function industryNewName()
    {
        return $this->belongsTo(IndustryNewName::class);
    }

    /**
     * Get the igroup name for this stock
     */
    public function igroupName()
    {
        return $this->belongsTo(IgroupName::class);
    }

    /**
     * Get the isubgroup name for this stock
     */
    public function isubgroupName()
    {
        return $this->belongsTo(IsubgroupName::class);
    }

    /**
     * Scope to filter by sector
     */
    public function scopeBySector($query, $sectorName)
    {
        return $query->whereHas('sector', function ($q) use ($sectorName) {
            $q->where('name', $sectorName);
        });
    }

    /**
     * Scope to filter by industry new name
     */
    public function scopeByIndustryNewName($query, $industryNewName)
    {
        return $query->whereHas('industryNewName', function ($q) use ($industryNewName) {
            $q->where('name', $industryNewName);
        });
    }

    /**
     * Scope to filter by igroup name
     */
    public function scopeByIgroupName($query, $igroupName)
    {
        return $query->whereHas('igroupName', function ($q) use ($igroupName) {
            $q->where('name', $igroupName);
        });
    }

    /**
     * Scope to filter by isubgroup name
     */
    public function scopeByIsubgroupName($query, $isubgroupName)
    {
        return $query->whereHas('isubgroupName', function ($q) use ($isubgroupName) {
            $q->where('name', $isubgroupName);
        });
    }

    /**
     * Update or create master stock from bhavcopy data and populate company name from Equity.csv
     */
    public static function updateFromBhavcopyData($symbol, $series)
    {
        // Get the latest bhavcopy data for this symbol
        $latestData = \App\Models\BhavcopyData::where('symbol', $symbol)
            ->where('series', $series)
            ->orderBy('trade_date', 'desc')
            ->first();

        if (!$latestData) {
            return null;
        }

        // Try to get company name from Equity.csv
        $companyName = self::getCompanyNameFromEquityCsv($symbol);

        // Create or update master stock
        $masterStock = self::updateOrCreate(
            ['symbol' => $symbol, 'series' => $series],
            [
                'company_name' => $companyName,
                'is_active' => true,
                'security_name' => $companyName, // Use company name as security name if available
            ]
        );

        return $masterStock;
    }

    /**
     * Get company name from Equity.csv file
     */
    private static function getCompanyNameFromEquityCsv($symbol)
    {
        $equityCsvPath = base_path('../Equity.csv');
        
        if (!file_exists($equityCsvPath)) {
            return null;
        }

        $handle = fopen($equityCsvPath, 'r');
        if (!$handle) {
            return null;
        }

        // Skip header
        fgetcsv($handle);

        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) >= 3) {
                $securityId = trim($data[2]); // Security Id column
                $issuerName = trim($data[1]); // Issuer Name column
                
                if (strtoupper($securityId) === strtoupper($symbol)) {
                    fclose($handle);
                    return $issuerName;
                }
            }
        }

        fclose($handle);
        return null;
    }
}
