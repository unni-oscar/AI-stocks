<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Watchlist;
use App\Models\BhavcopyData;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class WatchlistController extends Controller
{
    // List all stocks in the user's watchlist with detailed information
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Debug: Check if user is authenticated
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not authenticated'], 401);
        }
        
        // Debug: Log user ID
        \Log::info('Watchlist request for user ID: ' . $user->id);
        
        // Get watchlist symbols
        $watchlistSymbols = Watchlist::where('user_id', $user->id)->pluck('symbol');
        
        // Debug: Check if data exists
        $count = $watchlistSymbols->count();
        \Log::info('Watchlist count for user ' . $user->id . ': ' . $count);
        
        if ($count === 0) {
            return response()->json(['status' => 'success', 'data' => []]);
        }
        
        // Get the latest date from bhavcopy_data
        $latestDate = BhavcopyData::max('trade_date');
        
        if (!$latestDate) {
            return response()->json(['status' => 'success', 'data' => []]);
        }
        
        // Get the previous date for price change calculation
        $previousDate = BhavcopyData::where('trade_date', '<', $latestDate)
            ->max('trade_date');
        
        // Get detailed stock information for watchlist symbols with company names
        $watchlistData = DB::table('bhavcopy_data as current')
            ->leftJoin('master_stocks', 'current.symbol', '=', 'master_stocks.symbol')
            ->select([
                'current.symbol',
                'master_stocks.company_name',
                'current.close_price as current_price',
                'current.trade_date',
                DB::raw('0 as price_change_percent'), // Will calculate below
                DB::raw('0 as price_change_absolute') // Will calculate below
            ])
            ->whereIn('current.symbol', $watchlistSymbols)
            ->where('current.trade_date', $latestDate)
            ->where('current.series', 'EQ') // Only get EQ series for watchlist
            ->get();
        
        // Debug: Log the raw data
        \Log::info('Watchlist raw data: ' . $watchlistData->toJson());
        
        // Calculate price changes if we have previous date data
        if ($previousDate) {
            $previousData = DB::table('bhavcopy_data')
                ->select('symbol', 'close_price')
                ->whereIn('symbol', $watchlistSymbols)
                ->where('trade_date', $previousDate)
                ->where('series', 'EQ')
                ->pluck('close_price', 'symbol');
            
            // Calculate price changes
            $watchlistData->each(function ($item) use ($previousData) {
                $previousPrice = $previousData->get($item->symbol);
                if ($previousPrice) {
                    $item->price_change_absolute = $item->current_price - $previousPrice;
                    $item->price_change_percent = round((($item->current_price - $previousPrice) / $previousPrice) * 100, 2);
                }
            });
        }
        
        // Format the data like the working pages do
        $formattedData = $watchlistData->map(function ($item) {
            return [
                'symbol' => $item->symbol,
                'company_name' => $item->company_name ?? $item->symbol, // Use company name if available, otherwise fall back to symbol
                'current_price' => round($item->current_price, 2),
                'price_change_percent' => $item->price_change_percent,
                'price_change_absolute' => $item->price_change_absolute,
                'trade_date' => $item->trade_date
            ];
        });
        
        // Debug: Log the result
        \Log::info('Watchlist detailed data count: ' . $formattedData->count());
        
        return response()->json(['status' => 'success', 'data' => $formattedData]);
    }

    // Add a stock to the user's watchlist
    public function store(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'symbol' => 'required|string|max:20',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }
        $symbol = strtoupper($request->input('symbol'));
        $exists = Watchlist::where('user_id', $user->id)->where('symbol', $symbol)->exists();
        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'Stock already in watchlist'], 409);
        }
        $watch = new Watchlist();
        $watch->user_id = $user->id;
        $watch->symbol = $symbol;
        $watch->save();
        return response()->json(['status' => 'success', 'message' => 'Added to watchlist']);
    }

    // Remove a stock from the user's watchlist
    public function destroy(Request $request, $symbol)
    {
        $user = $request->user();
        $symbol = strtoupper($symbol);
        $deleted = Watchlist::where('user_id', $user->id)->where('symbol', $symbol)->delete();
        if ($deleted) {
            return response()->json(['status' => 'success', 'message' => 'Removed from watchlist']);
        } else {
            return response()->json(['status' => 'error', 'message' => 'Stock not found in watchlist'], 404);
        }
    }

    // Check if a stock is in the user's watchlist
    public function show(Request $request, $symbol)
    {
        $user = $request->user();
        $symbol = strtoupper($symbol);
        $exists = Watchlist::where('user_id', $user->id)->where('symbol', $symbol)->exists();
        return response()->json(['status' => 'success', 'in_watchlist' => $exists]);
    }
} 