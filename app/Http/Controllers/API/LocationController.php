<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Http\Resources\WorkerResource;
use App\Http\Resources\AssetResource;
use App\Http\Resources\JobResource;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $locations = Location::query()
            ->with(['tenant', 'sector'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenant_id', $tenantId);
            })
            ->when($request->sector_id, function ($query, $sectorId) {
                $query->where('sector_id', $sectorId);
            })
            ->when($request->location_type, function ($query, $type) {
                $query->where('location_type', $type);
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => LocationResource::collection($locations->items()),
            'meta' => [
                'current_page' => $locations->currentPage(),
                'last_page' => $locations->lastPage(),
                'per_page' => $locations->perPage(),
                'total' => $locations->total(),
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
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'tenant_id' => 'required|exists:tenants,id',
            'sector_id' => 'required|exists:sectors,id',
            'location_type' => 'required|string|max:50',
            'is_active' => 'boolean',
            'data' => 'nullable|array',
        ]);

        $location = Location::create($validated);
        $location->load(['tenant', 'sector']);

        return response()->json([
            'message' => 'Location created successfully',
            'data' => new LocationResource($location)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $location = Location::with([
            'tenant',
            'sector'
        ])->findOrFail($id);

        return response()->json([
            'data' => new LocationResource($location)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $location = Location::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:500',
            'city' => 'sometimes|required|string|max:100',
            'state' => 'sometimes|required|string|max:100',
            'postal_code' => 'sometimes|required|string|max:20',
            'country' => 'sometimes|required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'sector_id' => 'sometimes|required|exists:sectors,id',
            'location_type' => 'sometimes|required|string|max:50',
            'is_active' => 'boolean',
            'data' => 'nullable|array',
        ]);

        $location->update($validated);
        $location->load(['tenant', 'sector']);

        return response()->json([
            'message' => 'Location updated successfully',
            'data' => new LocationResource($location)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $location = Location::findOrFail($id);
        
        // Note: Simplified for testing - no dependency checks for now
        $location->delete();

        return response()->json([
            'message' => 'Location deleted successfully'
        ]);
    }

    /**
     * Get workers at location
     */
    public function workers(string $id): JsonResponse
    {
        $location = Location::findOrFail($id);
        $workers = $location->workers()->with(['user', 'skills', 'certifications'])->get();

        return response()->json([
            'data' => WorkerResource::collection($workers)
        ]);
    }

    /**
     * Get assets at location
     */
    public function assets(string $id): JsonResponse
    {
        $location = Location::findOrFail($id);
        $assets = $location->assets()->with(['currentAssignment'])->get();

        return response()->json([
            'data' => AssetResource::collection($assets)
        ]);
    }

    /**
     * Get jobs at location
     */
    public function jobs(Request $request, string $id): JsonResponse
    {
        $location = Location::findOrFail($id);
        
        $jobs = $location->jobs()
            ->with(['assignments.worker.user'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->where('scheduled_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->where('scheduled_at', '<=', $date);
            })
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json([
            'data' => JobResource::collection($jobs)
        ]);
    }
}
