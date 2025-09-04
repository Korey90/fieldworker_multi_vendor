<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
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
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'location_type' => $this->location_type,
            'is_active' => $this->is_active,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'workers' => WorkerResource::collection($this->whenLoaded('workers')),
            'jobs' => JobResource::collection($this->whenLoaded('jobs')),
            'assets' => AssetResource::collection($this->whenLoaded('assets')),
            
            // Computed fields
            'workers_count' => $this->when(
                $this->relationLoaded('workers'),
                fn() => $this->workers->count()
            ),
            'active_jobs_count' => $this->when(
                $this->relationLoaded('jobs'),
                fn() => $this->jobs->where('status', 'active')->count()
            ),
            'assets_count' => $this->when(
                $this->relationLoaded('assets'),
                fn() => $this->assets->count()
            ),
            'coordinates' => $this->when(
                $this->latitude && $this->longitude,
                fn() => ['lat' => $this->latitude, 'lng' => $this->longitude]
            ),
            'full_address' => $this->address . ', ' . $this->city . ', ' . $this->state . ' ' . $this->postal_code . ', ' . $this->country,
        ];
    }
}
