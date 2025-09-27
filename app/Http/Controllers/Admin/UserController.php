<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'tenant'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('slug', $role);
                });
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status);
            });

        $users = $query->paginate(50);
                
        $roles = Role::all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status'])
        ]);
    }

    public function show(User $user)
    {
        $user->load(['roles.permissions', 'permissions', 'tenant']);
        
        $availableRoles = Role::all();

        $allPermissions = $user->getAllPermissions();

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'availableRoles' => $availableRoles,
            'allPermissions' => $allPermissions,
        ]);
    }

    public function create()
    {
        $roles = Role::all();

        return Inertia::render('admin/users/create', [
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'data' => 'nullable|array',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'data' => $validated['data'] ?? [],
        ]);

        if (isset($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        }

        return redirect()->route('admin.users.index')
                        ->with('success', 'Użytkownik został utworzony pomyślnie.');
    }

    public function edit(User $user)
    {
        $user->load('roles');
        
        $roles = Role::all();

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles
        ]);
    }

    public function update(Request $request, User $user)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'data' => 'nullable|array',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'data' => $validated['data'] ?? [],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return redirect()->route('admin.users.show', $user)
                        ->with('success', 'Użytkownik został zaktualizowany pomyślnie.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Nie możesz usunąć swojego własnego konta.']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
                        ->with('success', 'Użytkownik został usunięty pomyślnie.');
    }

    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $user->roles()->attach($validated['role_id']);

        return back()->with('success', 'Rola została przypisana pomyślnie.');
    }

    public function removeRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $user->roles()->detach($validated['role_id']);

        return back()->with('success', 'Rola została usunięta pomyślnie.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Nie możesz zmienić statusu swojego własnego konta.']);
        }

        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'aktywowany' : 'dezaktywowany';
        
        return back()->with('success', "Użytkownik został {$status} pomyślnie.");
    }
}