<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobAssignmentRequest;
use App\Http\Resources\JobAssignmentResource;
use App\Models\JobAssignment;
use App\Models\Job;
use App\Models\Worker;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobAssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $assignments = JobAssignment::query()
            ->with(['worker.user', 'job.location'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('worker.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('job', function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            })
            ->when($request->job_id, function ($query, $jobId) {
                $query->where('job_id', $jobId);
            })
            ->when($request->worker_id, function ($query, $workerId) {
                $query->where('worker_id', $workerId);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->assigned_from, function ($query, $date) {
                $query->where('assigned_at', '>=', $date);
            })
            ->when($request->assigned_to, function ($query, $date) {
                $query->where('assigned_at', '<=', $date);
            })
            ->orderBy($request->get('sort', 'assigned_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => JobAssignmentResource::collection($assignments->items()),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(JobAssignmentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Check if worker is already assigned to this job
        $existingAssignment = JobAssignment::where('job_id', $validated['job_id'])
            ->where('worker_id', $validated['worker_id'])
            ->first();

        if ($existingAssignment) {
            return response()->json([
                'error' => 'Worker is already assigned to this job'
            ], 422);
        }

        // Check if worker is available (not assigned to other active jobs)
        $worker = Worker::findOrFail($validated['worker_id']);
        if ($worker->status !== 'active') {
            return response()->json([
                'error' => 'Worker is not active'
            ], 422);
        }

        $activeAssignments = JobAssignment::where('worker_id', $validated['worker_id'])
            ->where('status', 'in_progress')
            ->count();

        if ($activeAssignments >= 5) { // Max 5 concurrent assignments
            return response()->json([
                'error' => 'Worker has too many active assignments'
            ], 422);
        }

        $validated['assigned_at'] = $validated['assigned_at'] ?? now();

        $assignment = JobAssignment::create($validated);
        $assignment->load(['worker.user', 'job.location']);

        return response()->json([
            'message' => 'Job assignment created successfully',
            'data' => new JobAssignmentResource($assignment)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $assignment = JobAssignment::with([
            'worker.user.roles',
            'worker.skills',
            'worker.certifications',
            'job.location',
            'job.formResponses'
        ])->findOrFail($id);

        return response()->json([
            'data' => new JobAssignmentResource($assignment)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(JobAssignmentRequest $request, string $id): JsonResponse
    {
        $assignment = JobAssignment::findOrFail($id);

        $validated = $request->validated();

        // Handle status transitions
        if (isset($validated['status'])) {
            $currentStatus = $assignment->status;
            $newStatus = $validated['status'];

            // Validate status transitions
            $validTransitions = [
                'assigned' => ['in_progress', 'cancelled'],
                'in_progress' => ['completed', 'cancelled'],
                'completed' => [], // Final state
                'cancelled' => ['assigned'], // Can be reassigned
            ];

            if (!in_array($newStatus, $validTransitions[$currentStatus])) {
                return response()->json([
                    'error' => "Cannot change status from {$currentStatus} to {$newStatus}"
                ], 422);
            }

            // Auto-set completed_at if status is completed
            if ($newStatus === 'completed' && !$assignment->completed_at) {
                $validated['completed_at'] = now();
            }
        }

        $assignment->update($validated);
        $assignment->load(['worker.user', 'job.location']);

        return response()->json([
            'message' => 'Job assignment updated successfully',
            'data' => new JobAssignmentResource($assignment)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $assignment = JobAssignment::findOrFail($id);
        
        // Check if assignment can be deleted
        if (in_array($assignment->status, ['completed'])) {
            return response()->json([
                'error' => 'Cannot delete completed assignment'
            ], 422);
        }

        $assignment->delete();

        return response()->json([
            'message' => 'Job assignment deleted successfully'
        ]);
    }

    /**
     * Start assignment (change status to in_progress)
     */
    public function start(string $id): JsonResponse
    {
        $assignment = JobAssignment::findOrFail($id);

        if ($assignment->status !== 'assigned') {
            return response()->json([
                'error' => 'Assignment must be in assigned status to start'
            ], 422);
        }

        $assignment->update([
            'status' => 'in_progress',
            'data' => array_merge($assignment->data ?? [], [
                'started_at' => now(),
                'started_by' => auth()->id(),
            ])
        ]);

        return response()->json([
            'message' => 'Assignment started successfully',
            'data' => new JobAssignmentResource($assignment)
        ]);
    }

    /**
     * Complete assignment
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $assignment = JobAssignment::findOrFail($id);

        if ($assignment->status !== 'in_progress') {
            return response()->json([
                'error' => 'Assignment must be in progress to complete'
            ], 422);
        }

        $validated = $request->validate([
            'completion_notes' => 'nullable|string|max:1000',
            'completion_data' => 'nullable|array',
        ]);

        $assignment->update([
            'status' => 'completed',
            'completed_at' => now(),
            'notes' => $validated['completion_notes'] ?? $assignment->notes,
            'data' => array_merge($assignment->data ?? [], [
                'completed_at' => now(),
                'completed_by' => auth()->id(),
                'completion_data' => $validated['completion_data'] ?? null,
            ])
        ]);

        // Check if all assignments for the job are completed
        $job = $assignment->job;
        $remainingAssignments = $job->assignments()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        if ($remainingAssignments === 0) {
            $job->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return response()->json([
            'message' => 'Assignment completed successfully',
            'data' => new JobAssignmentResource($assignment)
        ]);
    }

    /**
     * Cancel assignment
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $assignment = JobAssignment::findOrFail($id);

        if (in_array($assignment->status, ['completed', 'cancelled'])) {
            return response()->json([
                'error' => 'Cannot cancel completed or already cancelled assignment'
            ], 422);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $assignment->update([
            'status' => 'cancelled',
            'data' => array_merge($assignment->data ?? [], [
                'cancelled_at' => now(),
                'cancelled_by' => auth()->id(),
                'cancellation_reason' => $validated['cancellation_reason'],
            ])
        ]);

        return response()->json([
            'message' => 'Assignment cancelled successfully',
            'data' => new JobAssignmentResource($assignment)
        ]);
    }

    /**
     * Get assignments by worker
     */
    public function byWorker(string $workerId, Request $request): JsonResponse
    {
        $assignments = JobAssignment::query()
            ->with(['job.location'])
            ->where('worker_id', $workerId)
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->where('assigned_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->where('assigned_at', '<=', $date);
            })
            ->orderBy('assigned_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => JobAssignmentResource::collection($assignments->items()),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ]
        ]);
    }

    /**
     * Get assignments by job
     */
    public function byJob(string $jobId, Request $request): JsonResponse
    {
        $assignments = JobAssignment::query()
            ->with(['worker.user'])
            ->where('job_id', $jobId)
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('assigned_at', 'desc')
            ->get();

        return response()->json([
            'data' => JobAssignmentResource::collection($assignments)
        ]);
    }

    /**
     * Get assignment statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $workerId = $request->get('worker_id');
        $jobId = $request->get('job_id');
        $period = $request->get('period', 30); // days

        $query = JobAssignment::query()
            ->when($workerId, fn($q) => $q->where('worker_id', $workerId))
            ->when($jobId, fn($q) => $q->where('job_id', $jobId))
            ->where('assigned_at', '>=', now()->subDays($period));

        $stats = [
            'total' => $query->count(),
            'by_status' => $query->select('status')
                ->selectRaw('count(*) as count')
                ->groupBy('status')
                ->get()
                ->keyBy('status')
                ->map(fn($item) => $item->count),
            'completion_rate' => $this->calculateCompletionRate($query),
            'average_completion_time' => $this->calculateAverageCompletionTime($query),
        ];

        return response()->json(['data' => $stats]);
    }

    /**
     * Calculate completion rate
     */
    private function calculateCompletionRate($query): float
    {
        $total = $query->count();
        if ($total === 0) return 0;

        $completed = $query->where('status', 'completed')->count();
        return round(($completed / $total) * 100, 2);
    }

    /**
     * Calculate average completion time
     */
    private function calculateAverageCompletionTime($query): ?float
    {
        $completedAssignments = $query->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereNotNull('assigned_at')
            ->get();

        if ($completedAssignments->count() === 0) return null;

        $totalHours = $completedAssignments->sum(function ($assignment) {
            if (!$assignment->completed_at || !$assignment->assigned_at) {
                return 0;
            }
            return $assignment->completed_at->diffInHours($assignment->assigned_at);
        });

        return round($totalHours / $completedAssignments->count(), 2);
    }
}
