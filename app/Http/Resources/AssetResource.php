<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
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
            'asset_type' => $this->asset_type,
            'serial_number' => $this->serial_number,
            'purchase_date' => $this->purchase_date,
            'purchase_cost' => $this->purchase_cost,
            'current_value' => $this->current_value,
            'status' => $this->status,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'current_assignment' => new WorkerResource($this->whenLoaded('currentAssignment')),
            'audit_logs' => AuditLogResource::collection($this->whenLoaded('auditLogs')),
            
            // Computed fields
            'depreciation_value' => $this->when(
                $this->purchase_cost && $this->current_value,
                fn() => $this->purchase_cost - $this->current_value
            ),
            'depreciation_percentage' => $this->when(
                $this->purchase_cost && $this->current_value && $this->purchase_cost > 0,
                fn() => round((($this->purchase_cost - $this->current_value) / $this->purchase_cost) * 100, 2)
            ),
            'age_in_years' => $this->when(
                $this->purchase_date,
                fn() => now()->diffInYears($this->purchase_date)
            ),
            'is_active' => $this->status === 'active',
        ];
    }
}
