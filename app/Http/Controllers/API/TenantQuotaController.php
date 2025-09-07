<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TenantQuotaRequest;
use App\Http\Resources\TenantQuotaResource;
use App\Models\TenantQuota;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TenantQuotaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $quotas = TenantQuota::with(['tenant'])
            ->when(request('tenant_id'), function ($query, $tenantId) {
                return $query->where('tenant_id', $tenantId);
            })
            ->when(request('quota_type'), function ($query, $quotaType) {
                return $query->where('quota_type', $quotaType);
            })
            ->when(request('status'), function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(request('per_page', 15));

        return TenantQuotaResource::collection($quotas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TenantQuotaRequest $request)
    {
        $quota = TenantQuota::create($request->validated());
        $quota->load(['tenant']);

        return new TenantQuotaResource($quota);
    }

    /**
     * Display the specified resource.
     */
    public function show(TenantQuota $tenantQuota)
    {
        $tenantQuota->load(['tenant']);
        return new TenantQuotaResource($tenantQuota);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TenantQuotaRequest $request, TenantQuota $tenantQuota)
    {
        $tenantQuota->update($request->validated());
        $tenantQuota->load(['tenant']);

        return new TenantQuotaResource($tenantQuota);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TenantQuota $tenantQuota)
    {
        $tenantQuota->delete();
        return response()->noContent();
    }

    /**
     * Get usage statistics for a tenant
     */
    public function usage(Request $request)
    {
        $tenantId = $request->input('tenant_id') ?? auth()->user()?->tenant_id;
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID is required'], 400);
        }

        $quotas = TenantQuota::where('tenant_id', $tenantId)->get();
        
        $usage = $quotas->map(function ($quota) {
            $usagePercentage = $quota->quota_limit > 0 
                ? ($quota->current_usage / $quota->quota_limit) * 100 
                : 0;
            
            return [
                'quota_type' => $quota->quota_type,
                'limit' => $quota->quota_limit,
                'current_usage' => $quota->current_usage,
                'usage_percentage' => round($usagePercentage, 2),
                'status' => $quota->status,
                'is_exceeded' => $quota->current_usage > $quota->quota_limit,
                'reset_date' => $quota->reset_date,
            ];
        });

        return response()->json([
            'tenant_id' => $tenantId,
            'quotas' => $usage,
            'total_quotas' => $quotas->count(),
            'exceeded_quotas' => $usage->where('is_exceeded', true)->count(),
        ]);
    }

    /**
     * Reset quota usage
     */
    public function reset(TenantQuota $tenantQuota)
    {
        $tenantQuota->update([
            'current_usage' => 0,
            'reset_date' => now()->addMonth(),
        ]);

        return new TenantQuotaResource($tenantQuota);
    }

    /**
     * Increment quota usage
     */
    public function increment(Request $request, TenantQuota $tenantQuota)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $tenantQuota->increment('current_usage', $request->input('amount'));
        
        // Check if quota is exceeded and update status
        if ($tenantQuota->current_usage > $tenantQuota->quota_limit) {
            $tenantQuota->update(['status' => 'exceeded']);
        }

        return new TenantQuotaResource($tenantQuota);
    }

    /**
     * Get quota alerts
     */
    public function alerts(Request $request)
    {
        $tenantId = $request->input('tenant_id');
        
        $query = TenantQuota::query();
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        $alerts = $query->where(function ($q) {
            $q->where('status', 'exceeded')
              ->orWhereRaw('current_usage >= (quota_limit * 0.8)'); // 80% threshold
        })
        ->with(['tenant'])
        ->get();

        return response()->json([
            'alerts' => $alerts->map(function ($quota) {
                $usagePercentage = $quota->quota_limit > 0 
                    ? ($quota->current_usage / $quota->quota_limit) * 100 
                    : 0;
                
                return [
                    'id' => $quota->id,
                    'tenant' => $quota->tenant?->name,
                    'quota_type' => $quota->quota_type,
                    'usage_percentage' => round($usagePercentage, 2),
                    'current_usage' => $quota->current_usage,
                    'quota_limit' => $quota->quota_limit,
                    'status' => $quota->status,
                    'severity' => $usagePercentage >= 100 ? 'critical' : 'warning',
                ];
            }),
            'total_alerts' => $alerts->count(),
            'critical_alerts' => $alerts->where('status', 'exceeded')->count(),
        ]);
    }
}
