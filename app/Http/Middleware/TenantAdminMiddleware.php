<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantAdminMiddleware
{
    /**
     * Handle an incoming request.
     * 
     * Ensures user is authenticated and belongs to a tenant with appropriate permissions
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user belongs to a tenant
        if (!$user->tenant_id) {
            abort(403, 'Access denied. User must belong to a tenant.');
        }

        // Check if user has tenant admin or management permissions
        if (!$user->hasAnyRole(['admin', 'manager'])) {
            abort(403, 'Access denied. Insufficient permissions.');
        }

        return $next($request);
    }
}