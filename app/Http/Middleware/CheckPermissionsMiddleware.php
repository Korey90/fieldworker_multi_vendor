<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermissionsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|array $permissions
     * @param  string $guard (optional)
     */
    public function handle(Request $request, Closure $next, string|array $permissions, string $guard = 'web'): Response
    {
        $user = Auth::guard($guard)->user();

        if (!$user) {
            abort(401, 'Unauthenticated');
        }

        // Convert string to array
        if (is_string($permissions)) {
            $permissions = explode('|', $permissions);
        }

        // Check if user has any of the required permissions
        $hasPermission = false;
        
        foreach ($permissions as $permission) {
            if ($this->userHasPermission($user, trim($permission))) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            abort(403, 'Insufficient permissions');
        }

        return $next($request);
    }

    /**
     * Check if user has specific permission
     */
    private function userHasPermission($user, string $permission): bool
    {
        // Check role-based permissions
        foreach ($user->roles as $role) {
            if ($role->permissions->contains('key', $permission)) {
                return true;
            }
        }

        // Special admin check - if user has Administrator role
        if ($user->roles->contains('name', 'Administrator')) {
            return true;
        }

        return false;
    }
}
