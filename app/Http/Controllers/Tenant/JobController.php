<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Location;
use App\Models\Sector;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class JobController extends Controller
{
    protected $tenantId;

    public function __construct()
    {
        // Apply middleware to ensure only authenticated users with tenant access
        $this->middleware(['auth', 'role:tenant,admin']);

        // The tenant middleware is already applied in routes/tenant.php
        // Just set up the tenant ID accessor
        $this->middleware(function ($request, $next) {
            $this->tenantId = Auth::user()->tenant_id;
            return $next($request);
        });
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Check if user can view jobs
        if (Auth::user()->cannot('viewAny', Job::class)) {
            abort(403, 'Unauthorized to view jobs.');
        }

        // Get jobs for current tenant only
        $jobs = Job::where('tenant_id', $this->tenantId)
            ->with(['location', 'location.sector', 'assignments.worker.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('tenant/jobs/index', [
            'jobs' => $jobs,
            'can' => [
                'create' => Auth::user()->can('create', Job::class),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (Auth::user()->cannot('create', Job::class)) {
            abort(403, 'Unauthorized to create jobs.');
        }

        // Get available resources for the tenant
        $locations = Location::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'address')
            ->get();
            

        return Inertia::render('tenant/jobs/create', [
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (Auth::user()->cannot('create', Job::class)) {
            abort(403, 'Unauthorized to create jobs.');
        }

        // Check if user can create jobs
        //$this->authorize('create', Job::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'nullable|exists:locations,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_start' => 'required|date|after:now',
            'estimated_hours' => 'required|numeric|min:0.5|max:24',
            'required_skills' => 'array',
            'required_skills.*' => 'string',
            'safety_requirements' => 'nullable|string',
        ]);

        // Ensure location and sector belong to tenant
        if (isset($validated['location_id'])) {
            $location = Location::where('id', $validated['location_id'])
                ->where('tenant_id', $this->tenantId)
                ->firstOrFail();
        }

        if (isset($validated['sector_id'])) {
            $sector = Sector::where('id', $validated['sector_id'])
                ->where('tenant_id', $this->tenantId)
                ->firstOrFail();
        }

        $job = Job::create([
            ...$validated,
            'tenant_id' => $this->tenantId,
            'created_by' => Auth::id(),
            'status' => 'pending',
        ]);

        return redirect()->route('tenant.jobs.show', $job)
            ->with('success', 'Job created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Job $job)
    {
        if (Auth::user()->cannot('view', $job)) {
            abort(403, 'Unauthorized to view job.');
        }

        // Ensure job belongs to tenant (extra security)
        if ($job->tenant_id !== $this->tenantId) {
            abort(403, 'Unauthorized access to job.');
        }

        $job->load([
            'location',
            'location.sector', 
            'assignments.worker.user',
            'formResponses.form',
            //'attachments'
        ]);

        return Inertia::render('tenant/jobs/show', [
            'job' => $job,
            'can' => [
                'update' => Auth::user()->can('update', $job),
                'delete' => Auth::user()->can('delete', $job),
                'assignWorkers' => Auth::user()->can('assignWorkers', $job),
                'updateStatus' => Auth::user()->can('updateStatus', $job),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Job $job)
    {
        if (Auth::user()->cannot('update', $job)) {
            abort(403, 'Unauthorized to update jobs.');
        }


        // Ensure job belongs to tenant
        if ($job->tenant_id !== $this->tenantId) {
            abort(403, 'Unauthorized access to job.');
        }

        $locations = Location::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'address')
            ->get();
            
            
        $sectors = Sector::select('id', 'name', 'description')
            ->get();

        // Load relationships
        $job->load(['location', 'location.sector']);

        $skills = \App\Models\Skill::whereHas('workers', function ($q) {
            $q->where('tenant_id', $this->tenantId);
        })
        ->pluck('name', 'id'); // albo 'id' jeśli chcesz ID

        return Inertia::render('tenant/jobs/edit', [
            'job' => $job,
            'locations' => $locations,
            'sectors' => $sectors,
            'skills' => $skills,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Job $job) :RedirectResponse
    {
        // Check if user can update this job
        if ($request->user()->cannot('update', $job)) {
            abort(403, 'Unauthorized to update jobs.');
        }

        // Ensure job belongs to tenant
        if ($job->tenant_id !== $this->tenantId) {
            abort(403, 'Unauthorized access to job.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'required|exists:locations,id',
            'sector_id' => 'nullable|exists:sectors,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_start' => 'required|date',
            'estimated_hours' => 'required|numeric|min:0.5|max:24',
            'required_skills' => 'array',
            'required_skills.*' => 'string',
            'safety_requirements' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
        ]);

        // Verify location and sector belong to tenant
        if (isset($validated['location_id'])) {
            Location::where('id', $validated['location_id'])
                ->where('tenant_id', $this->tenantId)
                ->firstOrFail();
        }
        
        if (isset($validated['sector_id'])) {
            Sector::where('id', $validated['sector_id'])
                ->where('tenant_id', $this->tenantId)
                ->firstOrFail();
        }

        $job->update($validated);

        return redirect()->route('tenant.jobs.show', $job)
            ->with('success', 'Job updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Job $job)
    {
        // Check if user can delete Jobs
        if (Auth::user()->cannot('delete', Job::class)) {
            abort(403, 'Unauthorized to delete jobs.');
        }

        // Ensure job belongs to tenant
        if ($job->tenant_id !== $this->tenantId) {
            abort(403, 'Unauthorized access to job.');
        }

        $job->delete();

        return redirect()->route('tenant.jobs.index')
            ->with('success', 'Job deleted successfully.');
    }

    /**
     * Assign workers to the job.
     */
    public function assignWorkers(Request $request, Job $job)
    {
        // Check if user can assign workers to this job
        if (Auth::user()->cannot('assignWorkers', Job::class)) {
            abort(403, 'Unauthorized to assign workers to jobs.');
        }


        // Ensure job belongs to tenant
        if ($job->tenant_id !== $this->tenantId) {
            abort(403, 'Unauthorized access to job.');
        }

        $validated = $request->validate([
            'worker_ids' => 'required|array',
            'worker_ids.*' => 'exists:workers,id',
        ]);

        // Verify workers belong to tenant
        $workers = Worker::whereIn('id', $validated['worker_ids'])
            ->where('tenant_id', $this->tenantId)
            ->get();

        if ($workers->count() !== count($validated['worker_ids'])) {
            throw ValidationException::withMessages([
                'worker_ids' => ['Some workers do not belong to your organization.']
            ]);
        }

        // Create job assignments
        foreach ($workers as $worker) {
            $job->assignments()->updateOrCreate(
                ['worker_id' => $worker->id],
                ['status' => 'assigned']
            );
        }

        return redirect()->route('tenant.jobs.show', $job)
            ->with('success', 'Workers assigned successfully.');
    }

    /**
     * Update job status.
     */
    public function updateStatus(Request $request, Job $job)
    {
        // Check if user can update status of this job
        if (Auth::user()->cannot('updateStatus', Job::class)) {
            abort(403, 'Unauthorized to update job status.');
        }
        

        // Ensure job belongs to tenant
        if ($job->tenant_id !== $this->tenantId) {
            abort(403, 'Unauthorized access to job.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $job->update([
            'status' => $validated['status'],
            'status_notes' => $validated['notes'] ?? null,
            'status_updated_by' => Auth::id(),
            'status_updated_at' => now(),
        ]);

        return redirect()->route('tenant.jobs.show', $job)
            ->with('success', 'Job status updated successfully.');
    }
}
