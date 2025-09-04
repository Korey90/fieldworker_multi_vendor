<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
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
            'sector' => $this->sector,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Conditional relationships
            'users_count' => $this->when($this->relationLoaded('users'), fn() => $this->users->count()),
            'workers_count' => $this->when($this->relationLoaded('workers'), fn() => $this->workers->count()),
            'jobs_count' => $this->when($this->relationLoaded('jobs'), fn() => $this->jobs->count()),
            'locations_count' => $this->when($this->relationLoaded('locations'), fn() => $this->locations->count()),
            'assets_count' => $this->when($this->relationLoaded('assets'), fn() => $this->assets->count()),
            
            'quota' => new TenantQuotaResource($this->whenLoaded('quota')),
            'features' => FeatureResource::collection($this->whenLoaded('features')),
        ];
    }
}
