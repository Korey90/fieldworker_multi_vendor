<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SectorResource;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class SectorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $sectors = Sector::query()
            ->with(['locations', 'tenants'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->get();

        return response()->json([
            'data' => SectorResource::collection($sectors)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:sectors,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $sector = Sector::create($validated);
        $sector->load(['locations', 'tenants']);

        return response()->json([
            'data' => new SectorResource($sector)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sector $sector): JsonResponse
    {
        $sector->load(['locations', 'tenants']);

        return response()->json([
            'data' => new SectorResource($sector)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sector $sector): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', Rule::unique('sectors')->ignore($sector->id)],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $sector->update($validated);
        $sector->load(['locations', 'tenants']);

        return response()->json([
            'data' => new SectorResource($sector)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sector $sector): JsonResponse
    {
        // Check if sector has any associated locations or tenants
        if ($sector->locations()->count() > 0 || $sector->tenants()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete sector with associated locations or tenants',
                'error' => 'SECTOR_HAS_ASSOCIATIONS'
            ], 422);
        }

        $sector->delete();

        return response()->json([
            'message' => 'Sector deleted successfully'
        ]);
    }
}
