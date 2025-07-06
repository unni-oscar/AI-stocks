<?php

namespace App\Console\Commands;

use App\Models\MasterStock;
use App\Models\BhavcopyData;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PopulateMasterStocks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:populate-master-stocks {--symbol= : Specific symbol to populate} {--series= : Specific series to populate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate master_stocks table from existing bhavcopy_data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $symbol = $this->option('symbol');
        $series = $this->option('series');

        if ($symbol && $series) {
            $this->populateSpecificStock($symbol, $series);
            return;
        }

        if ($symbol) {
            $this->populateSymbol($symbol);
            return;
        }

        // Populate all stocks
        $this->populateAllStocks();
    }

    private function populateAllStocks()
    {
        $this->info('Populating master_stocks table from bhavcopy_data...');

        // Get all unique symbol-series combinations
        $symbols = BhavcopyData::select('symbol', 'series')
            ->distinct()
            ->get();

        $totalSymbols = $symbols->count();
        $processedSymbols = 0;

        $this->info("Found $totalSymbols unique symbol-series combinations");

        $progressBar = $this->output->createProgressBar($totalSymbols);
        $progressBar->start();

        foreach ($symbols as $symbolData) {
            try {
                MasterStock::updateFromBhavcopyData($symbolData->symbol, $symbolData->series);
                $processedSymbols++;
                $progressBar->advance();
            } catch (\Exception $e) {
                $this->error("Error processing {$symbolData->symbol}-{$symbolData->series}: " . $e->getMessage());
            }
        }

        $progressBar->finish();
        $this->newLine();
        $this->info("Successfully populated $processedSymbols out of $totalSymbols symbol-series combinations");
    }

    private function populateSymbol($symbol)
    {
        $this->info("Populating master_stocks for symbol: $symbol");

        $series = BhavcopyData::where('symbol', $symbol)
            ->select('series')
            ->distinct()
            ->pluck('series');

        $totalSeries = $series->count();
        $processedSeries = 0;

        $this->info("Found $totalSeries series for symbol $symbol");

        foreach ($series as $seriesCode) {
            try {
                MasterStock::updateFromBhavcopyData($symbol, $seriesCode);
                $processedSeries++;
                $this->info("  Processed $symbol-$seriesCode");
            } catch (\Exception $e) {
                $this->error("Error processing $symbol-$seriesCode: " . $e->getMessage());
            }
        }

        $this->info("Successfully populated $processedSeries out of $totalSeries series for symbol $symbol");
    }

    private function populateSpecificStock($symbol, $series)
    {
        $this->info("Populating master_stocks for $symbol-$series");

        try {
            $stock = MasterStock::updateFromBhavcopyData($symbol, $series);
            
            if ($stock) {
                $this->info("Successfully populated master stock for $symbol-$series");
                $this->info("Latest close: " . $stock->latest_close);
                $this->info("Latest trade date: " . $stock->latest_trade_date);
                $this->info("Total trading days: " . $stock->total_trading_days);
            } else {
                $this->error("No data found for $symbol-$series");
            }
        } catch (\Exception $e) {
            $this->error("Error processing $symbol-$series: " . $e->getMessage());
        }
    }
} 