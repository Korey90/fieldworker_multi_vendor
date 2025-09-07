<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TenantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $tenants = Tenant::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->sector, function ($query, $sector) {
                $query->where('sector', $sector);
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
            'sector' => 'required|string|in:construction,agriculture,manufacturing,healthcare,retail',
            'data' => 'nullable|array',
        ]);
        
        // Generate slug from name
        $validated['slug'] = strtolower(str_replace(' ', '-', $validated['name']));

        $tenant = Tenant::create($validated);

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
        $tenant = Tenant::with(['users', 'workers', 'locations', 'assets'])->findOrFail($id);

        return response()->json([
            'data' => new TenantResource($tenant)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sector' => 'sometimes|required|string|in:construction,agriculture,manufacturing,healthcare,retail',
            'data' => 'nullable|array',
        ]);

        $tenant->update($validated);

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
        $tenant = Tenant::findOrFail($id);
        
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
        $tenant = Tenant::with(['users', 'workers', 'locations', 'assets'])->findOrFail($id);

        $stats = [
            'users_count' => $tenant->users->count(),
            'workers_count' => $tenant->workers->count(),
            'locations_count' => $tenant->locations->count(),
            'assets_count' => $tenant->assets->count(),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}
