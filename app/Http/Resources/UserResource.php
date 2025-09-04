<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'email_verified_at' => $this->email_verified_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'worker' => new WorkerResource($this->whenLoaded('worker')),
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'notifications_count' => $this->when($this->relationLoaded('notifications'), fn() => $this->notifications->count()),
            'unread_notifications_count' => $this->when(
                $this->relationLoaded('notifications'), 
                fn() => $this->notifications->where('is_read', false)->count()
            ),
        ];
    }
}
