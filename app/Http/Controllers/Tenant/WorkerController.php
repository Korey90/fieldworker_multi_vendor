<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Worker;
use App\Models\User;
use App\Models\Location;
use App\Models\Skill;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WorkerController extends Controller
{
    protected $tenantId;

    public function __construct()
    {
        // Apply middleware to ensure only authenticated users with tenant access
        $this->middleware(['auth', 'tenant']);

        $this->middleware(function ($request, $next) {
            $this->tenantId = Auth::user()->tenant_id;
            return $next($request);
        });
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if user can view workers
        $this->authorize('viewAny', Worker::class);
        
        $query = Worker::where('tenant_id', $this->tenantId)
            ->with(['user', 'location', 'skills', 'jobAssignments.job'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('employee_number', 'like', "%{$search}%")
              ->orWhere('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        if ($request->filled('skill_id')) {
            $query->whereHas('skills', function ($q) use ($request) {
                $q->where('skills.id', $request->skill_id);
            });
        }

        $workers = $query->paginate(15);

        // Get filter options
        $locations = Location::where('tenant_id', $this->tenantId)
            ->select('id', 'name')
            ->get();

        $skills = Skill::all();

        return Inertia::render('tenant/workers/index', [
            'workers' => $workers,
            'locations' => $locations,
            'skills' => $skills,
            'filters' => $request->only(['search', 'status', 'location_id', 'skill_id']),
            'can' => [
                'create' => Auth::user()->can('create', Worker::class),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Check if user can create workers
        $this->authorize('create', Worker::class);

        // Get available resources for the tenant
        $locations = Location::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'address')
            ->get();
            
        $skills = Skill::all();

        $roles = Role::where('tenant_id', $this->tenantId)
            ->orWhere('tenant_id', null) // Global roles
            ->select('id', 'name', 'description')
            ->get();

        return Inertia::render('tenant/workers/create', [
            'locations' => $locations,
            'skills' => $skills,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user can create workers
        $this->authorize('create', Worker::class);

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'employee_number' => 'nullable|string|max:50|unique:workers,employee_number',
            'location_id' => 'nullable|exists:locations,id',
            'hire_date' => 'nullable|date',
            'hourly_rate' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,suspended',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'exists:skills,id',
            'skill_levels' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            // Create user first
            $user = User::create([
                'tenant_id' => $this->tenantId,
                'email' => $validated['email'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'is_active' => $validated['status'] === 'active',
            ]);

            // Create worker
            $worker = Worker::create([
                'tenant_id' => $this->tenantId,
                'user_id' => $user->id,
                'location_id' => $validated['location_id'] ?? null,
                'employee_number' => $validated['employee_number'] ?? null,
                'hire_date' => $validated['hire_date'] ?? now(),
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'status' => $validated['status'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
            ]);

            // Attach roles
            if (!empty($validated['role_ids'])) {
                $user->roles()->attach($validated['role_ids']);
            }

            // Attach skills with levels
            if (!empty($validated['skill_ids'])) {
                $skillsWithLevels = [];
                foreach ($validated['skill_ids'] as $index => $skillId) {
                    $level = $validated['skill_levels'][$index] ?? 'beginner';
                    $skillsWithLevels[$skillId] = ['level' => $level];
                }
                $worker->skills()->attach($skillsWithLevels);
            }

            DB::commit();

            return redirect()->route('tenant.workers.index')
                ->with('success', 'Pracownik został pomyślnie utworzony.');

        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'general' => ['Wystąpił błąd podczas tworzenia pracownika: ' . $e->getMessage()]
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $worker = Worker::where('tenant_id', $this->tenantId)
            ->with([
                'user.roles',
                'location',
                'skills',
                'jobAssignments.job',
                'jobAssignments' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
                'certifications',
                'formResponses' => function ($query) {
                    $query->orderBy('created_at', 'desc')->limit(5);
                }
            ])
            ->findOrFail($id);

        // Check if user can view this worker
        $this->authorize('view', $worker);

        return Inertia::render('tenant/workers/show', [
            'worker' => $worker,
            'can' => [
                'update' => Auth::user()->can('update', $worker),
                'delete' => Auth::user()->can('delete', $worker),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $worker = Worker::where('tenant_id', $this->tenantId)
            ->with(['user.roles', 'skills'])
            ->findOrFail($id);

        // Check if user can update this worker
        $this->authorize('update', $worker);

        // Get available resources for the tenant
        $locations = Location::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'address')
            ->get();
            
        $skills = Skill::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'description')
            ->get();

        $roles = Role::where('tenant_id', $this->tenantId)
            ->orWhere('tenant_id', null) // Global roles
            ->select('id', 'name', 'description')
            ->get();

        return Inertia::render('tenant/workers/edit', [
            'worker' => $worker,
            'locations' => $locations,
            'skills' => $skills,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $worker = Worker::where('tenant_id', $this->tenantId)
            ->with('user')
            ->findOrFail($id);

        // Check if user can update this worker
        $this->authorize('update', $worker);

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email,' . $worker->user_id,
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'employee_number' => 'nullable|string|max:50|unique:workers,employee_number,' . $id,
            'location_id' => 'nullable|exists:locations,id',
            'hire_date' => 'nullable|date',
            'hourly_rate' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,suspended',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'exists:skills,id',
            'skill_levels' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            // Update user
            $userUpdateData = [
                'email' => $validated['email'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'is_active' => $validated['status'] === 'active',
            ];

            if (!empty($validated['password'])) {
                $userUpdateData['password'] = Hash::make($validated['password']);
            }

            $worker->user->update($userUpdateData);

            // Update worker
            $worker->update([
                'location_id' => $validated['location_id'] ?? null,
                'employee_number' => $validated['employee_number'] ?? null,
                'hire_date' => $validated['hire_date'],
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'status' => $validated['status'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
            ]);

            // Update roles
            if (isset($validated['role_ids'])) {
                $worker->user->roles()->sync($validated['role_ids']);
            }

            // Update skills with levels
            if (isset($validated['skill_ids'])) {
                $skillsWithLevels = [];
                foreach ($validated['skill_ids'] as $index => $skillId) {
                    $level = $validated['skill_levels'][$index] ?? 'beginner';
                    $skillsWithLevels[$skillId] = ['level' => $level];
                }
                $worker->skills()->sync($skillsWithLevels);
            }

            DB::commit();

            return redirect()->route('tenant.workers.show', $worker->id)
                ->with('success', 'Dane pracownika zostały pomyślnie zaktualizowane.');

        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'general' => ['Wystąpił błąd podczas aktualizacji pracownika: ' . $e->getMessage()]
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $worker = Worker::where('tenant_id', $this->tenantId)
            ->with('user')
            ->findOrFail($id);

        // Check if user can delete this worker
        $this->authorize('delete', $worker);

        try {
            DB::beginTransaction();

            // Soft delete worker (this will also handle cascading)
            $worker->delete();
            
            // Optionally also soft delete the associated user
            $worker->user->delete();

            DB::commit();

            return redirect()->route('tenant.workers.index')
                ->with('success', 'Pracownik został pomyślnie usunięty.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('tenant.workers.index')
                ->with('error', 'Wystąpił błąd podczas usuwania pracownika: ' . $e->getMessage());
        }
    }

    /**
     * Get worker statistics for dashboard
     */
    public function stats()
    {
        $stats = [
            'total' => Worker::where('tenant_id', $this->tenantId)->count(),
            'active' => Worker::where('tenant_id', $this->tenantId)->where('status', 'active')->count(),
            'inactive' => Worker::where('tenant_id', $this->tenantId)->where('status', 'inactive')->count(),
            'suspended' => Worker::where('tenant_id', $this->tenantId)->where('status', 'suspended')->count(),
        ];

        return response()->json($stats);
    }
}