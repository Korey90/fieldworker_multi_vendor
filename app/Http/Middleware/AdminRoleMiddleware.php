<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminRoleMiddleware
{
    /**
     * Handle an incoming request for admin/manager access.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user has admin or manager role
        $userRoles = $user->roles->pluck('slug')->toArray();
        $allowedRoles = ['admin', 'manager'];
        
        $hasAccess = false;
        foreach ($allowedRoles as $role) {
            if (in_array($role, $userRoles)) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            abort(403, 'Access denied. Admin or Manager role required.');
        }

        return $next($request);
    }
}
