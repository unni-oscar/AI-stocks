<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BhavcopyController;
use App\Http\Controllers\Api\StockAnalysisController;
use App\Http\Controllers\Api\WatchlistController;
use App\Http\Controllers\Api\DeliverySpikesController;
use App\Http\Controllers\Api\StockMasterController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/bhavcopy/test', [BhavcopyController::class, 'test']);

// Test route for Phase 2
Route::get('/test', [TestController::class, 'index']);

// Temporary test route for analysis (remove after testing)
Route::get('/analysis/delivery-test', [StockAnalysisController::class, 'getDeliveryAnalysis']);

// Stock Analysis routes (temporarily public for testing)
Route::get('/analysis/delivery', [StockAnalysisController::class, 'getDeliveryAnalysis']);
Route::get('/analysis/summary', [StockAnalysisController::class, 'getSummaryStats']);
Route::get('/analysis/master-stocks', [StockAnalysisController::class, 'getMasterStocks']);
Route::get('/analysis/stock/{symbol}', [StockAnalysisController::class, 'getStockDetails']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Bhavcopy routes
    Route::get('/bhavcopy/eq-stocks', [BhavcopyController::class, 'getEqStocks']);
    Route::post('/bhavcopy/fetch', [BhavcopyController::class, 'fetchMonth']);
    Route::get('/bhavcopy/processed-dates', [BhavcopyController::class, 'getProcessedDates']);
    Route::get('/bhavcopy/database-dates', [BhavcopyController::class, 'getDatabaseDates']);
    Route::get('/bhavcopy/stats', [BhavcopyController::class, 'getStats']);
    Route::post('/bhavcopy/process', [BhavcopyController::class, 'processData']);
    Route::get('/bhavcopy/database-stats', [BhavcopyController::class, 'getDatabaseStats']);

    Route::get('/bhavcopy/ohlc/{symbol}', [BhavcopyController::class, 'getOhlc']);
    Route::get('/bhavcopy/download', [BhavcopyController::class, 'downloadCsv']);
    Route::post('/bhavcopy/fetch-day', [BhavcopyController::class, 'fetchDayCsv']);

    // Delivery Spikes routes
    Route::get('/delivery-spikes', [DeliverySpikesController::class, 'index']);

    // Watchlist routes
    Route::get('/watchlist', [WatchlistController::class, 'index']);
    Route::post('/watchlist', [WatchlistController::class, 'store']);
    Route::delete('/watchlist/{symbol}', [WatchlistController::class, 'destroy']);
    Route::get('/watchlist/{symbol}', [WatchlistController::class, 'show']);

    // Stock Master routes
    Route::post('/stock-master/upload-csv', [StockMasterController::class, 'uploadCsv']);
    Route::get('/stock-master/filter-options', [StockMasterController::class, 'getFilterOptions']);
    Route::get('/stock-master/hierarchical-filters', [StockMasterController::class, 'getHierarchicalFilters']);
    Route::get('/stock-master/stocks', [StockMasterController::class, 'getStocks']);
    Route::get('/stock-master/statistics', [StockMasterController::class, 'getStatistics']);
});

Route::get('/ping', function () {
    return response()->json(['pong' => true]);
}); 