<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at,
            'completed_at' => $this->completed_at,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'location' => new LocationResource($this->whenLoaded('location')),
            'assignments' => JobAssignmentResource::collection($this->whenLoaded('assignments')),
            'form_responses' => FormResponseResource::collection($this->whenLoaded('formResponses')),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
            
            // Computed fields
            'assigned_workers_count' => $this->when(
                $this->relationLoaded('assignments'),
                fn() => $this->assignments->count()
            ),
            'duration' => $this->when(
                $this->completed_at && $this->scheduled_at,
                fn() => $this->completed_at->diffInHours($this->scheduled_at)
            ),
            'is_overdue' => $this->when(
                $this->scheduled_at,
                fn() => $this->scheduled_at->isPast() && !in_array($this->status, ['completed', 'cancelled'])
            ),
        ];
    }
}
