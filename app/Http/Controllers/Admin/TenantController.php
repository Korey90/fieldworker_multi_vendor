<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Sector;
use App\Models\Feature;
use App\Models\TenantQuota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TenantController extends Controller
{
    /**
     * Display a listing of tenants.
     */
    public function index(Request $request): Response
    {
        $query = Tenant::with(['sectorModel', 'quotas', 'features']);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('sector', 'LIKE', "%{$search}%");
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $status = $request->get('status');
            $query->whereRaw("JSON_EXTRACT(data, '$.status') = ?", [$status]);
        }

        // Apply sector filter
        if ($request->filled('sector')) {
            $query->where('sector', $request->get('sector'));
        }

        $tenants = $query->paginate(12);

        // Transform data for frontend
        $tenants->through(function ($tenant) {
            $activeUsersCount = $tenant->users()->where('is_active', true)->count();
            $activeWorkersCount = $tenant->workers()->where('status', 'active')->count();
            $activeJobsCount = $tenant->jobs()->whereIn('status', ['active', 'in_progress'])->count();

            return [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'sector' => $tenant->sector,
                'sector_name' => $tenant->sectorModel?->name ?? 'Unknown',
                'status' => $tenant->status,
                'created_at' => $tenant->created_at->format('Y-m-d'),
                'stats' => [
                    'users' => $activeUsersCount,
                    'workers' => $activeWorkersCount,
                    'jobs' => $activeJobsCount,
                ],
                'quota' => $tenant->quotaSummary ? [
                    'users_limit' => $tenant->quotaSummary->max_users,
                    'users_used' => $activeUsersCount,
                    'storage_limit' => $tenant->quotaSummary->max_storage_gb,
                    'storage_used' => $tenant->quotaSummary->current_storage_gb,
                ] : null,
                'features' => $tenant->features->pluck('name')->toArray(),
            ];
        });

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants->items(),
            'pagination' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total(),
            ],
            'filters' => $request->only(['search', 'status', 'sector']),
            'sectors' => Sector::select('code', 'name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new tenant.
     */
    public function create(): Response
    {
        return Inertia::render('admin/tenants/create', [
            'sectors' => Sector::select('code', 'name')->get(),
            'features' => Feature::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    /**
     * Store a newly created tenant in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sector' => 'required|exists:sectors,code',
            'status' => 'required|in:active,inactive,suspended',
            'description' => 'nullable|string|max:1000',
            'features' => 'array',
            'features.*' => 'exists:features,id',
            'max_users' => 'nullable|integer|min:1|max:1000',
            'max_storage_gb' => 'nullable|numeric|min:0.5|max:1000',
        ]);

        try {
            \DB::beginTransaction();

            // Prepare data field with status and description
            $data = [
                'status' => $validated['status'],
                'created_by' => auth()->id(),
            ];
            
            if (!empty($validated['description'])) {
                $data['description'] = $validated['description'];
            }

            // Create tenant
            $tenant = Tenant::create([
                'name' => $validated['name'],
                'sector' => $validated['sector'],
                'data' => $data,
            ]);

            // Attach features
            if (!empty($validated['features'])) {
                $tenant->features()->attach($validated['features']);
            }

            // Create quotas if provided
            if (isset($validated['max_users'])) {
                TenantQuota::create([
                    'tenant_id' => $tenant->id,
                    'quota_type' => 'users',
                    'quota_limit' => $validated['max_users'],
                    'current_usage' => 0,
                ]);
            }
            
            if (isset($validated['max_storage_gb'])) {
                TenantQuota::create([
                    'tenant_id' => $tenant->id,
                    'quota_type' => 'storage',
                    'quota_limit' => (int) ($validated['max_storage_gb'] * 1024), // Convert GB to MB
                    'current_usage' => 0,
                ]);
            }

            \DB::commit();

            return redirect()
                ->route('admin.tenants.show', $tenant)
                ->with('success', 'Tenant created successfully!');

        } catch (\Exception $e) {
            \DB::rollback();
            
            return back()
                ->withErrors(['error' => 'Failed to create tenant. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Display the specified tenant.
     */
    public function show(Tenant $tenant): Response
    {
       // dd($tenant);
        $tenant->load(['sectorModel', 'quotas', 'features', 'users', 'workers', 'jobs']);

        // Calculate statistics
        $stats = [
            'total_users' => $tenant->users()->count(),
            'active_users' => $tenant->users()->where('is_active', true)->count(),
            'total_workers' => $tenant->workers()->count(),
            'active_workers' => $tenant->workers()->where('status', 'active')->count(),
            'total_jobs' => $tenant->jobs()->count(),
            'active_jobs' => $tenant->jobs()->whereIn('status', ['active', 'in_progress'])->count(),
            'completed_jobs' => $tenant->jobs()->where('status', 'completed')->count(),
        ];

        // Recent activity
        $recentUsers = $tenant->users()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at']);

        $recentJobs = $tenant->jobs()
            ->with(['location:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'status', 'location_id', 'created_at']);

        return Inertia::render('admin/tenants/show', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'sector' => $tenant->sector,
                'sector_name' => $tenant->sectorModel?->name ?? 'Unknown',
                'status' => $tenant->status,
                'created_at' => $tenant->created_at->format('Y-m-d H:i'),
                'updated_at' => $tenant->updated_at->format('Y-m-d H:i'),
                'data' => $tenant->data,
            ],
            'stats' => $stats,
            'quota' => $tenant->quota,
            'features' => $tenant->features,
            'recent_users' => $recentUsers,
            'recent_jobs' => $recentJobs->map(function ($job) {
                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'status' => $job->status,
                    'location' => $job->location?->name ?? 'Unknown',
                    'created_at' => $job->created_at->diffForHumans(),
                ];
            }),
        ]);
    }

    /**
     * Show the form for editing the specified tenant.
     */
    public function edit(Tenant $tenant): Response
    {
        $tenant->load(['features', 'quotas']);

        // Get description from data field
        $data = $tenant->data ?? [];
        $description = $data['description'] ?? null;

        return Inertia::render('admin/tenants/edit', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'sector' => $tenant->sector,
                'status' => $tenant->status,
                'description' => $description,
                'data' => $tenant->data,
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
                'features' => $tenant->features,
                'quota_summary' => $tenant->quota_summary,
            ],
            'sectors' => Sector::select('code', 'name')->get(),
            'features' => Feature::where('is_active', true)->select('id', 'name', 'description')->get(),
        ]);
    }

    /**
     * Update the specified tenant in storage.
     */
    public function update(Request $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sector' => 'required|exists:sectors,code',
            'status' => 'required|in:active,inactive,suspended',
            'description' => 'nullable|string|max:1000',
            'features' => 'array',
            'features.*' => 'exists:features,id',
            'max_users' => 'nullable|integer|min:1|max:1000',
            'max_storage_gb' => 'nullable|numeric|min:0.5|max:1000',
        ]);

        try {
            \DB::beginTransaction();

            // Update tenant data
            $data = $tenant->data ?? [];
            $data['status'] = $validated['status'];
            $data['updated_by'] = auth()->id();
            
            if (isset($validated['description'])) {
                $data['description'] = $validated['description'];
            }

            $tenant->update([
                'name' => $validated['name'],
                'sector' => $validated['sector'],
                'data' => $data,
            ]);

            // Sync features
            $tenant->features()->sync($validated['features'] ?? []);

            // Update or create user quota
            if (isset($validated['max_users'])) {
                $userQuota = $tenant->quotas()->where('quota_type', 'users')->first();
                if ($userQuota) {
                    $userQuota->update(['quota_limit' => $validated['max_users']]);
                } else {
                    TenantQuota::create([
                        'tenant_id' => $tenant->id,
                        'quota_type' => 'users',
                        'quota_limit' => $validated['max_users'],
                        'current_usage' => 0,
                    ]);
                }
            }

            // Update or create storage quota
            if (isset($validated['max_storage_gb'])) {
                $storageQuota = $tenant->quotas()->where('quota_type', 'storage')->first();
                $limitInMB = (int) ($validated['max_storage_gb'] * 1024);
                
                if ($storageQuota) {
                    $storageQuota->update(['quota_limit' => $limitInMB]);
                } else {
                    TenantQuota::create([
                        'tenant_id' => $tenant->id,
                        'quota_type' => 'storage',
                        'quota_limit' => $limitInMB,
                        'current_usage' => 0,
                    ]);
                }
            }

            \DB::commit();

            return redirect()
                ->route('admin.tenants.show', $tenant)
                ->with('success', 'Tenant updated successfully!');

        } catch (\Exception $e) {
            \DB::rollback();
            
            return back()
                ->withErrors(['error' => 'Failed to update tenant. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Remove the specified tenant from storage.
     */
    public function destroy(Tenant $tenant): RedirectResponse
    {
        try {
            // Soft delete the tenant
            $tenant->delete();

            return redirect()
                ->route('admin.tenants.index')
                ->with('success', 'Tenant deleted successfully!');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete tenant. Please try again.']);
        }
    }

    /**
     * Suspend the specified tenant.
     */
    public function suspend(Tenant $tenant): RedirectResponse
    {
        try {
            $data = $tenant->data ?? [];
            $data['status'] = 'suspended';
            $data['suspended_by'] = auth()->id();
            $data['suspended_at'] = now()->toISOString();

            $tenant->update(['data' => $data]);

            return back()->with('success', 'Tenant suspended successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to suspend tenant.']);
        }
    }

    /**
     * Activate the specified tenant.
     */
    public function activate(Tenant $tenant): RedirectResponse
    {
        try {
            $data = $tenant->data ?? [];
            $data['status'] = 'active';
            $data['activated_by'] = auth()->id();
            $data['activated_at'] = now()->toISOString();

            $tenant->update(['data' => $data]);

            return back()->with('success', 'Tenant activated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to activate tenant.']);
        }
    }

    public function quotas(Tenant $tenant): Response
    {
        $tenant->load(['quotas']);

        return Inertia::render('admin/tenants/quotas', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'sector' => $tenant->sector,
                'status' => $tenant->status,
            ],
            'quotas' => $tenant->quotas->map(function ($quota) {
                return [
                    'id' => $quota->id,
                    'quota_type' => $quota->quota_type,
                    'quota_limit' => $quota->quota_limit,
                    'current_usage' => $quota->current_usage,
                    'created_at' => $quota->created_at->format('Y-m-d H:i'),
                    'updated_at' => $quota->updated_at->format('Y-m-d H:i'),
                ];
            }),
        ]);
    }
}
