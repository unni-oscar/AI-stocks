<?php

namespace App\Console\Commands;

use App\Models\BhavcopyData;
use App\Models\MasterStock;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProcessBhavcopyData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:process-bhavcopy-data {--year= : Specific year to process} {--month= : Specific month to process} {--file= : Specific file to process} {--update-master : Update master stocks table after processing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process CSV files and insert bhavcopy data into database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year = $this->option('year');
        $month = $this->option('month');
        $specificFile = $this->option('file');
        $updateMaster = $this->option('update-master');

        if ($specificFile) {
            $this->processSingleFile($specificFile);
            if ($updateMaster) {
                $this->updateMasterStocks();
            }
            return;
        }

        if ($year && $month) {
            $this->processYearMonth($year, $month);
            if ($updateMaster) {
                $this->updateMasterStocks();
            }
            return;
        }

        if ($year) {
            $this->processYear($year);
            if ($updateMaster) {
                $this->updateMasterStocks();
            }
            return;
        }

        // Process all files
        $this->processAllFiles();
        if ($updateMaster) {
            $this->updateMasterStocks();
        }
    }

    private function processAllFiles()
    {
        $this->info('Processing all CSV files...');
        
        $basePath = storage_path('app/private/bhavcopy-data/nse');
        
        if (!is_dir($basePath)) {
            $this->error("Base path not found: $basePath");
            return;
        }
        
        $totalFiles = 0;
        $processedFiles = 0;
        
        // Get all year directories
        $yearDirs = glob($basePath . '/*', GLOB_ONLYDIR);
        
        foreach ($yearDirs as $yearDir) {
            $year = basename($yearDir);
            $this->info("Processing year: $year");
            
            // Get all month directories
            $monthDirs = glob($yearDir . '/*', GLOB_ONLYDIR);
            
            foreach ($monthDirs as $monthDir) {
                $month = basename($monthDir);
                $this->info("  Processing month: $month");
                
                // Get all CSV files
                $csvFiles = glob($monthDir . '/*.csv');
                $totalFiles += count($csvFiles);
                
                foreach ($csvFiles as $csvFile) {
                    // Convert absolute path to storage path
                    $relativePath = str_replace(storage_path('app/'), '', $csvFile);
                    if ($this->processSingleFile($relativePath)) {
                        $processedFiles++;
                    }
                }
            }
        }
        
        $this->info("Processing complete! Processed $processedFiles out of $totalFiles files.");
    }

    private function processYear($year)
    {
        $this->info("Processing year: $year");
        
        $basePath = "storage/app/private/bhavcopy-data/nse/$year";
        if (!Storage::disk('local')->exists($basePath)) {
            $this->error("Year $year not found!");
            return;
        }
        
        $months = Storage::disk('local')->directories($basePath);
        foreach ($months as $monthPath) {
            $month = basename($monthPath);
            $this->processYearMonth($year, $month);
        }
    }

    private function processYearMonth($year, $month)
    {
        $this->info("Processing $year-$month");
        
        $basePath = "storage/app/private/bhavcopy-data/nse/$year/$month";
        if (!Storage::disk('local')->exists($basePath)) {
            $this->error("Path $basePath not found!");
            return;
        }
        
        $files = Storage::disk('local')->files($basePath);
        $csvFiles = array_filter($files, function($file) {
            return pathinfo($file, PATHINFO_EXTENSION) === 'csv';
        });
        
        $totalFiles = count($csvFiles);
        $processedFiles = 0;
        
        $this->info("Found $totalFiles CSV files to process");
        
        foreach ($csvFiles as $file) {
            if ($this->processSingleFile($file)) {
                $processedFiles++;
            }
        }
        
        $this->info("Completed processing $processedFiles out of $totalFiles files for $year-$month");
    }

    private function processSingleFile($filePath)
    {
        $this->info("Processing file: $filePath");
        
        // Convert storage path to absolute path
        $absolutePath = storage_path('app/' . $filePath);
        
        if (!file_exists($absolutePath)) {
            $this->error("File not found: $absolutePath");
            return false;
        }
        
        try {
            $content = file_get_contents($absolutePath);
            $lines = explode("\n", $content);
            
            // Skip header line
            array_shift($lines);
            
            $processedRows = 0;
            $skippedRows = 0;
            
            // Use transaction for better performance
            DB::beginTransaction();
            
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) continue;
                
                $data = $this->parseCsvLine($line);
                if ($data) {
                    try {
                        // Get or create master stock first
                        $masterStock = MasterStock::firstOrCreate(
                            ['symbol' => $data['symbol'], 'series' => $data['series']],
                            ['is_active' => true]
                        );
                        
                        // Add master_stock_id to the data
                        $data['master_stock_id'] = $masterStock->id;
                        
                        // Use insertOrIgnore to handle duplicates gracefully
                        BhavcopyData::insertOrIgnore($data);
                        $processedRows++;
                        
                        if ($processedRows % 1000 == 0) {
                            $this->info("  Processed $processedRows rows...");
                        }
                    } catch (\Exception $e) {
                        $this->error("Error inserting row: " . $e->getMessage());
                        continue;
                    }
                }
            }
            
            DB::commit();
            
            $this->info("  Completed processing $processedRows rows, skipped $skippedRows rows from $filePath");
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error processing $filePath: " . $e->getMessage());
            return false;
        }
    }

    private function parseCsvLine($line)
    {
        // Split by comma, but handle quoted fields
        $data = str_getcsv($line);
        
        if (count($data) < 15) {
            return null;
        }
        
        // Parse date
        $dateStr = trim($data[2]);
        try {
            $date = Carbon::createFromFormat('d-M-Y', $dateStr);
        } catch (\Exception $e) {
            return null;
        }
        
        return [
            'symbol' => trim($data[0]),
            'series' => trim($data[1]),
            'trade_date' => $date->format('Y-m-d'),
            'prev_close' => $this->parseDecimal($data[3]),
            'open_price' => $this->parseDecimal($data[4]),
            'high_price' => $this->parseDecimal($data[5]),
            'low_price' => $this->parseDecimal($data[6]),
            'last_price' => $this->parseDecimal($data[7]),
            'close_price' => $this->parseDecimal($data[8]),
            'avg_price' => $this->parseDecimal($data[9]),
            'total_traded_qty' => $this->parseInteger($data[10]),
            'turnover_lacs' => $this->parseDecimal($data[11]),
            'no_of_trades' => $this->parseInteger($data[12]),
            'deliv_qty' => $this->parseInteger($data[13]),
            'deliv_per' => $this->parseDecimal($data[14]),
        ];
    }

    private function parseDecimal($value)
    {
        $value = trim($value);
        if ($value === '-' || $value === '' || $value === '0') {
            return null;
        }
        return (float) $value;
    }

    private function parseInteger($value)
    {
        $value = trim($value);
        if ($value === '-' || $value === '' || $value === '0') {
            return null;
        }
        return (int) $value;
    }

    /**
     * Update master stocks table with unique symbols from bhavcopy data
     */
    private function updateMasterStocks()
    {
        $this->info('Updating master stocks table...');
        
        // Get all unique symbols from bhavcopy_data
        $symbols = BhavcopyData::select('symbol', 'series')
            ->distinct()
            ->get();
        
        $totalSymbols = $symbols->count();
        $updatedSymbols = 0;
        
        $this->info("Found $totalSymbols unique symbols to update");
        
        foreach ($symbols as $symbolData) {
            try {
                // Check if master stock already exists
                $masterStock = MasterStock::where('symbol', $symbolData->symbol)
                    ->where('series', $symbolData->series)
                    ->first();
                
                if (!$masterStock) {
                    // Create new master stock entry
                    MasterStock::create([
                        'symbol' => $symbolData->symbol,
                        'series' => $symbolData->series,
                        'is_active' => true
                    ]);
                    $updatedSymbols++;
                }
                
                if ($updatedSymbols % 100 == 0) {
                    $this->info("  Updated $updatedSymbols out of $totalSymbols symbols...");
                }
            } catch (\Exception $e) {
                $this->error("Error updating master stock for {$symbolData->symbol}: " . $e->getMessage());
            }
        }
        
        $this->info("Master stocks table updated! Updated $updatedSymbols out of $totalSymbols symbols.");
    }
}
