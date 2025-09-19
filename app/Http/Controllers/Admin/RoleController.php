<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::with(['permissions', 'users'])
            ->where(function($q) {
                $q->where('tenant_id', auth()->user()->tenant_id)
                  ->orWhere('tenant_id', null);
            })
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            });

        $roles = $query->get();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['search'])
        ]);
    }

    public function show(Role $role)
    {
        $role->load(['permissions', 'users']);
        
        $availablePermissions = Permission::where('is_active', true)
                                        ->whereNotIn('id', $role->permissions->pluck('id'))
                                        ->get()
                                        ->groupBy('permission_group');

        return Inertia::render('admin/roles/show', [
            'role' => $role,
            'availablePermissions' => $availablePermissions,
        ]);
    }

    public function create()
    {
        $permissions = Permission::where('is_active', true)
                                ->get()
                                ->groupBy('permission_group');

        return Inertia::render('admin/roles/create', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'slug' => 'required|string|max:255|unique:roles,slug',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => $validated['slug'],
        ]);

        if (isset($validated['permissions'])) {
            $role->permissions()->attach($validated['permissions']);
        }

        return redirect()->route('admin.roles.index')
                        ->with('success', 'Rola została utworzona pomyślnie.');
    }

    public function edit(Role $role)
    {
        $role->load('permissions');
        
        $permissions = Permission::where('is_active', true)
                                ->get()
                                ->groupBy('permission_group');

        return Inertia::render('admin/roles/edit', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'slug' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'slug' => $validated['slug'],
        ]);

        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return redirect()->route('admin.roles.show', $role)
                        ->with('success', 'Rola została zaktualizowana pomyślnie.');
    }

    public function destroy(Role $role)
    {
        // Check if role has users assigned
        if ($role->users()->count() > 0) {
            return back()->withErrors([
                'error' => 'Nie można usunąć roli, która jest przypisana do użytkowników.'
            ]);
        }

        $role->delete();

        return redirect()->route('admin.roles.index')
                        ->with('success', 'Rola została usunięta pomyślnie.');
    }

    public function assignPermission(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permission_id' => 'required|exists:permissions,id'
        ]);

        $role->permissions()->attach($validated['permission_id']);

        return back()->with('success', 'Uprawnienie zostało przypisane pomyślnie.');
    }

    public function removePermission(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permission_id' => 'required|exists:permissions,id'
        ]);

        $role->permissions()->detach($validated['permission_id']);

        return back()->with('success', 'Uprawnienie zostało usunięte pomyślnie.');
    }
}