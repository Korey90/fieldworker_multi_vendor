<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillResource extends JsonResource
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
            'skill_type' => $this->skill_type,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'workers' => WorkerResource::collection($this->whenLoaded('workers')),
            
            // Computed fields
            'workers_count' => $this->when(
                $this->relationLoaded('workers'),
                fn() => $this->workers->count()
            ),
            'is_technical' => $this->skill_type === 'technical',
            'is_soft' => $this->skill_type === 'soft',
            'is_certification' => $this->skill_type === 'certification',
            'category' => $this->skill_type,
        ];
    }
}
