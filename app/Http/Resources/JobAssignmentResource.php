<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobAssignmentResource extends JsonResource
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
            'assigned_at' => $this->assigned_at,
            'status' => $this->status,
            'notes' => $this->notes,
            'completed_at' => $this->completed_at,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'worker' => new WorkerResource($this->whenLoaded('worker')),
            'job' => new JobResource($this->whenLoaded('job')),
            
            // Computed fields
            'is_completed' => $this->status === 'completed',
            'duration' => $this->when(
                $this->completed_at && $this->assigned_at,
                fn() => $this->completed_at->diffInHours($this->assigned_at)
            ),
            'is_overdue' => $this->when(
                $this->assigned_at && !$this->completed_at,
                fn() => $this->assigned_at->addDays(1)->isPast()
            ),
        ];
    }
}
