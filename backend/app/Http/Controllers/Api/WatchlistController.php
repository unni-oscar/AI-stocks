<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Watchlist;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WatchlistController extends Controller
{
    // List all stocks in the user's watchlist
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Debug: Check if user is authenticated
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not authenticated'], 401);
        }
        
        // Debug: Log user ID
        \Log::info('Watchlist request for user ID: ' . $user->id);
        
        // Debug: Check if data exists
        $count = Watchlist::where('user_id', $user->id)->count();
        \Log::info('Watchlist count for user ' . $user->id . ': ' . $count);
        
        $watchlist = Watchlist::where('user_id', $user->id)->pluck('symbol');
        
        // Debug: Log the result
        \Log::info('Watchlist data: ' . $watchlist->toJson());
        
        return response()->json(['status' => 'success', 'data' => $watchlist]);
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