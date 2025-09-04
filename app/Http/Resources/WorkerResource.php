<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkerResource extends JsonResource
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
            'employee_number' => $this->employee_number,
            'status' => $this->status,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => new UserResource($this->whenLoaded('user')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'skills' => SkillResource::collection($this->whenLoaded('skills')),
            'certifications' => CertificationResource::collection($this->whenLoaded('certifications')),
            
            // Job stats
            'active_jobs_count' => $this->when(
                $this->relationLoaded('jobAssignments'),
                fn() => $this->jobAssignments()->whereHas('job', function($query) {
                    $query->whereIn('status', ['assigned', 'in_progress']);
                })->count()
            ),
            'completed_jobs_count' => $this->when(
                $this->relationLoaded('jobAssignments'),
                fn() => $this->jobAssignments()->whereHas('job', function($query) {
                    $query->where('status', 'completed');
                })->count()
            ),
        ];
    }
}
