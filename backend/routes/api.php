<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\AuthController;

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

// Handle CORS preflight requests
Route::options('/{any}', function () {
    $response = response('', 200);
    $response->headers->set('Access-Control-Allow-Origin', '*');
    $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    $response->headers->set('Access-Control-Max-Age', '86400');
    return $response;
})->where('any', '.*');

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route for Phase 2
Route::get('/test', [TestController::class, 'index']);

// Test CORS route with explicit middleware
Route::get('/test-cors', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'CORS test endpoint',
        'timestamp' => now()->toISOString()
    ]);
})->middleware(\App\Http\Middleware\HandleCors::class);

// Health check route
Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Laravel API is running',
        'timestamp' => now()->toISOString()
    ]);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Original user route
    Route::get('/user-info', function (Request $request) {
        return $request->user();
    });
}); 