<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
     * Get processed dates for a specific year
     */
    public function getProcessedDates(Request $request)
    {
        $year = $request->query('year', date('Y'));
        $processedDates = [];

        // Check storage directory for existing files
        $basePath = "bhavcopy-data/nse/{$year}";
        
        if (Storage::exists($basePath)) {
            for ($month = 1; $month <= 12; $month++) {
                $monthPath = $basePath . '/' . str_pad($month, 2, '0', STR_PAD_LEFT);
                
                if (Storage::exists($monthPath)) {
                    $files = Storage::files($monthPath);
                    $days = [];
                    
                    foreach ($files as $file) {
                        // Extract day from filename: sec_bhavdata_full_DDMMYYYY.csv
                        if (preg_match('/sec_bhavdata_full_(\d{2})(\d{2})(\d{4})\.csv$/', basename($file), $matches)) {
                            $day = (int)$matches[1];
                            $days[] = $day;
                        }
                    }
                    
                    if (!empty($days)) {
                        $processedDates[$year][(int)$month] = $days;
                    }
                }
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
            if (Storage::exists($filePath) || Storage::exists($filePath . '.404')) {
                $processedDays++;
                continue;
            }
            
            Log::info("Attempting download for date: {$dateStr}");
            
            try {
                Storage::makeDirectory($basePath);
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
                    Storage::put($filePath, $content);
                    $successCount++;
                    $processedDays++;
                    Log::info("Successfully downloaded and saved bhavcopy for {$dateStr}, size: " . strlen($content) . " bytes");
                } else {
                    $errorCount++;
                    $errorMsg = "Failed to download {$dateStr}: HTTP {$httpCode}, content size: " . strlen($content);
                    $errors[] = $errorMsg;
                    // Create a .404 marker file if HTTP 404
                    if ($httpCode === 404) {
                        Storage::put($filePath . '.404', '404');
                    }
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

        if (Storage::exists($basePath)) {
            $years = Storage::directories($basePath);
            
            foreach ($years as $yearPath) {
                $year = basename($yearPath);
                $yearStats = [
                    'year' => $year,
                    'months' => [],
                    'total_files' => 0,
                    'total_size' => 0
                ];

                $months = Storage::directories($yearPath);
                
                foreach ($months as $monthPath) {
                    $month = basename($monthPath);
                    $files = Storage::files($monthPath);
                    $monthSize = 0;
                    
                    foreach ($files as $file) {
                        $monthSize += Storage::size($file);
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
} 