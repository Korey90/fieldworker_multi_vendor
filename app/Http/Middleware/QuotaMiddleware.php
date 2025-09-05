<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\TenantQuota;
use App\Models\User;
use App\Models\Job;
use Symfony\Component\HttpFoundation\Response;

class QuotaMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string $quotaType
     */
    public function handle(Request $request, Closure $next, string $quotaType): Response
    {
        $user = Auth::user();
        
        if (!$user || !$user->tenant_id) {
            return $next($request);
        }

        // Only check quotas for POST requests (creating new resources)
        if (!$request->isMethod('POST')) {
            return $next($request);
        }

        $quota = TenantQuota::where('tenant_id', $user->tenant_id)->first();

        if (!$quota) {
            // No quota defined, allow operation
            return $next($request);
        }

        // Check quota based on type
        switch ($quotaType) {
            case 'users':
                if ($quota->max_users !== null) {
                    $currentUsers = User::where('tenant_id', $user->tenant_id)->count();
                    if ($currentUsers >= $quota->max_users) {
                        return response()->json([
                            'message' => "Tenant users quota exceeded",
                            'quota_limit' => $quota->max_users,
                            'current_usage' => $currentUsers,
                            'quota_type' => $quotaType
                        ], 429);
                    }
                }
                break;
                
            case 'jobs':
                if ($quota->max_jobs_per_month !== null) {
                    $currentJobs = Job::where('tenant_id', $user->tenant_id)
                        ->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)
                        ->count();
                    if ($currentJobs >= $quota->max_jobs_per_month) {
                        return response()->json([
                            'message' => "Tenant monthly jobs quota exceeded",
                            'quota_limit' => $quota->max_jobs_per_month,
                            'current_usage' => $currentJobs,
                            'quota_type' => $quotaType
                        ], 429);
                    }
                }
                break;
                
            case 'storage':
                if ($quota->max_storage_mb !== null) {
                    // Placeholder for storage check logic
                    // You would implement actual storage calculation here
                    // For now, we'll just allow the request
                }
                break;
        }

        return $next($request);
    }
}
