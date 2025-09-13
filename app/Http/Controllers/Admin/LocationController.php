<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Tenant;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::with(['tenant', 'sector'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenant_id', $tenantId);
            })
            ->when($request->sector_id, function ($query, $sectorId) {
                $query->where('sector_id', $sectorId);
            })
            ->when($request->location_type, function ($query, $locationType) {
                $query->where('location_type', $locationType);
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            });

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        
        if (in_array($sortField, ['name', 'city', 'location_type', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        $locations = $query->paginate(15)->withQueryString();

        // Get filter options
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        $sectors = Sector::orderBy('name')->get(['id', 'name']);
        $locationTypes = Location::distinct()->pluck('location_type')->filter()->sort()->values();

        return Inertia::render('admin/locations/index', [
            'locations' => $locations,
            'tenants' => $tenants,
            'sectors' => $sectors,
            'locationTypes' => $locationTypes,
            'filters' => $request->only(['search', 'tenant_id', 'sector_id', 'location_type', 'is_active', 'sort', 'direction']),
        ]);
    }

    public function show(Location $location)
    {
        $location->load([
            'tenant',
            'sector',
            'workers.user',
            'assets',
            'jobs.user'
        ]);

        // Get recent activities
        $recentJobs = $location->jobs()
            ->with(['user'])
            ->latest()
            ->take(5)
            ->get();

        $stats = [
            'total_workers' => $location->workers()->count(),
            'active_workers' => $location->workers()->count(), // Remove is_active filter for now
            'total_assets' => $location->assets()->count(),
            'active_jobs' => $location->jobs()->whereIn('status', ['pending', 'in_progress'])->count(),
            'completed_jobs' => $location->jobs()->where('status', 'completed')->count(),
        ];

        return Inertia::render('admin/locations/show', [
            'location' => $location,
            'recentJobs' => $recentJobs,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        $sectors = Sector::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/locations/create', [
            'tenants' => $tenants,
            'sectors' => $sectors,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|exists:tenants,id',
            'sector_id' => 'nullable|exists:sectors,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:255',
            'location_type' => 'required|string|max:100',
            'is_active' => 'boolean',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $location = Location::create($request->all());

        return redirect()->route('admin.locations.show', $location)
            ->with('success', 'Location created successfully.');
    }

    public function edit(Location $location)
    {
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        $sectors = Sector::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/locations/edit', [
            'location' => $location,
            'tenants' => $tenants,
            'sectors' => $sectors,
        ]);
    }

    public function update(Request $request, Location $location)
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|exists:tenants,id',
            'sector_id' => 'nullable|exists:sectors,id',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:255',
            'location_type' => 'required|string|max:100',
            'is_active' => 'boolean',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $location->update($request->all());

        return redirect()->route('admin.locations.show', $location)
            ->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        // Check if location has active workers or assets
        if ($location->workers()->exists() || $location->assets()->exists()) {
            return back()->with('error', 'Cannot delete location with assigned workers or assets.');
        }

        $location->delete();

        return redirect()->route('admin.locations.index')
            ->with('success', 'Location deleted successfully.');
    }

    public function workers(Location $location)
    {
        $workers = $location->workers()
            ->with(['user', 'skills', 'certifications'])
            ->paginate(10);

        return Inertia::render('admin/locations/workers', [
            'location' => $location,
            'workers' => $workers,
        ]);
    }

    public function assets(Location $location)
    {
        $assets = $location->assets()
            ->with(['assignedWorker.user'])
            ->paginate(10);

        return Inertia::render('admin/locations/assets', [
            'location' => $location,
            'assets' => $assets,
        ]);
    }

    public function jobs(Location $location)
    {
        $jobs = $location->jobs()
            ->with(['user', 'worker.user', 'assignments.worker.user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/locations/jobs', [
            'location' => $location,
            'jobs' => $jobs,
        ]);
    }
}