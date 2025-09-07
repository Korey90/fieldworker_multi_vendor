<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use App\Models\Job;
use App\Models\JobAssignment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $jobs = Job::query()
            ->with(['tenant', 'location', 'assignments.worker.user'])
            ->when($user->hasRole('worker'), function ($query) use ($user) {
                // Workers can only see jobs assigned to them
                $query->whereHas('assignments', function ($q) use ($user) {
                    $q->where('worker_id', $user->worker->id ?? null);
                });
            })
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenant_id', $tenantId);
            })
            ->when($request->location_id, function ($query, $locationId) {
                $query->where('location_id', $locationId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->scheduled_from, function ($query, $date) {
                $query->where('scheduled_at', '>=', $date);
            })
            ->when($request->scheduled_to, function ($query, $date) {
                $query->where('scheduled_at', '<=', $date);
            })
            ->orderBy($request->get('sort', 'scheduled_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => JobResource::collection($jobs->items()),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tenant_id' => 'required|exists:tenants,id',
            'location_id' => 'required|exists:locations,id',
            'scheduled_at' => 'required|date|after:now',
            'status' => 'required|in:pending,active,completed,cancelled',
            'data' => 'nullable|array',
        ]);

        $job = Job::create($validated);
        $job->load(['tenant', 'location']);

        return response()->json([
            'message' => 'Job created successfully',
            'data' => new JobResource($job)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $user = auth()->user();
        $job = Job::with([
            'tenant',
            'location',
            'assignments.worker.user'
        ])->findOrFail($id);

        // Workers can only view jobs assigned to them
        if ($user->hasRole('worker')) {
            $workerAssigned = $job->assignments()
                ->where('worker_id', $user->worker->id ?? null)
                ->exists();
            
            if (!$workerAssigned) {
                return response()->json([
                    'message' => 'Access denied. You can only view jobs assigned to you.'
                ], 403);
            }
        }

        return response()->json([
            'data' => new JobResource($job)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location_id' => 'sometimes|required|exists:locations,id',
            'scheduled_at' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:pending,active,completed,cancelled',
            'data' => 'nullable|array',
        ]);

        $job->update($validated);
        $job->load(['tenant', 'location', 'assignments']);

        return response()->json([
            'message' => 'Job updated successfully',
            'data' => new JobResource($job)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $job = Job::findOrFail($id);
        
        // Check if job can be deleted
        if (in_array($job->status, ['active', 'completed'])) {
            return response()->json([
                'error' => 'Cannot delete active or completed job'
            ], 422);
        }

        $job->delete();

        return response()->json([
            'message' => 'Job deleted successfully'
        ]);
    }

    /**
     * Assign workers to job
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);

        $validated = $request->validate([
            'worker_ids' => 'required|array',
            'worker_ids.*' => 'exists:workers,id',
            'notes' => 'nullable|string',
        ]);

        foreach ($validated['worker_ids'] as $workerId) {
            JobAssignment::updateOrCreate(
                ['job_id' => $job->id, 'worker_id' => $workerId],
                [
                    'status' => 'assigned',
                ]
            );
        }

        $job->load(['assignments.worker.user']);

        return response()->json([
            'message' => 'Workers assigned successfully',
            'data' => new JobResource($job)
        ]);
    }

    /**
     * Complete job
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);

        $validated = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);

        $job->update([
            'status' => 'completed',
            'completed_at' => now(),
            'data' => array_merge(is_array($job->data) ? $job->data : json_decode($job->data ?? '{}', true), [
                'completion_notes' => $validated['completion_notes'] ?? null,
                'completed_by' => auth()->id(),
            ])
        ]);

        // Update all assignments to completed
        $job->assignments()->update([
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Job completed successfully',
            'data' => new JobResource($job)
        ]);
    }

    /**
     * Cancel job
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $job = Job::findOrFail($id);

        $validated = $request->validate([
            'cancellation_reason' => 'required|string',
        ]);

        $currentData = is_array($job->data) ? $job->data : [];
        
        $job->update([
            'status' => 'cancelled',
            'data' => array_merge($currentData, [
                'cancellation_reason' => $validated['cancellation_reason'],
                'cancelled_by' => auth()->id(),
                'cancelled_at' => now(),
            ])
        ]);

        // Update all assignments to cancelled
        $job->assignments()->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Job cancelled successfully',
            'data' => new JobResource($job)
        ]);
    }
}
