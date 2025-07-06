<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndustryNewName;
use App\Models\IgroupName;
use App\Models\IsubgroupName;
use App\Models\MasterStock;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class StockMasterController extends Controller
{
    /**
     * Upload CSV file and process stock data
     */
    public function uploadCsv(Request $request)
    {
        try {
            $request->validate([
                'csv_file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
            ]);

            $file = $request->file('csv_file');
            $path = $file->store('temp');
            $fullPath = Storage::path($path);

            // Process the CSV file
            $result = $this->processCsvFile($fullPath);

            // Clean up temp file
            Storage::delete($path);

            return response()->json([
                'success' => true,
                'message' => 'CSV file processed successfully!',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('CSV upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error processing CSV file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process CSV file and update database
     */
    private function processCsvFile($filePath)
    {
        $handle = fopen($filePath, 'r');
        if (!$handle) {
            throw new \Exception('Could not open CSV file');
        }

        // Skip header row
        $header = fgetcsv($handle);
        
        $processed = 0;
        $updated = 0;
        $created = 0;

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle)) !== false) {
                $processed++;
                
                // Map CSV columns to data
                $data = array_combine($header, $row);
                
                // Extract symbol from Security Id (3rd column)
                $symbol = trim($data['Security Id'] ?? '');
                if (empty($symbol)) {
                    continue;
                }

                // Find or create sector
                $sector = Sector::firstOrCreate(
                    ['name' => trim($data['Sector Name'] ?? '')]
                );

                // Find or create industry new name
                $industryNewName = IndustryNewName::firstOrCreate(
                    [
                        'name' => trim($data['Industry New Name'] ?? ''),
                        'sector_id' => $sector->id
                    ]
                );

                // Find or create igroup name
                $igroupName = IgroupName::firstOrCreate(
                    [
                        'name' => trim($data['Igroup Name'] ?? ''),
                        'industry_new_name_id' => $industryNewName->id
                    ]
                );

                // Find or create isubgroup name
                $isubgroupName = IsubgroupName::firstOrCreate(
                    [
                        'name' => trim($data['ISubgroup Name'] ?? ''),
                        'igroup_name_id' => $igroupName->id
                    ]
                );

                // Update or create master stock
                $stockData = [
                    'symbol' => $symbol,
                    'series' => 'EQ',
                    'company_name' => trim($data['Issuer Name'] ?? ''),
                    'security_name' => trim($data['Security Name'] ?? ''),
                    'security_code' => trim($data['Security Code'] ?? ''),
                    'status' => trim($data['Status'] ?? ''),
                    'group' => trim($data['Group'] ?? ''),
                    'instrument' => trim($data['Instrument'] ?? ''),
                    'isin' => trim($data['ISIN No'] ?? ''),
                    'face_value' => trim($data['Face Value'] ?? ''),
                    'sector_id' => $sector->id,
                    'industry_new_name_id' => $industryNewName->id,
                    'igroup_name_id' => $igroupName->id,
                    'isubgroup_name_id' => $isubgroupName->id,
                    'is_active' => (trim($data['Status'] ?? '') === 'Active'),
                ];

                $stock = MasterStock::updateOrCreate(
                    ['symbol' => $symbol, 'series' => 'EQ'],
                    $stockData
                );

                if ($stock->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            }

            DB::commit();

            return [
                'processed' => $processed,
                'created' => $created,
                'updated' => $updated,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        } finally {
            fclose($handle);
        }
    }

    /**
     * Get filter options for stocks
     */
    public function getFilterOptions()
    {
        try {
            $options = [
                'sectors' => Sector::getSectorNames(),
                'industry_new_names' => IndustryNewName::getIndustryNewNames(),
                'igroup_names' => IgroupName::getIgroupNames(),
                'isubgroup_names' => IsubgroupName::getIsubgroupNames(),
            ];

            return response()->json([
                'success' => true,
                'data' => $options
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting filter options: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting filter options'
            ], 500);
        }
    }

    /**
     * Get hierarchical filter options
     */
    public function getHierarchicalFilters()
    {
        try {
            $sectors = Sector::with(['industryNewNames.igroupNames.isubgroupNames'])->get();
            
            $hierarchy = $sectors->map(function ($sector) {
                return [
                    'id' => $sector->id,
                    'name' => $sector->name,
                    'industry_new_names' => $sector->industryNewNames->map(function ($industryNewName) {
                        return [
                            'id' => $industryNewName->id,
                            'name' => $industryNewName->name,
                            'igroup_names' => $industryNewName->igroupNames->map(function ($igroupName) {
                                return [
                                    'id' => $igroupName->id,
                                    'name' => $igroupName->name,
                                    'isubgroup_names' => $igroupName->isubgroupNames->map(function ($isubgroupName) {
                                        return [
                                            'id' => $isubgroupName->id,
                                            'name' => $isubgroupName->name,
                                        ];
                                    })
                                ];
                            })
                        ];
                    })
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $hierarchy
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting hierarchical filters: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting hierarchical filters'
            ], 500);
        }
    }

    /**
     * Get stocks with filters
     */
    public function getStocks(Request $request)
    {
        try {
            $query = MasterStock::with(['sector', 'industryNewName', 'igroupName', 'isubgroupName']);

            // Apply filters
            if ($request->filled('sector')) {
                $query->bySector($request->sector);
            }

            if ($request->filled('industry_new_name')) {
                $query->byIndustryNewName($request->industry_new_name);
            }

            if ($request->filled('igroup_name')) {
                $query->byIgroupName($request->igroup_name);
            }

            if ($request->filled('isubgroup_name')) {
                $query->byIsubgroupName($request->isubgroup_name);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('group')) {
                $query->where('group', $request->group);
            }

            // Pagination
            $perPage = $request->get('per_page', 50);
            $stocks = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $stocks
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting stocks: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting stocks'
            ], 500);
        }
    }

    /**
     * Get stock statistics
     */
    public function getStatistics()
    {
        try {
            $stats = [
                'total_stocks' => MasterStock::count(),
                'active_stocks' => MasterStock::where('is_active', true)->count(),
                'total_sectors' => Sector::count(),
                'total_industry_new_names' => IndustryNewName::count(),
                'total_igroup_names' => IgroupName::count(),
                'total_isubgroup_names' => IsubgroupName::count(),
                'recent_uploads' => MasterStock::where('updated_at', '>=', now()->subDays(7))->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error getting statistics'
            ], 500);
        }
    }
} 