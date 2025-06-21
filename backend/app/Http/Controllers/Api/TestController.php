<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Test endpoint for Phase 2
     */
    public function index()
    {
        return response()->json([
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
    }
} 