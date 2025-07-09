<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class StockAnalysisController extends Controller
{
    /**
     * Get delivery percentage analysis for stocks
     */
    public function getDeliveryAnalysis(Request $request)
    {
        Log::info('=== DELIVERY ANALYSIS REQUESTED ===');
        
        try {
            // Get the latest available date
            $latestDate = DB::table('bhavcopy_data')
                ->max('trade_date');
            
            if (!$latestDate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No data available in database'
                ], 404);
            }

            $latestDate = Carbon::parse($latestDate);
            
            // Calculate delivery percentages for different periods
            $stocks = DB::table('bhavcopy_data')
                ->select([
                    'symbol',
                    'series',
                    // Latest delivery percentage (1 day)
                    DB::raw('MAX(CASE WHEN trade_date = ? THEN deliv_per END) as latest_deliv_per'),
                    // 3 days average
                    DB::raw('AVG(CASE WHEN trade_date >= ? THEN deliv_per END) as avg_3_days'),
                    // 7 days average
                    DB::raw('AVG(CASE WHEN trade_date >= ? THEN deliv_per END) as avg_7_days'),
                    // 30 days average
                    DB::raw('AVG(CASE WHEN trade_date >= ? THEN deliv_per END) as avg_30_days'),
                    // 180 days average
                    DB::raw('AVG(CASE WHEN trade_date >= ? THEN deliv_per END) as avg_180_days'),
                    // Latest close price
                    DB::raw('MAX(CASE WHEN trade_date = ? THEN close_price END) as latest_close'),
                    // Latest volume
                    DB::raw('MAX(CASE WHEN trade_date = ? THEN total_traded_qty END) as latest_volume')
                ])
                ->where('series', 'EQ') // Only equity stocks
                ->where('trade_date', '>=', $latestDate->copy()->subDays(180))
                ->groupBy('symbol', 'series')
                ->havingRaw('latest_deliv_per IS NOT NULL')
                ->havingRaw('avg_3_days IS NOT NULL')
                ->havingRaw('avg_7_days IS NOT NULL')
                ->havingRaw('avg_30_days IS NOT NULL')
                ->havingRaw('avg_180_days IS NOT NULL')
                ->addBinding($latestDate->format('Y-m-d'), 'select') // latest_deliv_per
                ->addBinding($latestDate->copy()->subDays(3)->format('Y-m-d'), 'select') // avg_3_days
                ->addBinding($latestDate->copy()->subDays(7)->format('Y-m-d'), 'select') // avg_7_days
                ->addBinding($latestDate->copy()->subDays(30)->format('Y-m-d'), 'select') // avg_30_days
                ->addBinding($latestDate->copy()->subDays(180)->format('Y-m-d'), 'select') // avg_180_days
                ->addBinding($latestDate->format('Y-m-d'), 'select') // latest_close
                ->addBinding($latestDate->format('Y-m-d'), 'select') // latest_volume
                ->get();

            // Apply filtering conditions
            $filteredStocks = $stocks->filter(function ($stock) {
                $latest = $stock->latest_deliv_per;
                $avg3 = $stock->avg_3_days;
                $avg7 = $stock->avg_7_days;
                $avg30 = $stock->avg_30_days;
                $avg180 = $stock->avg_180_days;

                // Condition 1: Latest > 3 days > 7 days > 30 days > 180 days
                if ($latest > $avg3 && $avg3 > $avg7 && $avg7 > $avg30 && $avg30 > $avg180) {
                    $stock->condition_met = 1;
                    $stock->condition_type = 'Latest > 3d > 7d > 30d > 180d';
                    return true;
                }
                
                // Condition 2: 3 days > 7 days > 30 days > 180 days
                if ($avg3 > $avg7 && $avg7 > $avg30 && $avg30 > $avg180) {
                    $stock->condition_met = 2;
                    $stock->condition_type = '3d > 7d > 30d > 180d';
                    return true;
                }
                
                // Condition 3: 7 days > 30 days > 180 days
                if ($avg7 > $avg30 && $avg30 > $avg180) {
                    $stock->condition_met = 3;
                    $stock->condition_type = '7d > 30d > 180d';
                    return true;
                }
                
                // Condition 4: 30 days > 180 days
                if ($avg30 > $avg180) {
                    $stock->condition_met = 4;
                    $stock->condition_type = '30d > 180d';
                    return true;
                }

                return false;
            });

            // Sort by condition priority (1 is highest priority)
            $sortedStocks = $filteredStocks->sortBy('condition_met')->values();

            // Format the data
            $formattedStocks = $sortedStocks->map(function ($stock) {
                return [
                    'symbol' => $stock->symbol,
                    'series' => $stock->series,
                    'latest_close' => round($stock->latest_close, 2),
                    'latest_volume' => number_format($stock->latest_volume),
                    'delivery_percentages' => [
                        'latest' => round($stock->latest_deliv_per, 2),
                        'avg_3_days' => round($stock->avg_3_days, 2),
                        'avg_7_days' => round($stock->avg_7_days, 2),
                        'avg_30_days' => round($stock->avg_30_days, 2),
                        'avg_180_days' => round($stock->avg_180_days, 2),
                    ],
                    'condition_met' => $stock->condition_met,
                    'condition_type' => $stock->condition_type,
                    'is_green' => $stock->condition_met <= 4 // All conditions show in green
                ];
            });

            Log::info("Delivery analysis completed. Found " . $formattedStocks->count() . " stocks matching conditions.");

            return response()->json([
                'status' => 'success',
                'data' => [
                    'stocks' => $formattedStocks,
                    'total_stocks' => $formattedStocks->count(),
                    'latest_date' => $latestDate->format('Y-m-d'),
                    'analysis_date' => now()->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in delivery analysis: ' . $e->getMessage());
            Log::error('Exception details: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to analyze delivery data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get summary statistics
     */
    public function getSummaryStats(Request $request)
    {
        try {
            $stats = DB::table('bhavcopy_data')
                ->select([
                    DB::raw('COUNT(DISTINCT symbol) as total_symbols'),
                    DB::raw('COUNT(*) as total_records'),
                    DB::raw('MIN(trade_date) as earliest_date'),
                    DB::raw('MAX(trade_date) as latest_date')
                ])
                ->first();

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting summary stats: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get summary statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get master stocks data
     */
    public function getMasterStocks(Request $request)
    {
        try {
            $query = \App\Models\MasterStock::query();
            
            // Apply filters
            if ($request->has('symbol')) {
                $query->where('symbol', 'like', '%' . $request->input('symbol') . '%');
            }
            
            if ($request->has('series')) {
                $query->where('series', $request->input('series'));
            }
            
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }
            
            if ($request->has('is_nifty50')) {
                $query->where('is_nifty50', $request->boolean('is_nifty50'));
            }
            
            if ($request->has('is_nifty100')) {
                $query->where('is_nifty100', $request->boolean('is_nifty100'));
            }
            
            if ($request->has('is_nifty500')) {
                $query->where('is_nifty500', $request->boolean('is_nifty500'));
            }
            
            // Apply sorting
            $sortBy = $request->input('sort_by', 'symbol');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Pagination
            $perPage = $request->input('per_page', 50);
            $stocks = $query->paginate($perPage);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'stocks' => $stocks->items(),
                    'pagination' => [
                        'current_page' => $stocks->currentPage(),
                        'last_page' => $stocks->lastPage(),
                        'per_page' => $stocks->perPage(),
                        'total' => $stocks->total(),
                        'from' => $stocks->firstItem(),
                        'to' => $stocks->lastItem(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting master stocks: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get master stocks data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get individual stock details with hierarchical classification
     */
    public function getStockDetails(Request $request, $symbol)
    {
        try {
            $stock = \App\Models\MasterStock::with([
                'sector',
                'industryNewName',
                'igroupName',
                'isubgroupName'
            ])->where('symbol', $symbol)->first();

            if (!$stock) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stock not found'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'symbol' => $stock->symbol,
                    'company_name' => $stock->company_name,
                    'series' => $stock->series,
                    'hierarchy' => [
                        'sector_name' => $stock->sector ? $stock->sector->name : null,
                        'industry_new_name' => $stock->industryNewName ? $stock->industryNewName->name : null,
                        'igroup_name' => $stock->igroupName ? $stock->igroupName->name : null,
                        'isubgroup_name' => $stock->isubgroupName ? $stock->isubgroupName->name : null,
                    ],
                    'metadata' => [
                        'isin' => $stock->isin,
                        'face_value' => $stock->face_value,
                        'is_active' => $stock->is_active,
                        'is_nifty50' => $stock->is_nifty50,
                        'is_nifty100' => $stock->is_nifty100,
                        'is_nifty500' => $stock->is_nifty500,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting stock details: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get stock details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top gainers - stocks that have increased in price from previous day
     */
    public function getTopGainers(Request $request)
    {
        try {
            // Get the date from request or use the latest available date
            $selectedDate = $request->input('date');
            
            if ($selectedDate) {
                $requestedDate = Carbon::parse($selectedDate);
                
                // Check if data exists for the requested date
                $dataExists = DB::table('bhavcopy_data')
                    ->where('trade_date', $requestedDate->format('Y-m-d'))
                    ->exists();
                
                if ($dataExists) {
                    $latestDate = $requestedDate;
                } else {
                    // Find the last available date before or equal to the requested date
                    $latestDate = DB::table('bhavcopy_data')
                        ->where('trade_date', '<=', $requestedDate->format('Y-m-d'))
                        ->max('trade_date');
                    
                    if (!$latestDate) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'No data available for the selected date or earlier'
                        ], 404);
                    }
                    
                    $latestDate = Carbon::parse($latestDate);
                    
                    Log::info("No data for requested date {$requestedDate->format('Y-m-d')}, using last available date: {$latestDate->format('Y-m-d')}");
                }
            } else {
                // Get the latest available date
                $latestDate = DB::table('bhavcopy_data')
                    ->max('trade_date');
                
                if (!$latestDate) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'No data available in database'
                    ], 404);
                }
                
                $latestDate = Carbon::parse($latestDate);
            }
            
            // Find the previous trading day (not just previous calendar day)
            $previousDate = DB::table('bhavcopy_data')
                ->where('trade_date', '<', $latestDate->format('Y-m-d'))
                ->max('trade_date');
            
            if (!$previousDate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No previous trading day data available'
                ], 404);
            }

            $previousDate = Carbon::parse($previousDate);
            
            Log::info("Top Gainers Analysis - Latest Date: {$latestDate->format('Y-m-d')}, Previous Date: {$previousDate->format('Y-m-d')}");
            
            // Get stocks with price increase from previous day
            $topGainers = DB::table('bhavcopy_data as current')
                ->join('bhavcopy_data as previous', function($join) use ($latestDate, $previousDate) {
                    $join->on('current.symbol', '=', 'previous.symbol')
                         ->where('current.trade_date', '=', $latestDate->format('Y-m-d'))
                         ->where('previous.trade_date', '=', $previousDate->format('Y-m-d'));
                })
                ->select([
                    'current.symbol',
                    'current.series',
                    'current.close_price as current_price',
                    'previous.close_price as previous_price',
                    'current.total_traded_qty as current_volume',
                    'previous.total_traded_qty as previous_volume',
                    'current.deliv_per as current_deliv_per',
                    'previous.deliv_per as previous_deliv_per',
                    DB::raw('ROUND(((current.close_price - previous.close_price) / previous.close_price) * 100, 2) as price_change_percent'),
                    DB::raw('ROUND(current.close_price - previous.close_price, 2) as price_change_absolute'),
                    DB::raw('ROUND(((current.total_traded_qty - previous.total_traded_qty) / previous.total_traded_qty) * 100, 2) as volume_change_percent')
                ])
                ->where('current.series', 'EQ') // Only equity stocks
                ->where('previous.series', 'EQ') // Only equity stocks for previous day
                ->whereRaw('CAST(current.close_price AS DECIMAL(10,2)) > CAST(previous.close_price AS DECIMAL(10,2))') // Only stocks with price increase
                ->where('previous.close_price', '>', 0) // Ensure previous price is not zero
                ->orderBy('price_change_percent', 'desc')
                ->get();

            Log::info("Top Gainers Query - Found " . $topGainers->count() . " stocks with price increases");
            
            // Log some sample data for debugging
            if ($topGainers->count() > 0) {
                $top5 = $topGainers->take(5);
                foreach ($top5 as $stock) {
                    Log::info("Top Gainer: {$stock->symbol} - Change: {$stock->price_change_percent}% (Current: {$stock->current_price}, Previous: {$stock->previous_price})");
                }
            }

            // Format the data
            $formattedGainers = $topGainers->map(function ($stock) {
                return [
                    'symbol' => $stock->symbol,
                    'series' => $stock->series,
                    'current_price' => round($stock->current_price, 2),
                    'previous_price' => round($stock->previous_price, 2),
                    'price_change_percent' => $stock->price_change_percent,
                    'price_change_absolute' => $stock->price_change_absolute,
                    'current_volume' => number_format($stock->current_volume),
                    'previous_volume' => number_format($stock->previous_volume),
                    'volume_change_percent' => $stock->volume_change_percent,
                    'current_deliv_per' => round($stock->current_deliv_per, 2),
                    'previous_deliv_per' => round($stock->previous_deliv_per, 2),
                    'deliv_per_change' => round($stock->current_deliv_per - $stock->previous_deliv_per, 2)
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'stocks' => $formattedGainers,
                    'total_stocks' => $formattedGainers->count(),
                    'latest_date' => $latestDate->format('Y-m-d'),
                    'previous_date' => $previousDate->format('Y-m-d'),
                    'analysis_date' => now()->format('Y-m-d H:i:s'),
                    'debug_info' => [
                        'latest_date' => $latestDate->format('Y-m-d'),
                        'previous_date' => $previousDate->format('Y-m-d'),
                        'total_stocks_found' => $topGainers->count(),
                        'max_change_percent' => $topGainers->max('price_change_percent') ?? 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in top gainers analysis: ' . $e->getMessage());
            Log::error('Exception details: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to analyze top gainers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top losers - stocks that have decreased in price from previous day
     */
    public function getTopLosers(Request $request)
    {
        try {
            // Get the date from request or use the latest available date
            $selectedDate = $request->input('date');
            
            if ($selectedDate) {
                $requestedDate = Carbon::parse($selectedDate);
                
                // Check if data exists for the requested date
                $dataExists = DB::table('bhavcopy_data')
                    ->where('trade_date', $requestedDate->format('Y-m-d'))
                    ->exists();
                
                if ($dataExists) {
                    $latestDate = $requestedDate;
                } else {
                    // Find the last available date before or equal to the requested date
                    $latestDate = DB::table('bhavcopy_data')
                        ->where('trade_date', '<=', $requestedDate->format('Y-m-d'))
                        ->max('trade_date');
                    
                    if (!$latestDate) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'No data available for the selected date or earlier'
                        ], 404);
                    }
                    
                    $latestDate = Carbon::parse($latestDate);
                    
                    Log::info("No data for requested date {$requestedDate->format('Y-m-d')}, using last available date: {$latestDate->format('Y-m-d')}");
                }
            } else {
                // Get the latest available date
                $latestDate = DB::table('bhavcopy_data')
                    ->max('trade_date');
                
                if (!$latestDate) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'No data available in database'
                    ], 404);
                }
                
                $latestDate = Carbon::parse($latestDate);
            }
            
            // Find the previous trading day (not just previous calendar day)
            $previousDate = DB::table('bhavcopy_data')
                ->where('trade_date', '<', $latestDate->format('Y-m-d'))
                ->max('trade_date');
            
            if (!$previousDate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No previous trading day data available'
                ], 404);
            }

            $previousDate = Carbon::parse($previousDate);
            
            Log::info("Top Losers Analysis - Latest Date: {$latestDate->format('Y-m-d')}, Previous Date: {$previousDate->format('Y-m-d')}");
            
            // Get stocks with price decrease from previous day
            $topLosers = DB::table('bhavcopy_data as current')
                ->join('bhavcopy_data as previous', function($join) use ($latestDate, $previousDate) {
                    $join->on('current.symbol', '=', 'previous.symbol')
                         ->where('current.trade_date', '=', $latestDate->format('Y-m-d'))
                         ->where('previous.trade_date', '=', $previousDate->format('Y-m-d'));
                })
                ->select([
                    'current.symbol',
                    'current.series',
                    'current.close_price as current_price',
                    'previous.close_price as previous_price',
                    'current.total_traded_qty as current_volume',
                    'previous.total_traded_qty as previous_volume',
                    'current.deliv_per as current_deliv_per',
                    'previous.deliv_per as previous_deliv_per',
                    DB::raw('ROUND(((current.close_price - previous.close_price) / previous.close_price) * 100, 2) as price_change_percent'),
                    DB::raw('ROUND(current.close_price - previous.close_price, 2) as price_change_absolute'),
                    DB::raw('ROUND(((current.total_traded_qty - previous.total_traded_qty) / previous.total_traded_qty) * 100, 2) as volume_change_percent')
                ])
                ->where('current.series', 'EQ') // Only equity stocks
                ->where('previous.series', 'EQ') // Only equity stocks for previous day
                ->whereRaw('CAST(current.close_price AS DECIMAL(10,2)) < CAST(previous.close_price AS DECIMAL(10,2))') // Only stocks with price decrease
                ->where('previous.close_price', '>', 0) // Ensure previous price is not zero
                ->orderBy('price_change_percent', 'asc') // Ascending order for losers (most negative first)
                ->get();

            Log::info("Top Losers Query - Found " . $topLosers->count() . " stocks with price decreases");
            
            // Log some sample data for debugging
            if ($topLosers->count() > 0) {
                $top5 = $topLosers->take(5);
                foreach ($top5 as $stock) {
                    Log::info("Top Loser: {$stock->symbol} - Change: {$stock->price_change_percent}% (Current: {$stock->current_price}, Previous: {$stock->previous_price})");
                }
            }

            // Format the data
            $formattedLosers = $topLosers->map(function ($stock) {
                return [
                    'symbol' => $stock->symbol,
                    'series' => $stock->series,
                    'current_price' => round($stock->current_price, 2),
                    'previous_price' => round($stock->previous_price, 2),
                    'price_change_percent' => $stock->price_change_percent,
                    'price_change_absolute' => $stock->price_change_absolute,
                    'current_volume' => number_format($stock->current_volume),
                    'previous_volume' => number_format($stock->previous_volume),
                    'volume_change_percent' => $stock->volume_change_percent,
                    'current_deliv_per' => round($stock->current_deliv_per, 2),
                    'previous_deliv_per' => round($stock->previous_deliv_per, 2),
                    'deliv_per_change' => round($stock->current_deliv_per - $stock->previous_deliv_per, 2)
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'stocks' => $formattedLosers,
                    'total_stocks' => $formattedLosers->count(),
                    'latest_date' => $latestDate->format('Y-m-d'),
                    'previous_date' => $previousDate->format('Y-m-d'),
                    'analysis_date' => now()->format('Y-m-d H:i:s'),
                    'debug_info' => [
                        'latest_date' => $latestDate->format('Y-m-d'),
                        'previous_date' => $previousDate->format('Y-m-d'),
                        'total_stocks_found' => $topLosers->count(),
                        'max_change_percent' => $topLosers->max('price_change_percent') ?? 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in top losers analysis: ' . $e->getMessage());
            Log::error('Exception details: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to analyze top losers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 