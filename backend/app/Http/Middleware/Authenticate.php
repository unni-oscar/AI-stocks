<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        \Log::debug('Authenticate@redirectTo called', [
            'path' => $request->path(),
            'is_api' => $request->is('api/*')
        ]);
        // For API requests, return null to prevent redirect
        if ($request->is("api/*")) {
            return null;
        }
        // Only redirect for web routes, not API routes
        return null;
    }
} 