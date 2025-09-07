<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Http\Resources\PermissionResource;
use App\Http\Requests\RoleRequest;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roles = Role::query()
            ->where('tenant_id', $tenantId)
            ->with(['tenant', 'permissions', 'users'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => RoleResource::collection($roles->items()),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $role = Role::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'slug' => $this->generateSlug($validated['name']),
        ]);

        // Attach permissions if provided
        if (isset($validated['permissions']) && is_array($validated['permissions'])) {
            $role->permissions()->attach($validated['permissions']);
        }

        $role->load(['tenant', 'permissions', 'users']);

        return response()->json([
            'message' => 'Role created successfully',
            'data' => new RoleResource($role)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $role): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roleModel = Role::where('tenant_id', $tenantId)
            ->with(['tenant', 'permissions', 'users'])
            ->findOrFail($role);

        return response()->json([
            'data' => new RoleResource($roleModel)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, string $role): JsonResponse
    {
        $tenantId = $request->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roleModel = Role::where('tenant_id', $tenantId)->findOrFail($role);
        $validated = $request->validated();

        $updateData = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ];

        // Update slug if name changed
        if ($roleModel->name !== $validated['name']) {
            $updateData['slug'] = $this->generateSlug($validated['name']);
        }

        $roleModel->update($updateData);

        // Sync permissions if provided
        if (isset($validated['permissions']) && is_array($validated['permissions'])) {
            $roleModel->permissions()->sync($validated['permissions']);
        }

        $roleModel->load(['tenant', 'permissions', 'users']);

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => new RoleResource($roleModel)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $role): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roleModel = Role::where('tenant_id', $tenantId)
            ->findOrFail($role);
        
        // Check if role has users assigned
        if ($roleModel->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role with assigned users. Please reassign users first.'
            ], 422);
        }

        // Detach all permissions
        $roleModel->permissions()->detach();
        
        $roleModel->delete();

        return response()->json(null, 204);
    }

    /**
     * Get permissions for role
     */
    public function permissions(string $id): JsonResponse
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json([
            'data' => $role->permissions->pluck('id')->toArray()
        ]);
    }

    /**
     * Assign permission to role
     */
    public function assignPermission(string $role, string $permissionId): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roleModel = Role::where('tenant_id', $tenantId)
            ->findOrFail($role);
        
        $permission = Permission::findOrFail($permissionId);
        
        $roleModel->permissions()->syncWithoutDetaching([$permission->id]);
        
        return response()->json([
            'message' => 'Permission assigned successfully'
        ]);
    }

    /**
     * Remove permission from role
     */
    public function removePermission(string $role, string $permissionId): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roleModel = Role::where('tenant_id', $tenantId)
            ->findOrFail($role);
        $permission = Permission::findOrFail($permissionId);

        $roleModel->permissions()->detach($permission->id);

        return response()->json([
            'message' => 'Permission removed successfully'
        ]);
    }

    /**
     * Generate unique slug for role
     */
    private function generateSlug(string $name): string
    {
        $baseSlug = str_replace(' ', '-', strtolower($name));
        $slug = $baseSlug;
        $counter = 1;

        while (Role::where('tenant_id', auth()->user()->tenant_id)
                  ->where('slug', $slug)
                  ->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * List permissions for role
     */
    public function listPermissions(string $role): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $roleModel = Role::where('tenant_id', $tenantId)
            ->with('permissions')
            ->findOrFail($role);
        
        return response()->json([
            'data' => PermissionResource::collection($roleModel->permissions)
        ]);
    }
}
