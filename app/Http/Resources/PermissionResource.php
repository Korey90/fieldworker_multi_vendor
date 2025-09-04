<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'permission_key' => $this->permission_key,
            'permission_group' => $this->permission_group,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            
            // Computed fields
            'roles_count' => $this->when(
                $this->relationLoaded('roles'),
                fn() => $this->roles->count()
            ),
            'is_system_permission' => str_starts_with($this->permission_key, 'system.'),
            'is_tenant_permission' => str_starts_with($this->permission_key, 'tenant.'),
            'action' => $this->when(
                $this->permission_key,
                fn() => $this->extractAction($this->permission_key)
            ),
            'resource' => $this->when(
                $this->permission_key,
                fn() => $this->extractResource($this->permission_key)
            ),
        ];
    }

    /**
     * Extract action from permission key (e.g., 'create' from 'users.create')
     */
    private function extractAction($permissionKey)
    {
        $parts = explode('.', $permissionKey);
        return end($parts);
    }

    /**
     * Extract resource from permission key (e.g., 'users' from 'users.create')
     */
    private function extractResource($permissionKey)
    {
        $parts = explode('.', $permissionKey);
        return count($parts) > 1 ? $parts[0] : null;
    }
}
