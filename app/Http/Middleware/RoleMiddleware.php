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
     * @param  string ...$roles - Role names passed as separate parameters
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Try web guard first, then sanctum
        $user = Auth::user() ?? Auth::guard('sanctum')->user();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated'
                ], 401);
            }
            
            return redirect()->route('login');
        }

        // Check if user has any of the required roles
        $hasRole = false;
        $userRoles = $user->roles->pluck('slug')->toArray(); // Use slug instead of name
        
        foreach ($roles as $role) {
            if (in_array(trim($role), $userRoles)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Insufficient role privileges',
                    'required_roles' => $roles,
                    'user_roles' => $userRoles
                ], 403);
            }
            
            return redirect()->route('login')->with('error', 'Insufficient permissions.');
        }

        return $next($request);
    }
}
