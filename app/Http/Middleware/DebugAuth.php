<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class DebugAuth
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('DebugAuth: Sprawdzanie autentyfikacji', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_id' => Auth::id(),
            'is_authenticated' => Auth::check(),
            'guard' => Auth::getDefaultDriver(),
            'session_id' => session()->getId(),
        ]);

        return $next($request);
    }
}
