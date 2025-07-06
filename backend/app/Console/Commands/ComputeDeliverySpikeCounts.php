<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ComputeDeliverySpikeCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:compute-delivery-spike-counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Computing delivery spike counts for all stocks...');
        $now = now();
        $stocks = \App\Models\MasterStock::where('is_active', 1)->pluck('symbol');
        $this->info('Stocks to process: ' . count($stocks));
        $bar = $this->output->createProgressBar(count($stocks));
        $bar->start();
        foreach ($stocks as $symbol) {
            $counts = [];
            
            // Get all data for the stock (up to 180 days back for 6 months calculation)
            $startDate = $now->copy()->subDays(180)->toDateString();
                $data = \App\Models\BhavcopyData::where('symbol', $symbol)
                    ->where('series', 'EQ')
                    ->whereNotNull('deliv_per')
                    ->where('trade_date', '>=', $startDate)
                    ->orderBy('trade_date')
                    ->get(['trade_date', 'deliv_per']);
            
            if ($data->count() < 1) {
                $counts = ['spikes_1w' => 0, 'spikes_1m' => 0, 'spikes_3m' => 0, 'spikes_6m' => 0];
            } else {
                $delivPerArray = $data->pluck('deliv_per')->toArray();
                $dateArray = $data->pluck('trade_date')->toArray();
                
                // Calculate cumulative counts for each period
                $counts['spikes_1w'] = $this->countSpikesInPeriod($delivPerArray, $dateArray, $now, 7);
                $counts['spikes_1m'] = $this->countSpikesInPeriod($delivPerArray, $dateArray, $now, 30);
                $counts['spikes_3m'] = $this->countSpikesInPeriod($delivPerArray, $dateArray, $now, 90);
                $counts['spikes_6m'] = $this->countSpikesInPeriod($delivPerArray, $dateArray, $now, 180);
                    }
            
            $this->info($symbol . ': ' . json_encode($counts));
            \App\Models\DeliverySpikeCount::updateOrCreate(
                ['symbol' => $symbol],
                array_merge($counts, ['updated_at' => $now])
            );
            $bar->advance();
        }
        $bar->finish();
        $this->info("\nDone. Spike counts updated.");
    }

    /**
     * Count delivery spikes in a given period (cumulative from start of period to today)
     */
    private function countSpikesInPeriod($delivPerArray, $dateArray, $now, $days)
    {
        $cutoffDate = $now->copy()->subDays($days - 1)->toDateString();
        $count = 0;
        
        for ($i = 0; $i < count($delivPerArray); $i++) {
            // Only consider spike days within the selected period
            if ($dateArray[$i] < $cutoffDate) {
                continue;
            }
            
            // Check if this day is a delivery spike
            $avg1 = $this->rollingAvg($delivPerArray, $i, 1);
            $avg3 = $this->rollingAvg($delivPerArray, $i, 3);
            $avg7 = $this->rollingAvg($delivPerArray, $i, 7);
            $avg30 = $this->rollingAvg($delivPerArray, $i, 30);
            $avg180 = $this->rollingAvg($delivPerArray, $i, 180);
            
            if ($avg1 !== null && $avg3 !== null && $avg7 !== null && $avg30 !== null && $avg180 !== null &&
                $avg1 > $avg3 && $avg3 > $avg7 && $avg7 > $avg30 && $avg30 > $avg180) {
                $count++;
            }
        }
        
        return $count;
    }

    private function rollingAvg($arr, $i, $window)
    {
        $start = max(0, $i - $window + 1);
        $slice = array_slice($arr, $start, $i - $start + 1);
        $valid = array_filter($slice, function($v) { return $v !== null && $v !== ''; });
        if (empty($valid)) return null;
        return array_sum($valid) / count($valid);
    }
}
