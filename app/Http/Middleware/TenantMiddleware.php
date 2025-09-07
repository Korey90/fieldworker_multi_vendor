<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use App\Models\Tenant;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get tenant from authenticated user
        $user = Auth::guard('sanctum')->user();
        
        if (!$user || !$user->tenant_id) {
            return response()->json([
                'message' => 'No tenant associated with user'
            ], 403);
        }

        $tenant = Tenant::find($user->tenant_id);
        
        if (!$tenant) {
            return response()->json([
                'message' => 'Invalid tenant'
            ], 403);
        }

        // Check if tenant is active
        if ($tenant->status !== 'active') {
            return response()->json([
                'message' => 'Tenant account is not active'
            ], 403);
        }

        // Set tenant context globally
        app()->instance('current_tenant', $tenant);
        
        // Add global scope for tenant isolation
        $this->addTenantScope($tenant);

        // Add tenant ID to request for easy access
        $request->merge(['current_tenant_id' => $tenant->id]);

        return $next($request);
    }

    /**
     * Add global scope to isolate tenant data
     */
    private function addTenantScope(Tenant $tenant): void
    {
        // Add global scopes for models that have tenant_id
        $modelsWithTenantId = [
            \App\Models\User::class,
            \App\Models\Worker::class,
            \App\Models\Job::class,
            \App\Models\Asset::class,
            \App\Models\Form::class,
            \App\Models\FormResponse::class,
            \App\Models\Attachment::class,
            \App\Models\TenantQuota::class,
            \App\Models\AuditLog::class,
            \App\Models\Notification::class,
        ];

        foreach ($modelsWithTenantId as $model) {
            $model::addGlobalScope('tenant', function ($builder) use ($tenant) {
                $builder->where('tenant_id', $tenant->id);
            });
        }

        // Add scope for models that reference users (indirect tenant relationship)
        \App\Models\JobAssignment::addGlobalScope('tenant', function ($builder) use ($tenant) {
            $builder->whereHas('job', function ($query) use ($tenant) {
                $query->where('tenant_id', $tenant->id);
            });
        });

        \App\Models\Signature::addGlobalScope('tenant', function ($builder) use ($tenant) {
            $builder->whereHas('user', function ($query) use ($tenant) {
                $query->where('tenant_id', $tenant->id);
            });
        });
    }
}
