<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificationResource extends JsonResource
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
            'issuing_authority' => $this->authority, // Map authority to issuing_authority
            'validity_period_months' => $this->validity_period_months,
            'is_active' => $this->is_active,
            'tenant_id' => $this->tenant_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'workers' => WorkerResource::collection($this->whenLoaded('workers')),
            
            // Computed fields
            'workers_count' => $this->when(
                $this->relationLoaded('workers'),
                fn() => $this->workers->count()
            ),
            'is_permanent' => $this->validity_period_months === null,
            'validity_years' => $this->when(
                $this->validity_period_months,
                fn() => round($this->validity_period_months / 12, 1)
            ),
            'requires_renewal' => $this->validity_period_months !== null,
        ];
    }
}
