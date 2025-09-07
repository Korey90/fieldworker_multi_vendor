<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormResource extends JsonResource
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
            'type' => $this->type,
            'schema' => $this->schema,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'responses' => FormResponseResource::collection($this->whenLoaded('responses')),
            
            // Computed fields
            'responses_count' => $this->when(
                $this->relationLoaded('responses'),
                fn() => $this->responses->count()
            ),
            'fields_count' => $this->when(
                $this->schema && isset($this->schema['fields']),
                fn() => count($this->schema['fields'])
            ),
            'recent_responses_count' => $this->when(
                $this->relationLoaded('responses'),
                fn() => $this->responses->where('created_at', '>=', now()->subDays(7))->count()
            ),
        ];
    }
}
