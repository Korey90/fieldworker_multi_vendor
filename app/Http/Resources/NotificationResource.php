<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
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
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            
            // Computed fields
            'time_ago' => $this->created_at->diffForHumans(),
            'is_urgent' => $this->type === 'urgent' || $this->type === 'emergency',
            'priority' => $this->getPriority(),
            'action_url' => $this->when(
                isset($this->data['action_url']),
                fn() => $this->data['action_url']
            ),
        ];
    }

    /**
     * Get notification priority based on type
     */
    private function getPriority()
    {
        return match($this->type) {
            'emergency' => 1,
            'urgent' => 2,
            'warning' => 3,
            'info' => 4,
            default => 5
        };
    }
}
