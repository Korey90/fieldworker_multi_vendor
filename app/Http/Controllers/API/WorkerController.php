<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkerResource;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WorkerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $workers = Worker::query()
            ->with(['user', 'tenant', 'skills', 'certifications'])
            ->when($request->search, function ($query, $search) {
                $query->where('employee_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                      });
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenant_id', $tenantId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->skill_id, function ($query, $skillId) {
                $query->whereHas('skills', function ($q) use ($skillId) {
                    $q->where('skills.id', $skillId);
                });
            })
            ->orderBy($request->get('sort', 'employee_number'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => WorkerResource::collection($workers->items()),
            'meta' => [
                'current_page' => $workers->currentPage(),
                'last_page' => $workers->lastPage(),
                'per_page' => $workers->perPage(),
                'total' => $workers->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:workers,user_id',
            'tenant_id' => 'required|exists:tenants,id',
            'employee_number' => 'required|string|max:50|unique:workers,employee_number',
            'hire_date' => 'required|date',
            'job_title' => 'required|string|max:255',
            'status' => 'required|in:active,inactive,terminated',
            'emergency_contact' => 'nullable|array',
            'data' => 'nullable|array',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'exists:skills,id',
            'certification_ids' => 'nullable|array',
            'certification_ids.*' => 'exists:certifications,id',
        ]);

        // Prepare data array with job_title
        $data = $validated['data'] ?? [];
        $data['job_title'] = $validated['job_title'];
        
        // Remove job_title from validated as it will be stored in data
        unset($validated['job_title']);
        $validated['data'] = $data;

        $worker = Worker::create($validated);
        
        if (isset($validated['skill_ids'])) {
            $worker->skills()->sync($validated['skill_ids']);
        }
        
        if (isset($validated['certification_ids'])) {
            $worker->certifications()->sync($validated['certification_ids']);
        }

        $worker->load(['user', 'tenant', 'skills', 'certifications']);

        return response()->json([
            'message' => 'Worker created successfully',
            'data' => new WorkerResource($worker)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $worker = Worker::with([
            'user.roles', 
            'tenant', 
            'skills', 
            'certifications'
        ])->findOrFail($id);

        return response()->json([
            'data' => new WorkerResource($worker)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $worker = Worker::findOrFail($id);

        $validated = $request->validate([
            'employee_number' => 'sometimes|required|string|max:50|unique:workers,employee_number,' . $worker->id,
            'hire_date' => 'sometimes|required|date',
            'job_title' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|in:active,inactive,terminated',
            'emergency_contact' => 'nullable|array',
            'data' => 'nullable|array',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'exists:skills,id',
            'certification_ids' => 'nullable|array',
            'certification_ids.*' => 'exists:certifications,id',
        ]);

        $worker->update($validated);
        
        if (isset($validated['skill_ids'])) {
            $worker->skills()->sync($validated['skill_ids']);
        }
        
        if (isset($validated['certification_ids'])) {
            $worker->certifications()->sync($validated['certification_ids']);
        }

        $worker->load(['user', 'tenant', 'skills', 'certifications']);

        return response()->json([
            'message' => 'Worker updated successfully',
            'data' => new WorkerResource($worker)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $worker = Worker::findOrFail($id);
        
        // Check if worker has active job assignments
        if ($worker->jobAssignments()->where('status', 'active')->count() > 0) {
            return response()->json([
                'error' => 'Cannot delete worker with active job assignments'
            ], 422);
        }

        $worker->delete();

        return response()->json([
            'message' => 'Worker deleted successfully'
        ]);
    }

    /**
     * Get worker statistics
     */
    public function stats(string $id): JsonResponse
    {
        $worker = Worker::with(['jobAssignments.job'])->findOrFail($id);

        $jobs = $worker->jobAssignments->pluck('job');
        
        $stats = [
            'total_jobs' => $jobs->count(),
            'completed_jobs' => $jobs->where('status', 'completed')->count(),
            'active_jobs' => $jobs->where('status', 'active')->count(),
            'pending_jobs' => $jobs->where('status', 'pending')->count(),
            'skills_count' => $worker->skills()->count(),
            'certifications_count' => $worker->certifications()->count(),
            'years_of_service' => now()->diffInYears($worker->hire_date),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Get available workers for assignment
     */
    public function available(Request $request): JsonResponse
    {
        $workers = Worker::query()
            ->with(['user', 'skills'])
            ->where('status', 'active')
            ->when($request->skill_ids, function ($query, $skillIds) {
                $query->whereHas('skills', function ($q) use ($skillIds) {
                    $q->whereIn('skills.id', $skillIds);
                }, '>=', count($skillIds));
            })
            ->whereDoesntHave('jobAssignments', function ($query) {
                $query->where('status', 'active');
            })
            ->get();

        return response()->json([
            'data' => WorkerResource::collection($workers)
        ]);
    }
}
