<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BhavcopyData;
use App\Models\MasterStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeliverySpikesController extends Controller
{
    public function index(Request $request)
    {
        try {
            $results = \App\Models\DeliverySpikeCount::where(function($q) {
                $q->where('spikes_1w', '>', 0)
                  ->orWhere('spikes_1m', '>', 0)
                  ->orWhere('spikes_3m', '>', 0)
                  ->orWhere('spikes_6m', '>', 0);
            })
            ->orderByDesc('spikes_1w')
            ->get(['symbol', 'spikes_1w', 'spikes_1m', 'spikes_3m', 'spikes_6m']);
            return response()->json([
                'status' => 'success',
                'data' => $results,
                'total_stocks' => $results->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch delivery spikes data: ' . $e->getMessage()
            ], 500);
        }
    }
    
    private function getDaysFromPeriod($period)
    {
        switch ($period) {
            case '1w':
                return 7;
            case '1m':
                return 30;
            case '3m':
                return 90;
            case '6m':
                return 180;
            default:
                return 7;
        }
    }
    
    private function countDeliverySpikes($symbol, $cutoffDate, $days = 7)
    {
        // Only fetch enough data for rolling averages: period + 179 days
        $fetchDays = $days + 179;
        $startDate = $cutoffDate->copy()->subDays(179); // Go back 179 days before cutoff
        $data = BhavcopyData::where('symbol', $symbol)
            ->where('series', 'EQ')
            ->whereNotNull('deliv_per')
            ->where('trade_date', '>=', $startDate->format('Y-m-d'))
            ->orderBy('trade_date')
            ->get(['trade_date', 'deliv_per']);
        
        if ($data->count() < 1) {
            return 0;
        }
        
        $count = 0;
        $delivPerArray = $data->pluck('deliv_per')->toArray();
        $dateArray = $data->pluck('trade_date')->toArray();
        
        for ($i = 0; $i < count($delivPerArray); $i++) {
            // Only consider spike days within the selected period
            if ($dateArray[$i] < $cutoffDate->format('Y-m-d')) {
                continue;
            }
            $avg1 = $this->calculateRollingAverage($delivPerArray, $i, 1);
            $avg3 = $this->calculateRollingAverage($delivPerArray, $i, 3);
            $avg7 = $this->calculateRollingAverage($delivPerArray, $i, 7);
            $avg30 = $this->calculateRollingAverage($delivPerArray, $i, 30);
            $avg180 = $this->calculateRollingAverage($delivPerArray, $i, 180);
            if ($avg1 !== null && $avg3 !== null && $avg7 !== null && $avg30 !== null && $avg180 !== null &&
                $avg1 > $avg3 && $avg3 > $avg7 && $avg7 > $avg30 && $avg30 > $avg180) {
                $count++;
            }
        }
        return $count;
    }
    
    private function calculateRollingAverage($array, $currentIndex, $window)
    {
        $start = max(0, $currentIndex - $window + 1);
        $slice = array_slice($array, $start, $currentIndex - $start + 1);
        
        // Filter out null values
        $validValues = array_filter($slice, function($value) {
            return $value !== null && $value !== '';
        });
        
        if (empty($validValues)) {
            return null;
        }
        
        return array_sum($validValues) / count($validValues);
    }
} 