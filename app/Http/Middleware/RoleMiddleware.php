<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|array $roles
     * @param  string $guard (optional)
     */
    public function handle(Request $request, Closure $next, string|array $roles, string $guard = 'web'): Response
    {
        $user = Auth::guard($guard)->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Convert string to array
        if (is_string($roles)) {
            $roles = explode('|', $roles);
        }

        // Check if user has any of the required roles
        $hasRole = false;
        $userRoles = $user->roles->pluck('name')->toArray();
        
        foreach ($roles as $role) {
            if (in_array(trim($role), $userRoles)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            return response()->json([
                'message' => 'Insufficient role privileges',
                'required_roles' => $roles,
                'user_roles' => $userRoles
            ], 403);
        }

        return $next($request);
    }
}
