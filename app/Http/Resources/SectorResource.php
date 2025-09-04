<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectorResource extends JsonResource
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
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'locations' => LocationResource::collection($this->whenLoaded('locations')),
            'tenants' => TenantResource::collection($this->whenLoaded('tenants')),
            
            // Computed fields
            'locations_count' => $this->when(
                $this->relationLoaded('locations'),
                fn() => $this->locations->count()
            ),
            'tenants_count' => $this->when(
                $this->relationLoaded('tenants'),
                fn() => $this->tenants->count()
            ),
        ];
    }
}
