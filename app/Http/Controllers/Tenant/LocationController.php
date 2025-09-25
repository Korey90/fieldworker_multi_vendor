<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    protected $tenantId;

    public function __construct()
    {
        // Apply middleware to ensure only authenticated users with tenant access
        $this->middleware(['auth', 'tenant']);

        $this->middleware(function ($request, $next) {
            $this->tenantId = Auth::user()->tenant_id;
            return $next($request);
        });
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Check if user can view locations
        if (Auth::user()->cannot('viewAny', Location::class)) {
            abort(403, 'Unauthorized to view locations.');
        }

        $perPage = $request->get('per_page', 10);
        $search = $request->get('search');
        $type = $request->get('type');
        $sector = $request->get('sector');
        $status = $request->get('status');

        $query = Location::query()
            ->where('tenant_id', $this->tenantId)
            ->with(['sector', 'tenant']);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('state', 'like', "%{$search}%")
                  ->orWhere('postal_code', 'like', "%{$search}%");
            });
        }

        // Apply type filter
        if ($type) {
            $query->where('location_type', $type);
        }

        // Apply sector filter
        if ($sector) {
            $query->where('sector_id', $sector);
        }

        // Apply status filter
        if ($status !== null) {
            $query->where('is_active', $status === 'active');
        }

        $locations = $query->orderBy('name', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        // Get filter options
        $sectors = Sector::orderBy('name')->get(['id', 'name']);
        $locationTypes = Location::where('tenant_id', $this->tenantId)
            ->distinct()
            ->pluck('location_type')
            ->filter()
            ->sort()
            ->values();

        // Get stats
        $stats = [
            'total' => Location::where('tenant_id', $this->tenantId)->count(),
            'active' => Location::where('tenant_id', $this->tenantId)->where('is_active', true)->count(),
            'inactive' => Location::where('tenant_id', $this->tenantId)->where('is_active', false)->count(),
            'types' => Location::where('tenant_id', $this->tenantId)
                ->selectRaw('location_type, COUNT(*) as count')
                ->groupBy('location_type')
                ->get()
                ->pluck('count', 'location_type')
                ->toArray(),
        ];

        return Inertia::render('tenant/locations/index', [
            'locations' => $locations,
            'sectors' => $sectors,
            'locationTypes' => $locationTypes,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'sector' => $sector,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        // Check if user can create locations
        if (Auth::user()->cannot('create', Location::class)) {
            abort(403, 'Unauthorized to create locations.');
        }

        $user = Auth::user();
        
        $sectors = Sector::orderBy('name')->get(['id', 'name']);
        
        // Get common location types for suggestions
        $locationTypes = [
            'office',
            'warehouse',
            'retail_store',
            'factory',
            'service_center',
            'remote_site',
            'construction_site',
            'other'
        ];

        return Inertia::render('tenant/locations/create', [
            'sectors' => $sectors,
            'locationTypes' => $locationTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user can create locations
        if (Auth::user()->cannot('create', Location::class)) {
            abort(403, 'Unauthorized to create locations.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'location_type' => 'required|string|max:50',
            'sector_id' => 'nullable|exists:sectors,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
            'data' => 'nullable|array',
        ]);

        $validated['tenant_id'] = $this->tenantId;

        $location = Location::create($validated);

        return redirect()
            ->route('tenant.locations.show', $location)
            ->with('success', 'Location created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Location $location): Response
    {
        // Check if user can view locations
        if (Auth::user()->cannot('view', $location)) {
            abort(403, 'Unauthorized to view this location.');
        }

        $location->load([
            'sector',
            'tenant',
            'workers.user',
            'assets',
            'jobs' => function ($query) {
                $query->latest()->take(10);
            }
        ]);

        // Get location statistics
        $stats = [
            'workers_count' => $location->workers()->count(),
            'active_workers' => $location->workers()->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })->count(),
            'assets_count' => $location->assets()->count(),
            'jobs_count' => $location->jobs()->count(),
            'active_jobs' => $location->jobs()->whereIn('status', ['pending', 'in_progress'])->count(),
            'completed_jobs' => $location->jobs()->where('status', 'completed')->count(),
        ];

        return Inertia::render('tenant/locations/show', [
            'location' => $location,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Location $location): Response
    {
        // Check if user can update locations
        if (Auth::user()->cannot('update', $location)) {
            abort(403, 'Unauthorized to edit this location.');
        }

        $sectors = Sector::orderBy('name')->get(['id', 'name']);
        
        // Get common location types for suggestions
        $locationTypes = [
            'office',
            'warehouse',
            'retail_store',
            'factory',
            'service_center',
            'remote_site',
            'construction_site',
            'other'
        ];

        return Inertia::render('tenant/locations/edit', [
            'location' => $location,
            'sectors' => $sectors,
            'locationTypes' => $locationTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Location $location)
    {
        // Check if user can update locations
        if (Auth::user()->cannot('update', $location)) {
            abort(403, 'Unauthorized to update this location.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'required|string|max:100',
            'location_type' => 'required|string|max:50',
            'sector_id' => 'nullable|exists:sectors,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
            'data' => 'nullable|array',
        ]);

        $location->update($validated);

        return redirect()
            ->route('tenant.locations.show', $location)
            ->with('success', 'Location updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Location $location)
    {
        // Check if user can delete locations
        if (Auth::user()->cannot('delete', $location)) {
            abort(403, 'Unauthorized to delete this location.');
        }

        // Check if location has any active relationships
        $workersCount = $location->workers()->count();
        $activeJobsCount = $location->jobs()->whereIn('status', ['pending', 'in_progress'])->count();
        $assetsCount = $location->assets()->count();

        if ($workersCount > 0 || $activeJobsCount > 0 || $assetsCount > 0) {
            return back()->withErrors([
                'message' => 'Cannot delete location. It has associated workers, active jobs, or assets. Please reassign or remove them first.'
            ]);
        }

        $location->delete();

        return redirect()
            ->route('tenant.locations.index')
            ->with('success', 'Location deleted successfully.');
    }

    /**
     * Get location statistics.
     */
    public function stats(): \Illuminate\Http\JsonResponse
    {

        $stats = [
            'total' => Location::where('tenant_id', $this->tenantId)->count(),
            'active' => Location::where('tenant_id', $this->tenantId)->where('is_active', true)->count(),
            'inactive' => Location::where('tenant_id', $this->tenantId)->where('is_active', false)->count(),
            'by_type' => Location::where('tenant_id', $this->tenantId)
                ->selectRaw('location_type, COUNT(*) as count')
                ->groupBy('location_type')
                ->get()
                ->pluck('count', 'location_type'),
            'by_sector' => Location::where('tenant_id', $this->tenantId)
                ->join('sectors', 'locations.sector_id', '=', 'sectors.id')
                ->selectRaw('sectors.name, COUNT(*) as count')
                ->groupBy('sectors.name')
                ->get()
                ->pluck('count', 'name'),
            'with_workers' => Location::where('tenant_id', $this->tenantId)
                ->has('workers')
                ->count(),
            'with_assets' => Location::where('tenant_id', $this->tenantId)
                ->has('assets')
                ->count(),
        ];

        return response()->json($stats);
    }
}