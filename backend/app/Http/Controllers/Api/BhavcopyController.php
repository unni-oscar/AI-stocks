<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class BhavcopyController extends Controller
{
    /**
     * Test endpoint to verify controller is working
     */
    public function test()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'BhavcopyController is working',
            'timestamp' => now()
        ]);
    }

    /**
     * Get processed dates for a specific year (based on file existence, not just database)
     */
    public function getProcessedDates(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $processedDates = [];

        for ($month = 1; $month <= 12; $month++) {
            $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
            $daysInMonth = date('t', mktime(0, 0, 0, $month, 1, $year));
            $days = [];
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);
                $dateStr = $dayStr . $monthStr . $year;
                $filename = "sec_bhavdata_full_{$dateStr}.csv";
                $filePath = "bhavcopy-data/nse/{$year}/{$monthStr}/{$filename}";
                if (\Storage::disk('private')->exists($filePath)) {
                    $days[] = $day;
                }
            }
            if (!empty($days)) {
                $processedDates[$year][(int)$month] = $days;
            }
        }

        return response()->json($processedDates);
    }

    /**
     * Fetch bhavcopy data for a specific month
     */
    public function fetchMonth(Request $request)
    {
        Log::info('=== BHAVCOPY FETCH STARTED ===');
        Log::info('Request received', [
            'year' => $request->input('year'),
            'month' => $request->input('month'),
            'user' => $request->user() ? $request->user()->id : null
        ]);

        $request->validate([
            'year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->input('year');
        $month = $request->input('month');
        
        Log::info("Processing request for year: {$year}, month: {$month}");
        
        $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
        $yearStr = (string)$year;
        
        $basePath = "bhavcopy-data/nse/{$yearStr}/{$monthStr}";
        $successCount = 0;
        $errorCount = 0;
        $processedDays = 0;
        $errors = [];

        // Get number of days in the month
        $daysInMonth = date('t', mktime(0, 0, 0, $month, 1, $year));

        Log::info("Starting bhavcopy fetch for {$year}-{$monthStr}, total days: {$daysInMonth}");

        // Fetch data for the entire month, day by day from 1st to end of month
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);
            $dateStr = $dayStr . $monthStr . $yearStr;
            
            $filename = "sec_bhavdata_full_{$dateStr}.csv";
            $filePath = "$basePath/$filename";
            
            // Skip download if file or 404 marker already exists
            if (Storage::disk('private')->exists($filePath) || Storage::disk('private')->exists($filePath . '.404')) {
                $processedDays++;
                continue;
            }
            
            Log::info("Attempting download for date: {$dateStr}");
            
            try {
                Storage::disk('private')->makeDirectory($basePath);
                $url = "https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_{$dateStr}.csv";
                Log::info("Attempting to download: {$url}");
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 60);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Accept: text/csv,text/plain,*/*',
                    'Accept-Language: en-US,en;q=0.9',
                    'Connection: keep-alive',
                    'Referer: https://nsearchives.nseindia.com/'
                ]);
                $content = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $error = curl_error($ch);
                $info = curl_getinfo($ch);
                curl_close($ch);
                Log::info("cURL response code for {$dateStr}: " . $httpCode);
                Log::info("cURL info for {$dateStr}: " . json_encode($info));
                if ($error) {
                    Log::error("cURL error for {$dateStr}: " . $error);
                    throw new \Exception("cURL error: " . $error);
                }
                Log::info("Content length for {$dateStr}: " . strlen($content));
                Log::info("Content preview for {$dateStr}: " . substr($content, 0, 200));
                if ($httpCode === 200 && $content && strlen($content) > 50) {
                    Storage::disk('private')->put($filePath, $content);
                    $successCount++;
                    $processedDays++;
                    Log::info("Successfully downloaded and saved bhavcopy for {$dateStr}, size: " . strlen($content) . " bytes");
                } else {
                    $errorCount++;
                    if ($httpCode === 404) {
                        $errorMsg = "No data available for {$dateStr} (non-trading day)";
                        // Create a .404 marker file if HTTP 404
                        Storage::disk('private')->put($filePath . '.404', '404');
                    } else {
                        $errorMsg = "Failed to download {$dateStr}: HTTP {$httpCode}, content size: " . strlen($content);
                    }
                    $errors[] = $errorMsg;
                }
            } catch (\Exception $e) {
                $errorCount++;
                $errorMsg = "Error downloading {$dateStr}: " . $e->getMessage();
                $errors[] = $errorMsg;
                Log::error($errorMsg);
                Log::error("Exception details: " . $e->getTraceAsString());
            }
        }

        Log::info("Bhavcopy fetch completed for {$year}-{$monthStr}. Success: {$successCount}, Errors: {$errorCount}");

        $response = [
            'status' => 'success',
            'message' => "Fetch completed for {$year}-{$monthStr}",
            'data' => [
                'year' => $year,
                'month' => $month,
                'success_count' => $successCount,
                'error_count' => $errorCount,
                'total_days' => $daysInMonth,
                'processed_days' => $processedDays,
                'errors' => $errors
            ]
        ];
        
        Log::info("Returning response: " . json_encode($response));
        
        return response()->json($response);
    }

    /**
     * Get storage statistics
     */
    public function getStats()
    {
        $basePath = "bhavcopy-data/nse";
        $stats = [
            'total_files' => 0,
            'total_size' => 0,
            'years' => []
        ];

        if (Storage::disk('private')->exists($basePath)) {
            $years = Storage::disk('private')->directories($basePath);
            
            foreach ($years as $yearPath) {
                $year = basename($yearPath);
                $yearStats = [
                    'year' => $year,
                    'months' => [],
                    'total_files' => 0,
                    'total_size' => 0
                ];

                $months = Storage::disk('private')->directories($yearPath);
                
                foreach ($months as $monthPath) {
                    $month = basename($monthPath);
                    $files = Storage::disk('private')->files($monthPath);
                    $monthSize = 0;
                    
                    foreach ($files as $file) {
                        $monthSize += Storage::disk('private')->size($file);
                    }

                    $yearStats['months'][$month] = [
                        'files' => count($files),
                        'size' => $monthSize
                    ];
                    
                    $yearStats['total_files'] += count($files);
                    $yearStats['total_size'] += $monthSize;
                }

                $stats['years'][] = $yearStats;
                $stats['total_files'] += $yearStats['total_files'];
                $stats['total_size'] += $yearStats['total_size'];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Process CSV files into database
     */
    public function processData(Request $request)
    {
        Log::info('=== BHAVCOPY PROCESSING STARTED ===');
        Log::info('Request received', [
            'year' => $request->input('year'),
            'month' => $request->input('month'),
            'day' => $request->input('day'),
            'file' => $request->input('file'),
            'user' => $request->user() ? $request->user()->id : null
        ]);

        $request->validate([
            'year' => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'month' => 'nullable|integer|min:1|max:12',
            'day' => 'nullable|integer|min:1|max:31',
            'file' => 'nullable|string',
        ]);

        try {
            $year = $request->input('year');
            $month = $request->input('month');
            $day = $request->input('day');
            $file = $request->input('file');

            $command = 'app:process-bhavcopy-data';
            $args = ['--update-master' => true]; // Always update master stocks table

            if ($file) {
                $args['--file'] = $file;
            } elseif ($year && $month && $day) {
                // Process specific day
                $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);
                $dateStr = $dayStr . $monthStr . $year;
                $filename = "sec_bhavdata_full_{$dateStr}.csv";
                $filePath = "private/bhavcopy-data/nse/{$year}/{$monthStr}/{$filename}";

                // Try to download if file is missing
                if (!\Storage::disk('private')->exists($filePath)) {
                    $basePath = "bhavcopy-data/nse/{$year}/{$monthStr}";
                    \Storage::disk('private')->makeDirectory($basePath);
                    $url = "https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_{$dateStr}.csv";
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
                    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'Accept: text/csv,text/plain,*/*',
                        'Accept-Language: en-US,en;q=0.9',
                        'Connection: keep-alive',
                        'Referer: https://nsearchives.nseindia.com/'
                    ]);
                    $content = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    $error = curl_error($ch);
                    curl_close($ch);
                    if ($error) {
                        return response()->json([
                            'status' => 'error',
                            'message' => "cURL error: $error",
                        ], 500);
                    }
                    if ($httpCode === 200 && $content && strlen($content) > 50) {
                        \Storage::disk('private')->put($filePath, $content);
                    } else {
                        return response()->json([
                            'status' => 'error',
                            'message' => "Failed to download CSV for {$dateStr} (HTTP $httpCode)",
                        ], 404);
                    }
                }
                $args['--file'] = $filePath;
            } elseif ($year && $month) {
                $args['--year'] = $year;
                $args['--month'] = $month;
            } elseif ($year) {
                $args['--year'] = $year;
            }

            Log::info("Executing command: $command with args: " . json_encode($args));

            // Execute the command using Artisan::call
            $exitCode = \Illuminate\Support\Facades\Artisan::call($command, $args);
            $output = \Illuminate\Support\Facades\Artisan::output();

            Log::info("Command completed with exit code: $exitCode");
            Log::info("Command output: $output");

            if ($exitCode === 0) {
                $message = 'Data processed successfully and master stocks table updated';
                if ($year && $month && $day) {
                    $message = "Day {$day}/{$month}/{$year} processed successfully";
                } elseif ($year && $month) {
                    $message = "Month {$month}/{$year} processed successfully";
                } elseif ($year) {
                    $message = "Year {$year} processed successfully";
                }

                return response()->json([
                    'status' => 'success',
                    'message' => $message,
                    'data' => [
                        'command' => $command,
                        'args' => $args,
                        'output' => $output,
                        'exit_code' => $exitCode
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data processing failed',
                    'data' => [
                        'command' => $command,
                        'args' => $args,
                        'output' => $output,
                        'exit_code' => $exitCode
                    ]
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error in processData: ' . $e->getMessage());
            Log::error('Exception details: ' . $e->getTraceAsString());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during processing',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get database statistics
     */
    public function getDatabaseStats(Request $request)
    {
        Log::info('=== BHAVCOPY DATABASE STATS REQUESTED ===');
        Log::info('Request received', [
            'user' => $request->user() ? $request->user()->id : null
        ]);

        try {
            $totalRecords = \App\Models\BhavcopyData::count();
            $uniqueSymbols = \App\Models\BhavcopyData::distinct('symbol')->count();
            $dateRange = \App\Models\BhavcopyData::selectRaw('MIN(trade_date) as min_date, MAX(trade_date) as max_date')->first();
            
            $stats = [
                'total_records' => $totalRecords,
                'unique_symbols' => $uniqueSymbols,
                'date_range' => [
                    'start_date' => $dateRange->min_date,
                    'end_date' => $dateRange->max_date,
                ],
                'last_updated' => now()->toISOString()
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting database stats: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get database statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dates that have records in the database for a specific year
     */
    public function getDatabaseDates(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $databaseDates = [];

        try {
            // Get all dates in the database for the specified year
            $dates = \App\Models\BhavcopyData::selectRaw('DATE(trade_date) as date')
                ->whereYear('trade_date', $year)
                ->distinct()
                ->pluck('date')
                ->toArray();

            // Group dates by month
            foreach ($dates as $date) {
                $dateObj = \Carbon\Carbon::parse($date);
                $month = $dateObj->month;
                $day = $dateObj->day;
                
                if (!isset($databaseDates[$year][$month])) {
                    $databaseDates[$year][$month] = [];
                }
                
                $databaseDates[$year][$month][] = $day;
            }

            return response()->json($databaseDates);
        } catch (\Exception $e) {
            Log::error('Error getting database dates: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get database dates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all EQ stocks with latest trading data
     */
    public function getEqStocks(Request $request)
    {
        Log::info('=== GET EQ STOCKS REQUESTED ===');
        try {
            $page = $request->query('page', 1);
            $perPage = $request->query('per_page', 50);
            $search = $request->query('search', '');
            $date = $request->query('date', null);

            // Watchlist filter
            $watchlistOnly = $request->query('watchlist', false);
            $watchlistSymbols = null;
            
            // Debug logging
            Log::info('Watchlist filter debug:', [
                'watchlist_param' => $request->query('watchlist'),
                'watchlist_only' => $watchlistOnly,
                'user_id' => $request->user() ? $request->user()->id : null,
                'user_exists' => $request->user() ? 'yes' : 'no'
            ]);
            
            if ($watchlistOnly && $request->user()) {
                $watchlistSymbols = \App\Models\Watchlist::where('user_id', $request->user()->id)->pluck('symbol')->toArray();
                
                // Debug logging
                Log::info('Watchlist symbols found:', [
                    'user_id' => $request->user()->id,
                    'symbols' => $watchlistSymbols,
                    'count' => count($watchlistSymbols)
                ]);
                
                if (empty($watchlistSymbols)) {
                    return response()->json([
                        'status' => 'success',
                        'data' => [
                            'stocks' => [],
                            'pagination' => [
                                'current_page' => 1,
                                'last_page' => 1,
                                'per_page' => $perPage,
                                'total' => 0,
                                'from' => null,
                                'to' => null
                            ]
                        ]
                    ]);
                }
            }

            // Get the latest EQ record for each symbol up to the selected date
            $sub = \App\Models\BhavcopyData::selectRaw('symbol, MAX(trade_date) as max_date')
                ->where('series', 'EQ');
            if ($date) {
                $sub->where('trade_date', '<=', $date);
            }
            if ($watchlistSymbols) {
                $sub->whereIn('symbol', $watchlistSymbols);
            }
            $sub->groupBy('symbol');

            $latestQuery = \App\Models\BhavcopyData::joinSub($sub, 'latest', function($join) {
                $join->on('bhavcopy_data.symbol', '=', 'latest.symbol')
                    ->on('bhavcopy_data.trade_date', '=', 'latest.max_date');
            })
            ->where('bhavcopy_data.series', 'EQ');
            if ($date) {
                $latestQuery->where('bhavcopy_data.trade_date', '<=', $date);
            }
            if ($watchlistSymbols) {
                $latestQuery->whereIn('bhavcopy_data.symbol', $watchlistSymbols);
            }
            if ($search) {
                $latestQuery->where('bhavcopy_data.symbol', 'like', "%{$search}%");
            }

            $latestStocks = $latestQuery->orderBy('bhavcopy_data.symbol')
                ->paginate($perPage, ['*'], 'page', $page);

            $stocks = $latestStocks->map(function ($stock) {
                $symbol = $stock['symbol'];
                $series = $stock['series'];
                $trade_date = $stock['trade_date'];
                $open = (float) $stock['open_price'];
                $close = (float) $stock['close_price'];
                $deliv_per = (float) $stock['deliv_per'];
                $turnover_lacs = isset($stock['turnover_lacs']) ? (float) $stock['turnover_lacs'] : null;
                $price_movement_pct = $open > 0 ? round((($close - $open) / $open) * 100, 2) : null;

                // Helper to get average delivery % for N days (EQ series only)
                $avg_deliv = function($days) use ($symbol, $trade_date) {
                    $records = \App\Models\BhavcopyData::where('symbol', $symbol)
                        ->where('series', 'EQ')
                        ->where('trade_date', '<=', $trade_date)
                        ->orderBy('trade_date', 'desc')
                        ->limit($days)
                        ->pluck('deliv_per');
                    if ($records->count() === 0) return null;
                    return round($records->avg(), 2);
                };

                return [
                    'symbol' => $symbol,
                    'series' => $series,
                    'trade_date' => $trade_date,
                    'close_price' => $close,
                    'price_movement_pct' => $price_movement_pct,
                    'deliv_per' => $deliv_per, // 1 day
                    'avg_3_days_deliv' => $avg_deliv(3),
                    'avg_7_days_deliv' => $avg_deliv(7),
                    'avg_30_days_deliv' => $avg_deliv(30),
                    'avg_180_days_deliv' => $avg_deliv(180),
                    'turnover_lacs' => $turnover_lacs,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'stocks' => $stocks,
                    'pagination' => [
                        'current_page' => $latestStocks->currentPage(),
                        'last_page' => $latestStocks->lastPage(),
                        'per_page' => $latestStocks->perPage(),
                        'total' => $latestStocks->total(),
                        'from' => $latestStocks->firstItem(),
                        'to' => $latestStocks->lastItem()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting EQ stocks: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get EQ stocks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all daily OHLC data for a given symbol (EQ series)
     */
    public function getOhlc($symbol)
    {
        $symbol = strtoupper($symbol);
        $data = \App\Models\BhavcopyData::where('symbol', $symbol)
            ->where('series', 'EQ')
            ->orderBy('trade_date')
            ->get(['trade_date', 'open_price', 'high_price', 'low_price', 'close_price', 'turnover_lacs', 'total_traded_qty', 'deliv_per']);
        // Cast numeric fields to float/int for frontend compatibility
        $data = $data->map(function ($row) {
            return [
                'trade_date' => $row->trade_date instanceof \Carbon\Carbon ? $row->trade_date->toDateString() : $row->trade_date,
                'open_price' => $row->open_price !== null ? (float)$row->open_price : null,
                'high_price' => $row->high_price !== null ? (float)$row->high_price : null,
                'low_price' => $row->low_price !== null ? (float)$row->low_price : null,
                'close_price' => $row->close_price !== null ? (float)$row->close_price : null,
                'turnover_lacs' => $row->turnover_lacs !== null ? (float)$row->turnover_lacs : null,
                'total_traded_qty' => $row->total_traded_qty !== null ? (int)$row->total_traded_qty : null,
                'deliv_per' => $row->deliv_per !== null ? (float)$row->deliv_per : null,
            ];
        });
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Download bhavcopy CSV for a specific date
     */
    public function downloadCsv(Request $request)
    {
        $year = $request->query('year');
        $month = $request->query('month');
        $day = $request->query('day');

        if (!$year || !$month || !$day) {
            return response()->json(['error' => 'Missing year, month, or day'], 400);
        }

        $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
        $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);
        $dateStr = $dayStr . $monthStr . $year;
        $filename = "sec_bhavdata_full_{$dateStr}.csv";
        $filePath = "bhavcopy-data/nse/{$year}/{$monthStr}/{$filename}";

        // If file does not exist, attempt to download from NSE
        if (!\Storage::disk('private')->exists($filePath)) {
            $basePath = "bhavcopy-data/nse/{$year}/{$monthStr}";
            \Storage::disk('private')->makeDirectory($basePath);
            $url = "https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_{$dateStr}.csv";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Accept: text/csv,text/plain,*/*',
                'Accept-Language: en-US,en;q=0.9',
                'Connection: keep-alive',
                'Referer: https://nsearchives.nseindia.com/'
            ]);
            $content = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            if ($error || $httpCode !== 200 || !$content || strlen($content) < 50) {
                return response()->json(['error' => 'CSV file not found and could not be downloaded'], 404);
            }
            \Storage::disk('private')->put($filePath, $content);
        }

        $csvContent = \Storage::disk('private')->get($filePath);
        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Fetch and store bhavcopy CSV for a specific date (no download)
     */
    public function fetchDayCsv(Request $request)
    {
        $year = $request->input('year');
        $month = $request->input('month');
        $day = $request->input('day');

        if (!$year || !$month || !$day) {
            return response()->json(['status' => 'error', 'message' => 'Missing year, month, or day'], 400);
        }

        $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
        $dayStr = str_pad($day, 2, '0', STR_PAD_LEFT);
        $dateStr = $dayStr . $monthStr . $year;
        $filename = "sec_bhavdata_full_{$dateStr}.csv";
        $filePath = "bhavcopy-data/nse/{$year}/{$monthStr}/{$filename}";

        if (\Storage::disk('private')->exists($filePath)) {
            return response()->json(['status' => 'success', 'message' => 'CSV already exists', 'file' => $filePath]);
        }

        $basePath = "bhavcopy-data/nse/{$year}/{$monthStr}";
        \Storage::disk('private')->makeDirectory($basePath);
        $url = "https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_{$dateStr}.csv";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/csv,text/plain,*/*',
            'Accept-Language: en-US,en;q=0.9',
            'Connection: keep-alive',
            'Referer: https://nsearchives.nseindia.com/'
        ]);
        $content = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        if ($error || $httpCode !== 200 || !$content || strlen($content) < 50) {
            return response()->json(['status' => 'error', 'message' => 'CSV file not found or could not be downloaded'], 404);
        }
        \Storage::disk('private')->put($filePath, $content);
        return response()->json(['status' => 'success', 'message' => 'CSV downloaded and stored', 'file' => $filePath]);
    }
} 