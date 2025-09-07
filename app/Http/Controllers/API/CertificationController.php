<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificationResource;
use App\Models\Certification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class CertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $certifications = Certification::query()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->with(['workers'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('authority', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->authority, function ($query, $authority) {
                $query->where('authority', 'like', "%{$authority}%");
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => CertificationResource::collection($certifications),
            'meta' => [
                'current_page' => $certifications->currentPage(),
                'last_page' => $certifications->lastPage(),
                'per_page' => $certifications->perPage(),
                'total' => $certifications->total(),
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
            'authority' => 'nullable|string|max:255',
            'validity_period_months' => 'nullable|integer|min:1|max:120',
            'is_active' => 'sometimes|boolean',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $certification = Certification::create($validated);
        $certification->load(['workers']);

        return response()->json([
            'message' => 'Certification created successfully',
            'data' => new CertificationResource($certification)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Certification $certification): JsonResponse
    {
        // Check if certification belongs to user's tenant
        if ($certification->tenant_id !== auth()->user()->tenant_id) {
            return response()->json(['error' => 'Certification not found'], 404);
        }

        $certification->load(['workers']);
        return response()->json([
            'data' => new CertificationResource($certification)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Certification $certification): JsonResponse
    {
        // Check if certification belongs to user's tenant
        if ($certification->tenant_id !== auth()->user()->tenant_id) {
            return response()->json(['error' => 'Certification not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'authority' => 'nullable|string|max:255',
            'validity_period_months' => 'nullable|integer|min:1|max:120',
            'is_active' => 'sometimes|boolean',
        ]);

        $certification->update($validated);
        $certification->load(['workers']);

        return response()->json([
            'message' => 'Certification updated successfully',
            'data' => new CertificationResource($certification)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Certification $certification): JsonResponse
    {
        // Check if certification belongs to user's tenant
        if ($certification->tenant_id !== auth()->user()->tenant_id) {
            return response()->json(['error' => 'Certification not found'], 404);
        }

        // Check if certification is assigned to any workers
        if ($certification->workers()->exists()) {
            return response()->json([
                'error' => 'Cannot delete certification that is assigned to workers',
                'workers_count' => $certification->workers()->count()
            ], 422);
        }

        $certification->delete();

        return response()->json([
            'message' => 'Certification deleted successfully'
        ]);
    }

    /**
     * Get workers for a specific certification
     */
    public function workers(Certification $certification): JsonResponse
    {
        // Check if certification belongs to user's tenant
        if ($certification->tenant_id !== auth()->user()->tenant_id) {
            return response()->json(['error' => 'Certification not found'], 404);
        }

        $workers = $certification->workers()
            ->with(['user'])
            ->get();

        return response()->json([
            'certification' => new CertificationResource($certification),
            'workers' => $workers->map(function ($worker) {
                return [
                    'id' => $worker->id,
                    'name' => $worker->user ? $worker->user->name : 'Unknown',
                    'email' => $worker->user ? $worker->user->email : 'No email',
                    'issued_at' => $worker->pivot->issued_at,
                    'expires_at' => $worker->pivot->expires_at,
                    'is_expired' => $worker->pivot->expires_at && $worker->pivot->expires_at < now(),
                ];
            })
        ]);
    }

    /**
     * Get certification statistics
     */
    public function statistics(): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;

        $stats = [
            'total_certifications' => Certification::where('tenant_id', $tenantId)->count(),
            'active_certifications' => Certification::where('tenant_id', $tenantId)->where('is_active', true)->count(),
            'inactive_certifications' => Certification::where('tenant_id', $tenantId)->where('is_active', false)->count(),
            'permanent_certifications' => Certification::where('tenant_id', $tenantId)->whereNull('validity_period_months')->count(),
            'renewable_certifications' => Certification::where('tenant_id', $tenantId)->whereNotNull('validity_period_months')->count(),
            'authorities_breakdown' => Certification::where('tenant_id', $tenantId)
                ->whereNotNull('authority')
                ->groupBy('authority')
                ->selectRaw('authority, count(*) as count')
                ->pluck('count', 'authority'),
            'validity_breakdown' => Certification::where('tenant_id', $tenantId)
                ->whereNotNull('validity_period_months')
                ->groupBy('validity_period_months')
                ->selectRaw('validity_period_months, count(*) as count')
                ->pluck('count', 'validity_period_months'),
        ];

        return response()->json($stats);
    }
}
