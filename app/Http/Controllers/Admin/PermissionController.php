<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::with(['roles'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('permission_group', 'like', "%{$search}%");
            })
            ->when($request->group, function ($query, $group) {
                $query->where('permission_group', $group);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status);
            });

        $permissions = $query->get()->groupBy('permission_group');
        
        $groups = Permission::distinct('permission_group')
                           ->pluck('permission_group')
                           ->filter()
                           ->values();

        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions,
            'groups' => $groups,
            'filters' => $request->only(['search', 'group', 'status'])
        ]);
    }

    public function show(Permission $permission)
    {
        $permission->load(['roles.users']);

        return Inertia::render('admin/permissions/show', [
            'permission' => $permission,
        ]);
    }

    public function create()
    {
        $existingGroups = Permission::distinct('permission_group')
                                   ->pluck('permission_group')
                                   ->filter()
                                   ->values();

        return Inertia::render('admin/permissions/create', [
            'existingGroups' => $existingGroups
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'nullable|string|max:255',
            'permission_key' => 'required|string|max:255|unique:permissions,permission_key',
            'permission_group' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:permissions,slug',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        Permission::create([
            'name' => $validated['name'],
            'key' => $validated['key'],
            'permission_key' => $validated['permission_key'],
            'permission_group' => $validated['permission_group'],
            'slug' => $validated['slug'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.permissions.index')
                        ->with('success', 'Uprawnienie zostało utworzone pomyślnie.');
    }

    public function edit(Permission $permission)
    {
        $existingGroups = Permission::distinct('permission_group')
                                   ->pluck('permission_group')
                                   ->filter()
                                   ->values();

        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission,
            'existingGroups' => $existingGroups
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'nullable|string|max:255',
            'permission_key' => 'required|string|max:255|unique:permissions,permission_key,' . $permission->id,
            'permission_group' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:permissions,slug,' . $permission->id,
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $permission->update([
            'name' => $validated['name'],
            'key' => $validated['key'],
            'permission_key' => $validated['permission_key'],
            'permission_group' => $validated['permission_group'],
            'slug' => $validated['slug'],
            'description' => $validated['description'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.permissions.show', $permission)
                        ->with('success', 'Uprawnienie zostało zaktualizowane pomyślnie.');
    }

    public function destroy(Permission $permission)
    {
        // Check if permission is assigned to any roles
        if ($permission->roles()->count() > 0) {
            return back()->withErrors([
                'error' => 'Nie można usunąć uprawnienia, które jest przypisane do ról.'
            ]);
        }

        $permission->delete();

        return redirect()->route('admin.permissions.index')
                        ->with('success', 'Uprawnienie zostało usunięte pomyślnie.');
    }

    public function toggleStatus(Permission $permission)
    {
        $permission->update(['is_active' => !$permission->is_active]);

        $status = $permission->is_active ? 'aktywowane' : 'dezaktywowane';
        
        return back()->with('success', "Uprawnienie zostało {$status} pomyślnie.");
    }
}