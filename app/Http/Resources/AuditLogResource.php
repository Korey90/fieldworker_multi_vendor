<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
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
            'action' => $this->action,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'model_type' => $this->model_type,
            'model_id' => $this->model_id,
            'changes' => $this->changes,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'metadata' => $this->metadata,
            'user_id' => $this->user_id,
            'tenant_id' => $this->tenant_id,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'user' => new UserResource($this->whenLoaded('user')),
            
            // Computed fields
            'auditable_model' => $this->when(
                $this->model_type,
                fn() => class_basename($this->model_type)
            ),
            'changes_count' => $this->when(
                $this->new_values,
                fn() => count($this->new_values)
            ),
            'has_changes' => $this->when(
                $this->old_values && $this->new_values,
                fn() => $this->old_values !== $this->new_values
            ),
            'browser' => $this->when(
                $this->user_agent,
                fn() => $this->parseBrowser($this->user_agent)
            ),
        ];
    }

    /**
     * Parse browser from user agent
     */
    private function parseBrowser($userAgent)
    {
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        if (str_contains($userAgent, 'Opera')) return 'Opera';
        return 'Unknown';
    }
}
