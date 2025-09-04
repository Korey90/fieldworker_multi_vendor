<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $assets = Asset::query()
            ->with(['tenant', 'location', 'currentAssignment', 'auditLogs'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('asset_type', 'like', "%{$search}%");
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->when($request->location_id, function ($query, $locationId) {
                $query->where('location_id', $locationId);
            })
            ->when($request->asset_type, function ($query, $type) {
                $query->where('asset_type', $type);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => AssetResource::collection($assets->items()),
            'meta' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
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
            'description' => 'nullable|string',
            'tenat_id' => 'required|exists:tenats,id',
            'location_id' => 'required|exists:locations,id',
            'asset_type' => 'required|string|max:100',
            'serial_number' => 'nullable|string|max:100|unique:assets,serial_number',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,maintenance,retired',
            'data' => 'nullable|array',
        ]);

        $asset = Asset::create($validated);
        $asset->load(['tenant', 'location']);

        return response()->json([
            'message' => 'Asset created successfully',
            'data' => new AssetResource($asset)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $asset = Asset::with([
            'tenant.sector',
            'location',
            'currentAssignment.user',
            'auditLogs.user'
        ])->findOrFail($id);

        return response()->json([
            'data' => new AssetResource($asset)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location_id' => 'sometimes|required|exists:locations,id',
            'asset_type' => 'sometimes|required|string|max:100',
            'serial_number' => 'nullable|string|max:100|unique:assets,serial_number,' . $asset->id,
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:active,inactive,maintenance,retired',
            'data' => 'nullable|array',
        ]);

        $asset->update($validated);
        $asset->load(['tenant', 'location', 'currentAssignment']);

        return response()->json([
            'message' => 'Asset updated successfully',
            'data' => new AssetResource($asset)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);
        
        // Check if asset is currently assigned
        if ($asset->currentAssignment) {
            return response()->json([
                'error' => 'Cannot delete asset that is currently assigned'
            ], 422);
        }

        $asset->delete();

        return response()->json([
            'message' => 'Asset deleted successfully'
        ]);
    }

    /**
     * Assign asset to worker
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'notes' => 'nullable|string',
        ]);

        $worker = Worker::findOrFail($validated['worker_id']);

        // Check if asset is already assigned
        if ($asset->currentAssignment) {
            return response()->json([
                'error' => 'Asset is already assigned to another worker'
            ], 422);
        }

        // Update asset with assignment
        $asset->update([
            'assigned_to' => $worker->id,
            'data' => array_merge($asset->data ?? [], [
                'assigned_at' => now(),
                'assigned_by' => auth()->id(),
                'assignment_notes' => $validated['notes'] ?? null,
            ])
        ]);

        $asset->load(['currentAssignment.user']);

        return response()->json([
            'message' => 'Asset assigned successfully',
            'data' => new AssetResource($asset)
        ]);
    }

    /**
     * Unassign asset from worker
     */
    public function unassign(Request $request, string $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        if (!$asset->currentAssignment) {
            return response()->json([
                'error' => 'Asset is not currently assigned'
            ], 422);
        }

        $asset->update([
            'assigned_to' => null,
            'data' => array_merge($asset->data ?? [], [
                'unassigned_at' => now(),
                'unassigned_by' => auth()->id(),
                'unassignment_notes' => $validated['notes'] ?? null,
            ])
        ]);

        return response()->json([
            'message' => 'Asset unassigned successfully',
            'data' => new AssetResource($asset)
        ]);
    }

    /**
     * Get asset assignment history
     */
    public function history(string $id): JsonResponse
    {
        $asset = Asset::with(['auditLogs.user'])->findOrFail($id);

        $history = $asset->auditLogs()
            ->whereIn('action', ['assigned', 'unassigned', 'updated'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $history
        ]);
    }
}
