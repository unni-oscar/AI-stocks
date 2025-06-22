<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BhavcopyController;

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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Bhavcopy routes
    Route::post('/bhavcopy/fetch', [BhavcopyController::class, 'fetchMonth']);
    Route::get('/bhavcopy/processed-dates', [BhavcopyController::class, 'getProcessedDates']);
    Route::get('/bhavcopy/stats', [BhavcopyController::class, 'getStats']);
}); 