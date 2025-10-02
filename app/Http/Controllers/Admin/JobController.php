<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobForm;
use App\Models\User;
use App\Models\Location;
use App\Models\Tenant;
use App\Models\Worker;
use App\Models\JobAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    /**
     * Display a listing of jobs.
     */
    public function index(Request $request): Response
    {
                $query = Job::with(['location', 'assignments.worker', 'tenant'])
            ->when($request->search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->location_id, function ($query, $locationId) {
                return $query->where('location_id', $locationId);
            })
            ->orderBy('created_at', 'desc');

        $jobs = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/jobs/index', [
            'jobs' => $jobs,
            'locations' => Location::all(['id', 'name']),
            'filters' => $request->only(['search', 'status', 'location_id']),
            'statuses' => [
                'pending' => 'Oczekuje',
                'in_progress' => 'W trakcie',
                'completed' => 'Ukończone',
                'cancelled' => 'Anulowane',
            ],
        ]);
    }

    /**
     * Show the form for creating a new job.
     */
    public function create(): Response
    {
        return Inertia::render('admin/jobs/create', [
            'locations' => Location::all(['id', 'name', 'address']),
            'workers' => Worker::with(['skills', 'certifications'])->get(['id', 'first_name', 'last_name', 'email', 'tenant_id']),
            'forms' => \App\Models\Form::all(['id', 'name', 'type', 'tenant_id']),
            'tenants' => Tenant::all(['id', 'name', 'sector']),
        ]);
    }

    /**
     * Store a newly created job in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'required|exists:locations,id',
            'assigned_worker_ids' => 'nullable|array',
            'assigned_worker_ids.*' => 'exists:workers,id',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'data' => 'nullable|array',
            'required_forms' => 'nullable|array',
            'required_forms.*' => 'exists:forms,id',
        ]);

        // Remove assigned_worker_ids from validated data before creating job
        $assignedWorkerIds = $validated['assigned_worker_ids'] ?? [];
        unset($validated['assigned_worker_ids']);

        $job = Job::create($validated);

        // Create job assignments for selected workers
        if (!empty($assignedWorkerIds)) {
            // Use worker IDs directly since they're coming from the worker table
            foreach ($assignedWorkerIds as $workerId) {
                JobAssignment::create([
                    'job_id' => $job->id,
                    'worker_id' => $workerId,
                    'status' => 'assigned',
                    'assigned_at' => now(),
                ]);
            }
        }

        if (!empty($validated['required_forms'])) {
            foreach ($validated['required_forms'] as $index => $formId) {
                JobForm::create([
                    'job_id' => $job->id,
                    'form_id' => $formId,
                    'order' => $index + 1,
                    'is_required' => true,
                ]);
            }
        }

        return redirect()->route('admin.jobs.show', $job)
            ->with('success', 'Zadanie zostało utworzone pomyślnie.');
    }

    /**
     * Display the specified job.
     */
    public function show(Job $job): Response
    {
        $job->load([
            'location',
            'assignments.worker.skills',
            'assignments.worker.certifications',
            'assignments.worker',
            'tenant',
            'formResponses.form',
            'workers',
            'forms.responses.worker', // Load form responses if needed
        ]);

        return Inertia::render('admin/jobs/show', [
            'job' => $job,
            'workers' => $job->workers,
            'forms' => $job->forms,
        ]);
    }

    /**
     * Show the form for editing the specified job.
     */
    public function edit(Job $job): Response
    {
        $job->load(['location', 'assignments.worker', 'workers', 'tenant', 'forms']);

        return Inertia::render('admin/jobs/edit', [
            'job' => $job,
            'locations' => Location::all(['id', 'name', 'address']),
            'workers' => Worker::with(['skills', 'certifications'])->get(['id', 'first_name', 'last_name', 'email', 'tenant_id']),
            'forms' => \App\Models\Form::all(['id', 'name', 'type', 'tenant_id']),
            'tenants' => Tenant::all(['id', 'name', 'sector']),
        ]);
    }

    /**
     * Update the specified job in storage.
     */
    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'required|exists:locations,id',
            'assigned_worker_ids' => 'nullable|array',
            'assigned_worker_ids.*' => 'exists:workers,id',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'data' => 'nullable|array',
            'required_forms' => 'nullable|array',
            'required_forms.*' => 'exists:forms,id',
        ]);

        // Remove arrays from basic update data
        $jobData = collect($validated)->except(['assigned_worker_ids', 'required_forms'])->toArray();
        $job->update($jobData);

        // Sync assigned workers
        if (isset($validated['assigned_worker_ids'])) {
            $newWorkerIds = array_map('strval', $validated['assigned_worker_ids']);
            
            // Get current assigned worker IDs
            $currentWorkerIds = $job->assignments()
                ->whereNull('deleted_at')
                ->pluck('worker_id')
                ->map(fn($id) => (string) $id)
                ->toArray();
            
            // Find workers to add (in new but not in current)
            $workersToAdd = array_diff($newWorkerIds, $currentWorkerIds);
            
            // Find workers to remove (in current but not in new)
            $workersToRemove = array_diff($currentWorkerIds, $newWorkerIds);
            
            // Remove assignments for workers no longer selected
            if (!empty($workersToRemove)) {
                $job->assignments()
                    ->whereIn('worker_id', $workersToRemove)
                    ->delete();
            }
            
            // Add new assignments
            foreach ($workersToAdd as $workerId) {
                $job->assignments()->create([
                    'worker_id' => $workerId,
                    'role' => 'worker',
                    'status' => 'assigned',
                    'assigned_at' => now(),
                ]);
            }
        } else {
            // If no workers assigned, remove all assignments
            $job->assignments()->delete();
        }

        // Sync required forms
        if (isset($validated['required_forms'])) {
            // Sync forms with the job using the many-to-many relationship
            $job->forms()->sync($validated['required_forms']);
        } else {
            // If no forms required, detach all forms
            $job->forms()->detach();
        }

        return redirect()->route('admin.jobs.show', $job)
            ->with('success', 'Zadanie zostało zaktualizowane pomyślnie.');
    }

    /**
     * Remove the specified job from storage.
     */
    public function destroy(Job $job)
    {
        $job->delete();

        return redirect()->route('admin.jobs.index')
            ->with('success', 'Zadanie zostało usunięte pomyślnie.');
    }

    /**
     * Display kanban board view
     */
    public function kanban(): Response
    {
        $jobs = Job::with(['location', 'assignments.worker.user'])
            ->get()
            ->groupBy('status');

        return Inertia::render('admin/jobs/kanban', [
            'jobsByStatus' => $jobs,
            'statuses' => [
                'pending' => 'Oczekuje',
                'in_progress' => 'W trakcie',
                'completed' => 'Ukończone',
                'cancelled' => 'Anulowane',
            ],
        ]);
    }

    /**
     * Display calendar view
     */
    public function calendar(Request $request): Response
    {
        $startDate = $request->get('start', now()->startOfMonth());
        $endDate = $request->get('end', now()->endOfMonth());

        $jobs = Job::with(['location', 'assignments.worker.user'])
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->get();

        return Inertia::render('admin/jobs/calendar', [
            'jobs' => $jobs,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Assign a worker to a job
     */
    public function assignWorker(Request $request, Job $job)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|max:255',
        ]);

        // Find worker by user_id
        $worker = \App\Models\Worker::where('user_id', $validated['user_id'])->first();
        
        if (!$worker) {
            return back()->withErrors(['user_id' => 'Worker profile not found for this user.']);
        }

        // Check if worker is already assigned
        $existingAssignment = $job->assignments()
            ->where('worker_id', $worker->id)
            ->first();

        if ($existingAssignment) {
            return back()->withErrors(['user_id' => 'Worker is already assigned to this job.']);
        }

        $job->assignments()->create([
            'worker_id' => $worker->id,
            'role' => $validated['role'],
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        return back()->with('success', 'Worker assigned successfully.');
    }

    /**
     * Remove a worker from a job
     */
    public function unassignWorker(Job $job, $assignmentId)
    {
        $assignment = $job->assignments()->findOrFail($assignmentId);
        $assignment->delete();

        return back()->with('success', 'Worker removed from job successfully.');
    }
}