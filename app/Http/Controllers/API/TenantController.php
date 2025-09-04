<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\Tenat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $tenants = Tenat::query()
            ->with(['sector', 'quota', 'features'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('domain', 'like', "%{$search}%");
            })
            ->when($request->sector_id, function ($query, $sectorId) {
                $query->where('sector_id', $sectorId);
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => TenantResource::collection($tenants->items()),
            'meta' => [
                'current_page' => $tenants->currentPage(),
                'last_page' => $tenants->lastPage(),
                'per_page' => $tenants->perPage(),
                'total' => $tenants->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:tenats,domain',
            'sector_id' => 'required|exists:sectors,id',
            'data' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $tenant = Tenat::create($validated);
        $tenant->load(['sector', 'quota', 'features']);

        return response()->json([
            'message' => 'Tenant created successfully',
            'data' => new TenantResource($tenant)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $tenant = Tenat::with([
            'sector', 
            'quota', 
            'features', 
            'users.roles', 
            'workers.skills', 
            'locations',
            'assets'
        ])->findOrFail($id);

        return response()->json([
            'data' => new TenantResource($tenant)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = Tenat::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'domain' => 'sometimes|required|string|max:255|unique:tenats,domain,' . $tenant->id,
            'sector_id' => 'sometimes|required|exists:sectors,id',
            'data' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $tenant->update($validated);
        $tenant->load(['sector', 'quota', 'features']);

        return response()->json([
            'message' => 'Tenant updated successfully',
            'data' => new TenantResource($tenant)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $tenant = Tenat::findOrFail($id);
        
        // Check if tenant has users or other dependencies
        if ($tenant->users()->count() > 0) {
            return response()->json([
                'error' => 'Cannot delete tenant with active users'
            ], 422);
        }

        $tenant->delete();

        return response()->json([
            'message' => 'Tenant deleted successfully'
        ]);
    }

    /**
     * Get tenant statistics
     */
    public function stats(string $id): JsonResponse
    {
        $tenant = Tenat::with(['users', 'workers', 'locations', 'assets', 'jobs'])->findOrFail($id);

        $stats = [
            'users_count' => $tenant->users->count(),
            'workers_count' => $tenant->workers->count(),
            'locations_count' => $tenant->locations->count(),
            'assets_count' => $tenant->assets->count(),
            'jobs_count' => $tenant->jobs->count(),
            'active_jobs_count' => $tenant->jobs->where('status', 'active')->count(),
            'completed_jobs_count' => $tenant->jobs->where('status', 'completed')->count(),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}
