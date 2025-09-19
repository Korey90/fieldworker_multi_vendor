<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantQuota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class QuotaController extends Controller
{
    /**
     * Display quota management dashboard.
     */
    public function index(Request $request): Response
    {
        $query = TenantQuota::with(['tenant']);

        // Apply filters
        if ($request->filled('tenant')) {
            $query->where('tenant_id', $request->get('tenant'));
        }

        if ($request->filled('type')) {
            $query->where('quota_type', $request->get('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $quotas = $query->paginate(20);

        // Get quota types and their usage stats
        $quotaTypes = TenantQuota::select('quota_type')
            ->groupBy('quota_type')
            ->pluck('quota_type')
            ->toArray();

        // Get summary statistics
        $stats = [
            'total_quotas' => TenantQuota::count(),
            'exceeded_quotas' => TenantQuota::where('status', 'exceeded')->count(),
            'warning_quotas' => TenantQuota::where('status', 'warning')->count(),
            'unlimited_quotas' => TenantQuota::where('quota_limit', -1)->count(),
        ];

        // Transform quotas for frontend
        $quotas->through(function ($quota) {
            return [
                'id' => $quota->id,
                'tenant_id' => $quota->tenant_id,
                'tenant_name' => $quota->tenant->name ?? 'Unknown',
                'quota_type' => $quota->quota_type,
                'quota_limit' => $quota->quota_limit,
                'current_usage' => $quota->current_usage,
                'status' => $quota->status,
                'usage_percentage' => $quota->getUsagePercentage(),
                'is_unlimited' => $quota->isUnlimited(),
                'is_exceeded' => $quota->isExceeded(),
                'reset_date' => $quota->reset_date?->format('Y-m-d'),
                'metadata' => $quota->metadata,
                'updated_at' => $quota->updated_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('admin/quotas/index', [
            'quotas' => $quotas->items(),
            'pagination' => [
                'current_page' => $quotas->currentPage(),
                'last_page' => $quotas->lastPage(),
                'per_page' => $quotas->perPage(),
                'total' => $quotas->total(),
            ],
            'filters' => $request->only(['tenant', 'type', 'status']),
            'tenants' => Tenant::select('id', 'name')->get(),
            'quota_types' => $quotaTypes,
            'stats' => $stats,
        ]);
    }

    /**
     * Show quota details for a specific tenant.
     */
    public function show(Tenant $tenant): Response
    {
        $quotas = TenantQuota::where('tenant_id', $tenant->id)->get();

        // Calculate actual usage from database
        $actualUsage = [
            'users' => $tenant->users()->where('is_active', true)->count(),
            'workers' => $tenant->workers()->where('status', 'active')->count(),
            'jobs_per_month' => $tenant->jobs()->whereIn('status', ['assigned', 'in_progress', 'pending'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'assets' => $tenant->assets()->where('status', 'active')->count(),
            'storage_mb' => $this->calculateStorageUsage($tenant),
        ];

        // Transform quotas with actual usage
        $quotaData = $quotas->map(function ($quota) use ($actualUsage) {
            $actualCount = $actualUsage[$quota->quota_type] ?? 0;
            
            return [
                'id' => $quota->id,
                'tenant_id' => $quota->tenant_id,
                'quota_type' => $quota->quota_type,
                'quota_limit' => $quota->quota_limit,
                'current_usage' => $quota->current_usage,
                'actual_usage' => $actualCount,
                'usage_percentage' => $quota->getUsagePercentage(),
                'actual_percentage' => $quota->quota_limit > 0 ? round(($actualCount / $quota->quota_limit) * 100, 2) : 0,
                'status' => $quota->status,
                'is_unlimited' => $quota->isUnlimited(),
                'is_exceeded' => $quota->isExceeded(),
                'reset_date' => $quota->reset_date?->format('Y-m-d'),
                'metadata' => $quota->metadata,
                'created_at' => $quota->created_at->format('Y-m-d H:i'),
                'updated_at' => $quota->updated_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('admin/quotas/tenant', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'sector' => $tenant->sector,
                'status' => $tenant->status,
            ],
            'quotas' => $quotaData,
            'current_usage' => $actualUsage,
            'recommendations' => $this->generateRecommendations($tenant, $quotas, $actualUsage),
        ]);
    }

    /**
     * Update quotas for a tenant.
     */
    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'quotas' => 'required|array',
            'quotas.*.quota_limit' => 'required|integer|min:0',
            'quotas.*.is_unlimited' => 'boolean',
        ]);

        try {
            foreach ($validated['quotas'] as $quotaType => $quotaData) {
                $quotaLimit = $quotaData['is_unlimited'] ? -1 : $quotaData['quota_limit'];
                
                TenantQuota::updateOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'quota_type' => $quotaType,
                    ],
                    [
                        'quota_limit' => $quotaLimit,
                        'status' => 'active',
                    ]
                );
            }

            return back()->with('success', 'Quotas updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update quotas.']);
        }
    }

    /**
     * Store or update quota for a tenant.
     */
    public function store(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'quota_type' => 'required|string|in:users,workers,jobs,assets,forms,storage,api_calls',
            'quota_limit' => 'required|integer|min:-1',
            'reset_date' => 'nullable|date',
            'metadata' => 'nullable|array',
        ]);

        try {
            TenantQuota::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'quota_type' => $validated['quota_type'],
                ],
                [
                    'quota_limit' => $validated['quota_limit'],
                    'status' => 'active',
                    'reset_date' => $validated['reset_date'] ?? null,
                    'metadata' => $validated['metadata'] ?? null,
                ]
            );

            return back()->with('success', 'Quota updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update quota.']);
        }
    }

    /**
     * Update quota usage (manual adjustment).
     */
    public function updateUsage(Request $request, TenantQuota $quota): RedirectResponse
    {
        $validated = $request->validate([
            'current_usage' => 'required|integer|min:0',
            'action' => 'required|in:set,increment,decrement',
        ]);

        try {
            switch ($validated['action']) {
                case 'set':
                    $quota->current_usage = $validated['current_usage'];
                    break;
                case 'increment':
                    $quota->current_usage += $validated['current_usage'];
                    break;
                case 'decrement':
                    $quota->current_usage = max(0, $quota->current_usage - $validated['current_usage']);
                    break;
            }

            // Update status based on usage
            if ($quota->isExceeded()) {
                $quota->status = 'exceeded';
            } elseif ($quota->getUsagePercentage() >= 80) {
                $quota->status = 'warning';
            } else {
                $quota->status = 'active';
            }

            $quota->save();

            return back()->with('success', 'Quota usage updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update quota usage.']);
        }
    }

    /**
     * Reset quota usage.
     */
    public function reset(TenantQuota $quota): RedirectResponse
    {
        try {
            $quota->resetUsage();

            return back()->with('success', 'Quota reset successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to reset quota.']);
        }
    }

    /**
     * Sync quota usage with actual database counts.
     */
    public function sync(Tenant $tenant, string $quotaType): RedirectResponse
    {
        try {
            $quota = TenantQuota::where('tenant_id', $tenant->id)
                ->where('quota_type', $quotaType)
                ->first();

            if (!$quota) {
                return back()->withErrors(['error' => 'Quota not found.']);
            }

            // Calculate actual usage
            $actualUsage = match ($quotaType) {
                'users' => $tenant->users()->where('is_active', true)->count(),
                'workers' => $tenant->workers()->where('status', 'active')->count(),
                'jobs' => $tenant->jobs()->whereIn('status', ['active', 'in_progress'])->count(),
                'assets' => $tenant->assets()->where('is_active', true)->count(),
                'forms' => $tenant->forms()->where('is_active', true)->count(),
                'storage' => $this->calculateStorageUsage($tenant),
                default => 0,
            };

            $quota->current_usage = $actualUsage;

            // Update status
            if ($quota->isExceeded()) {
                $quota->status = 'exceeded';
            } elseif ($quota->getUsagePercentage() >= 80) {
                $quota->status = 'warning';
            } else {
                $quota->status = 'active';
            }

            $quota->save();

            return back()->with('success', 'Quota synced successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to sync quota.']);
        }
    }

    /**
     * Bulk update quotas for multiple tenants.
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tenant_ids' => 'required|array',
            'tenant_ids.*' => 'exists:tenants,id',
            'quota_type' => 'required|string|in:users,workers,jobs,assets,forms,storage,api_calls',
            'quota_limit' => 'required|integer|min:-1',
        ]);

        try {
            \DB::beginTransaction();

            foreach ($validated['tenant_ids'] as $tenantId) {
                TenantQuota::updateOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'quota_type' => $validated['quota_type'],
                    ],
                    [
                        'quota_limit' => $validated['quota_limit'],
                        'status' => 'active',
                    ]
                );
            }

            \DB::commit();

            return back()->with('success', 'Quotas updated for ' . count($validated['tenant_ids']) . ' tenants!');

        } catch (\Exception $e) {
            \DB::rollback();
            return back()->withErrors(['error' => 'Failed to update quotas.']);
        }
    }

    /**
     * Get quota recommendations based on usage patterns.
     */
    public function recommendations(Tenant $tenant): Response
    {
        $quotas = TenantQuota::where('tenant_id', $tenant->id)->get();
        $recommendations = [];

        foreach ($quotas as $quota) {
            $usagePercentage = $quota->getUsagePercentage();
            $recommendation = null;

            if ($quota->isExceeded()) {
                $suggestedLimit = ceil($quota->current_usage * 1.2); // 20% buffer
                $recommendation = [
                    'type' => 'increase',
                    'current_limit' => $quota->quota_limit,
                    'suggested_limit' => $suggestedLimit,
                    'reason' => 'Quota is currently exceeded',
                    'priority' => 'high',
                ];
            } elseif ($usagePercentage >= 80) {
                $suggestedLimit = ceil($quota->quota_limit * 1.5); // 50% increase
                $recommendation = [
                    'type' => 'increase',
                    'current_limit' => $quota->quota_limit,
                    'suggested_limit' => $suggestedLimit,
                    'reason' => 'Usage is approaching limit',
                    'priority' => 'medium',
                ];
            } elseif ($usagePercentage < 50 && $quota->quota_limit > 10) {
                $suggestedLimit = max(10, ceil($quota->current_usage * 1.5)); // 50% buffer but min 10
                $recommendation = [
                    'type' => 'decrease',
                    'current_limit' => $quota->quota_limit,
                    'suggested_limit' => $suggestedLimit,
                    'reason' => 'Low usage - consider reducing limit',
                    'priority' => 'low',
                ];
            }

            if ($recommendation) {
                $recommendations[] = [
                    'quota_type' => $quota->quota_type,
                    'quota_id' => $quota->id,
                    ...$recommendation,
                ];
            }
        }

        return Inertia::render('admin/quotas/recommendations', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * Calculate storage usage for tenant (placeholder implementation).
     */
    private function calculateStorageUsage(Tenant $tenant): int
    {
        // This would normally calculate actual file storage usage
        // For now, return a placeholder based on tenant data size
        return $tenant->attachments()->sum('file_size') ?? 0;
    }

    /**
     * Generate recommendations based on quota usage.
     */
    private function generateRecommendations(Tenant $tenant, $quotas, array $actualUsage): array
    {
        $recommendations = [];

        foreach ($quotas as $quota) {
            $usagePercentage = $quota->getUsagePercentage();
            $quotaType = $quota->quota_type;

            // High usage warning (>= 80%)
            if ($usagePercentage >= 80 && $usagePercentage < 100) {
                $recommendations[] = [
                    'type' => $quotaType,
                    'severity' => 'warning',
                    'message' => ucfirst($quotaType) . " quota is {$usagePercentage}% full. Consider upgrading your plan.",
                    'suggested_limit' => $quota->quota_limit * 2
                ];
            }

            // Exceeded quota (>= 100%)
            if ($usagePercentage >= 100) {
                $recommendations[] = [
                    'type' => $quotaType,
                    'severity' => 'error',
                    'message' => ucfirst($quotaType) . " quota exceeded! Upgrade immediately to avoid service disruption.",
                    'suggested_limit' => max($quota->current_usage * 1.5, $quota->quota_limit * 2)
                ];
            }

            // Underutilized quota (< 25%)
            if ($usagePercentage < 25 && $quota->quota_limit > 10) {
                $recommendations[] = [
                    'type' => $quotaType,
                    'severity' => 'info',
                    'message' => ucfirst($quotaType) . " quota is underutilized ({$usagePercentage}%). Consider downgrading to save costs.",
                    'suggested_limit' => max($quota->current_usage * 2, 10)
                ];
            }
        }

        return $recommendations;
    }

    /**
     * List tenants with quotas (for bulk management).
     */
    public function tenants(Request $request): Response
    {
        $tenants = Tenant::withCount(['users', 'workers', 'jobs', 'assets', 'sectorModel'])
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        //dd($tenants->items());

        return Inertia::render('admin/quotas/tenant', [
            'tenants' => $tenants->items(),
            'pagination' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total(),
            ],
            'filters' => $request->only(['search']),
            'tenant_data' => [
                'sectors' => $tenants->map(function ($tenant) {
                    //dd($tenant->sectorModel);
                    return [
                        'id' => $tenant->sectorModel?->id ?? 'swktor',
                        'name' => $tenant->sectorModel?->name,
                        'code' => $tenant->sectorModel?->code,
                    ];
                }),
            ],
        ]);
    }
}
