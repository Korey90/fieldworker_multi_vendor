<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
            'slug' => $this->slug,
            'tenant_id' => $this->tenant_id,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
            'users' => UserResource::collection($this->whenLoaded('users')),
            
            // Computed fields
            'permissions_count' => $this->when(
                $this->relationLoaded('permissions'),
                fn() => $this->permissions->count()
            ),
            'users_count' => $this->when(
                $this->relationLoaded('users'),
                fn() => $this->users->count()
            ),
            'is_admin' => $this->slug === 'admin',
            'is_manager' => $this->slug === 'manager',
            'is_worker' => $this->slug === 'worker',
        ];
    }
}
