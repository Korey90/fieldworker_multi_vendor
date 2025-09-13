<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
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
                $query = Job::with(['location', 'assignments.worker.user', 'tenant'])
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

        return Inertia::render('jobs/index', [
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
        return Inertia::render('jobs/create', [
            'locations' => Location::all(['id', 'name', 'address']),
            'users' => User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['worker', 'manager']);
            })->whereHas('worker')->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store a newly created job in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'required|exists:locations,id',
            'assigned_user_ids' => 'nullable|array',
            'assigned_user_ids.*' => 'exists:users,id',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'data' => 'nullable|array',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        
        // Remove assigned_user_ids from validated data before creating job
        $assignedUserIds = $validated['assigned_user_ids'] ?? [];
        unset($validated['assigned_user_ids']);

        $job = Job::create($validated);

        // Create job assignments for selected workers
        if (!empty($assignedUserIds)) {
            // Find all workers by user_ids in one query
            $workers = Worker::whereIn('user_id', $assignedUserIds)->get();
            
            $assignments = [];
            foreach ($workers as $worker) {
                $assignments[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'job_id' => $job->id,
                    'worker_id' => $worker->id,
                    'status' => 'assigned',
                    'assigned_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($assignments)) {
                JobAssignment::insert($assignments);
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
            'assignments.worker.user',
            'tenant',
            'formResponses.form'
        ]);

        return Inertia::render('jobs/show', [
            'job' => $job,
            'availableWorkers' => User::whereHas('roles', function ($query) {
                $query->where('name', 'worker');
            })->with(['worker.skills', 'worker.certifications'])->get(),
        ]);
    }

    /**
     * Show the form for editing the specified job.
     */
    public function edit(Job $job): Response
    {
        $job->load(['location', 'assignments.user']);

        return Inertia::render('jobs/edit', [
            'job' => $job,
            'locations' => Location::all(['id', 'name', 'address']),
            'users' => User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['worker', 'manager']);
            })->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified job in storage.
     */
    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'required|exists:locations,id',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'scheduled_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'data' => 'nullable|array',
        ]);

        $job->update($validated);

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

        return Inertia::render('jobs/kanban', [
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

        return Inertia::render('jobs/calendar', [
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