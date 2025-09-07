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

        $quota = TenantQuota::forTenant($user->tenant_id)
            ->byType($quotaType)
            ->where('status', '!=', 'inactive')
            ->first();

        if (!$quota) {
            // No quota defined, allow operation
            return $next($request);
        }

        // Check if quota is unlimited
        if ($quota->isUnlimited()) {
            return $next($request);
        }

        // Check quota based on type
        $currentUsage = $this->getCurrentUsage($quotaType, $user->tenant_id);
        
        // Jeśli current_usage w kwot jest wyższy niż rzeczywiste liczenie, użyj tego
        $effectiveUsage = max($currentUsage, $quota->current_usage);
        
        if ($effectiveUsage >= $quota->quota_limit) {
            return response()->json([
                'message' => "Tenant {$quotaType} quota exceeded",
                'quota_limit' => $quota->quota_limit,
                'current_usage' => $effectiveUsage,
                'quota_type' => $quotaType
            ], 429);
        }

        return $next($request);
    }

    /**
     * Get current usage for quota type
     */
    private function getCurrentUsage(string $quotaType, string $tenantId): int
    {
        return match ($quotaType) {
            'users' => User::where('tenant_id', $tenantId)->count(),
            'jobs' => Job::where('tenant_id', $tenantId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'workers' => \App\Models\Worker::where('tenant_id', $tenantId)->count(),
            'assets' => \App\Models\Asset::where('tenant_id', $tenantId)->count(),
            // Storage calculation would need more complex logic
            'storage' => 0, // Placeholder
            default => 0,
        };
    }
}
