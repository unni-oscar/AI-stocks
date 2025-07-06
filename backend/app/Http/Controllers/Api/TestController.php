<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function index()
    {
        $response = response()->json([
            'status' => 'success',
            'message' => 'Laravel API is working!',
            'data' => [
                'framework' => 'Laravel',
                'version' => '10.x',
                'database' => 'PostgreSQL',
                'port' => '3034',
                'timestamp' => now()->toISOString()
            ]
        ]);

        // Add CORS headers directly to the response
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        return $response;
    }
} 