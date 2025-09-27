<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Worker;
use App\Models\Job;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkerController extends Controller
{
    /**
     * Display a listing of workers.
     */
public function index(Request $request): Response
{
    $user = auth()->user();

    // Build query with filters
    $query = Worker::with([
        'skills:id,name,category',
        'certifications:id,name',
        'location:id,name,address',
        'tenant:id,name',
        'currentJob.location:id,name,address',
    ]);

    // Apply search filter
    if ($request->filled('search')) {
        $search = $request->get('search');
        $query->where(function ($q) use ($search) {
            $q->where('employee_number', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Tenant filter
    if ($request->filled('tenant')) {
        $query->where('tenant_id', $request->get('tenant'));
    }

    // Status filter
    if ($request->filled('status')) {
        $query->where('status', $request->get('status'));
    }

    // Location filter
    if ($request->filled('location')) {
        $query->where('location_id', $request->get('location'));
    }

    // Skills filter
    if ($request->filled('skills')) {
        $skills = is_array($request->get('skills')) ? $request->get('skills') : [$request->get('skills')];
        $query->whereHas('skills', fn($q) => $q->whereIn('skills.id', $skills));
    }

    // Get workers with pagination
    $workers = $query->orderBy('created_at', 'desc')
        ->paginate(20)
        ->through(function ($worker) {

            return [
                'id' => $worker->id,
                'first_name' => $worker->first_name,
                'last_name' => $worker->last_name,
                'email' => $worker->email,
                'phone' => $worker->phone,
                'tenant' => [
                    'id' => $worker->tenant->id,
                    'name' => $worker->tenant->name,
                ],
                'employee_number' => $worker->employee_number,
                'hire_date' => $worker->hire_date?->format('Y-m-d'),
                'hourly_rate' => $worker->hourly_rate,
                'status' => $worker->status,
                'location' => $worker->location ? [
                    'name' => $worker->location->name,
                    'address' => $worker->location->address,
                ] : null,
                'skills' => $worker->skills->map(fn($skill) => [
                    'id' => $skill->id,
                    'name' => $skill->name,
                    'level' => $skill->pivot->level ?? 1,
                ])->toArray(),
                'certifications' => $worker->certifications->map(function($cert) {
                    $expiry = $cert->pivot->expires_at
                        ? \Carbon\Carbon::parse($cert->pivot->expires_at)
                            ->setTimezone(config('app.timezone'))
                        : null;

                    return [
                        'id' => $cert->id,
                        'name' => $cert->name,
                        'expiry_date' => $expiry?->format('Y-m-d'),
                        'status' => $this->getCertificationStatus($expiry),
                    ];
                })->toArray(),
                'current_job' => $worker->currentJob ? [
                    'id' => $worker->currentJob->id,
                    'title' => $worker->currentJob->title,
                    'location' => $worker->currentJob->location?->name ?? 'Unknown',
                ] : null,
                'last_activity' => $worker->updated_at->diffForHumans(),
            ];
        });

    return Inertia::render('admin/workers/index', [
        'workers' => $workers,
        'filters' => $request->only(['search', 'tenant', 'status', 'location', 'skills']),
        'tenants' => \App\Models\Tenant::select('id', 'name')->orderBy('name')->get(),
        'locations' => \App\Models\Location::select('id', 'name', 'tenant_id')
            ->with('tenant:id,name')
            ->orderBy('name')
            ->get(),
        'skills' => \App\Models\Skill::where('is_active', true)->select('id', 'name', 'category')->get(),
        'stats' => [
            'total_workers' => Worker::count(),
            'active_workers' => Worker::where('status', 'active')->count(),
            'on_leave' => Worker::where('status', 'on_leave')->count(),
            'inactive_workers' => Worker::where('status', 'inactive')->count(),
        ],
    ]);
}


    /**
     * Show the form for creating a new worker.
     */
    public function create(): Response
    {
        // Get skills and tenants for the form - Admin can create workers for any tenant
        $skills = \App\Models\Skill::where('is_active', true)
            ->select('id', 'name', 'category')
            ->get();

        $tenants = \App\Models\Tenant::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/workers/create', [
            'skills' => $skills,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Store a newly created worker in storage.
     */
    public function store(Request $request)
    {
        // Validate the request - Admin can select tenant
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'employee_id' => 'required|string|max:50|unique:workers,employee_number',
            'hire_date' => 'required|date',
            'hourly_rate' => 'nullable|numeric|min:0',
            'skills' => 'array',
            'skills.*.skill_id' => 'required|exists:skills,id',
            'skills.*.level' => 'required|integer|min:1|max:5',
        ]);

        try {
            \DB::beginTransaction();

            // Create user first
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => \Hash::make('password123'), // Default password
                'tenant_id' => $validated['tenant_id'],
                'email_verified_at' => now(),
            ];

            $newUser = \App\Models\User::create($userData);

            // Create worker
            $workerData = [
                'user_id' => $newUser->id,
                'employee_number' => $validated['employee_id'],
                'hire_date' => $validated['hire_date'],
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'status' => 'active',
                'tenant_id' => $validated['tenant_id'],
            ];

            $worker = Worker::create($workerData);

            // Attach skills with levels
            if (!empty($validated['skills'])) {
                $skillsData = [];
                foreach ($validated['skills'] as $skill) {
                    $skillsData[$skill['skill_id']] = ['level' => $skill['level']];
                }
                $worker->skills()->attach($skillsData);
            }

            \DB::commit();

            return redirect()
                ->route('admin.workers.show', $worker)
                ->with('success', 'Worker created successfully!');

        } catch (\Exception $e) {
            \DB::rollback();
            
            return back()
                ->withErrors(['error' => 'Failed to create worker. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Display the specified worker.
     */
    public function show(Worker $worker): Response
    {
        $this->authorize('view', $worker);
        
        $worker->load([
            'skills:id,name',
            'certifications:id,name',
            'location:id,name,address',
            'jobAssignments.job:id,title,status,scheduled_at,completed_at',
            'jobAssignments.job.location:id,name'
        ]);

        return Inertia::render('admin/workers/show', [
            'worker' => [
                'id' => $worker->id,
                'first_name' => $worker->first_name,
                'last_name' => $worker->last_name,
                'email' => $worker->email,
                'phone' => $worker->phone,

                'employee_id' => $worker->employee_number,
                'hire_date' => $worker->hire_date?->format('Y-m-d'),
                'hourly_rate' => $worker->hourly_rate,
                'status' => $worker->status,
                'location' => $worker->location,
                'skills' => $worker->skills->map(fn($skill) => [
                    'id' => $skill->id,
                    'name' => $skill->name,
                    'level' => $skill->pivot->level ?? 1,
                ])->toArray(),
                'certifications' => $worker->certifications->map(fn($cert) => [
                    'id' => $cert->id,
                    'name' => $cert->name,
                    'expiry_date' => $cert->pivot->expires_at 
                        ? \Carbon\Carbon::parse($cert->pivot->expires_at)->format('Y-m-d')
                        : null,
                    'status' => $this->getCertificationStatus($cert->pivot->expires_at),
                ])->toArray(),
                'job_history' => $worker->jobAssignments->map(fn($assignment) => [
                    'job' => [
                        'id' => $assignment->job->id,
                        'title' => $assignment->job->title,
                        'status' => $assignment->job->status,
                        'start_date' => $assignment->job->scheduled_at,
                        'end_date' => $assignment->job->completed_at,
                        'location' => $assignment->job->location,
                    ],
                    'status' => $assignment->status,
                    'assigned_at' => $assignment->created_at,
                ])->toArray(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified worker.
     */
    public function edit(Worker $worker): Response
    {
        $this->authorize('update', $worker);
        
        // Get skills and tenants for the form - Admin can change tenant
        $skills = \App\Models\Skill::where('is_active', true)
            ->select('id', 'name', 'category')
            ->get();

        $tenants = \App\Models\Tenant::select('id', 'name')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('admin/workers/edit', [
            'worker' => $worker->load(['user', 'skills', 'tenant']),
            'skills' => $skills,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Update the specified worker in storage.
     */
    public function update(Request $request, Worker $worker)
    {
        $this->authorize('update', $worker);
        
        // Validate the request - Admin can change tenant
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $worker->user_id,
            'phone' => 'nullable|string|max:20',
            'employee_id' => 'required|string|max:50|unique:workers,employee_number,' . $worker->id,
            'hire_date' => 'required|date',
            'hourly_rate' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,on_leave,terminated',
            'skills' => 'array',
            'skills.*.skill_id' => 'required|exists:skills,id',
            'skills.*.level' => 'required|integer|min:1|max:5',
        ]);

        try {
            \DB::beginTransaction();

            // Update user - also update tenant if changed
            $worker->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'tenant_id' => $validated['tenant_id'],
            ]);

            // Update worker
            $worker->update([
                'employee_number' => $validated['employee_id'],
                'hire_date' => $validated['hire_date'],
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'status' => $validated['status'],
                'tenant_id' => $validated['tenant_id'],
            ]);

            // Update skills with levels
            if (!empty($validated['skills'])) {
                $skillsData = [];
                foreach ($validated['skills'] as $skill) {
                    $skillsData[$skill['skill_id']] = ['level' => $skill['level']];
                }
                $worker->skills()->sync($skillsData);
            } else {
                $worker->skills()->detach();
            }

            \DB::commit();

            return redirect()
                ->route('admin.workers.show', $worker)
                ->with('success', 'Worker updated successfully!');

        } catch (\Exception $e) {
            \DB::rollback();
            
            return back()
                ->withErrors(['error' => 'Failed to update worker. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Remove the specified worker from storage.
     */
    public function destroy(Worker $worker)
    {
        $this->authorize('delete', $worker);
        
        // Soft delete the worker
        $worker->delete();
        
        return redirect()->route('admin.workers.index')
            ->with('success', 'Worker deleted successfully.');
    }

    /**
     * Get certification status based on expiry date.
     */
private function getCertificationStatus(?\Carbon\Carbon $expiry): string
{
    if (!$expiry) return 'unknown';

    $expiry = $expiry->setTimezone(config('app.timezone'));
    $now = now();

    if ($expiry->isPast()) return 'expired';
    if ($expiry->between($now, $now->copy()->addDays(30))) return 'expiring';

    return 'valid';
}




}
