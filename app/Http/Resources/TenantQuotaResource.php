<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantQuotaResource extends JsonResource
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
            'max_users' => $this->max_users,
            'max_workers' => $this->max_workers,
            'max_locations' => $this->max_locations,
            'max_assets' => $this->max_assets,
            'max_storage_gb' => $this->max_storage_gb,
            'current_users' => $this->current_users,
            'current_workers' => $this->current_workers,
            'current_locations' => $this->current_locations,
            'current_assets' => $this->current_assets,
            'current_storage_gb' => $this->current_storage_gb,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            
            // Computed fields
            'users_usage_percentage' => $this->when(
                $this->max_users > 0,
                fn() => round(($this->current_users / $this->max_users) * 100, 2)
            ),
            'workers_usage_percentage' => $this->when(
                $this->max_workers > 0,
                fn() => round(($this->current_workers / $this->max_workers) * 100, 2)
            ),
            'locations_usage_percentage' => $this->when(
                $this->max_locations > 0,
                fn() => round(($this->current_locations / $this->max_locations) * 100, 2)
            ),
            'assets_usage_percentage' => $this->when(
                $this->max_assets > 0,
                fn() => round(($this->current_assets / $this->max_assets) * 100, 2)
            ),
            'storage_usage_percentage' => $this->when(
                $this->max_storage_gb > 0,
                fn() => round(($this->current_storage_gb / $this->max_storage_gb) * 100, 2)
            ),
            'is_users_limit_reached' => $this->current_users >= $this->max_users,
            'is_workers_limit_reached' => $this->current_workers >= $this->max_workers,
            'is_locations_limit_reached' => $this->current_locations >= $this->max_locations,
            'is_assets_limit_reached' => $this->current_assets >= $this->max_assets,
            'is_storage_limit_reached' => $this->current_storage_gb >= $this->max_storage_gb,
            'overall_usage_health' => $this->getOverallUsageHealth(),
        ];
    }

    /**
     * Get overall usage health status
     */
    private function getOverallUsageHealth()
    {
        $usagePercentages = [
            $this->max_users > 0 ? ($this->current_users / $this->max_users) * 100 : 0,
            $this->max_workers > 0 ? ($this->current_workers / $this->max_workers) * 100 : 0,
            $this->max_locations > 0 ? ($this->current_locations / $this->max_locations) * 100 : 0,
            $this->max_assets > 0 ? ($this->current_assets / $this->max_assets) * 100 : 0,
            $this->max_storage_gb > 0 ? ($this->current_storage_gb / $this->max_storage_gb) * 100 : 0,
        ];

        $maxUsage = max($usagePercentages);

        return match(true) {
            $maxUsage >= 90 => 'critical',
            $maxUsage >= 75 => 'warning',
            $maxUsage >= 50 => 'moderate',
            default => 'healthy'
        };
    }
}
