<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeatureResource extends JsonResource
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
            'feature_key' => $this->feature_key,
            'is_active' => $this->is_active,
            'feature_type' => $this->feature_type,
            'config' => $this->config,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenants' => TenantResource::collection($this->whenLoaded('tenants')),
            
            // Computed fields
            'tenants_count' => $this->when(
                $this->relationLoaded('tenants'),
                fn() => $this->tenants->count()
            ),
            'is_premium' => $this->feature_type === 'premium',
            'is_addon' => $this->feature_type === 'addon',
            'config_count' => $this->when(
                $this->config,
                fn() => count($this->config)
            ),
        ];
    }
}
