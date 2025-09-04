<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormResponseResource extends JsonResource
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
            'response_data' => $this->response_data,
            'submitted_at' => $this->submitted_at,
            'is_submitted' => $this->is_submitted,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'form' => new FormResource($this->whenLoaded('form')),
            'user' => new UserResource($this->whenLoaded('user')),
            'job' => new JobResource($this->whenLoaded('job')),
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            
            // Computed fields
            'fields_count' => $this->when(
                $this->response_data,
                fn() => count($this->response_data)
            ),
            'completion_percentage' => $this->when(
                $this->form && $this->response_data,
                fn() => $this->calculateCompletionPercentage()
            ),
            'time_to_submit' => $this->when(
                $this->submitted_at && $this->created_at,
                fn() => $this->submitted_at->diffForHumans($this->created_at)
            ),
        ];
    }

    /**
     * Calculate completion percentage based on form fields and response data
     */
    private function calculateCompletionPercentage()
    {
        if (!$this->form || !$this->form->fields || !$this->response_data) {
            return 0;
        }

        $totalFields = count($this->form->fields);
        $completedFields = 0;

        foreach ($this->form->fields as $field) {
            $fieldName = $field['name'] ?? null;
            if ($fieldName && isset($this->response_data[$fieldName]) && !empty($this->response_data[$fieldName])) {
                $completedFields++;
            }
        }

        return $totalFields > 0 ? round(($completedFields / $totalFields) * 100, 2) : 0;
    }
}
