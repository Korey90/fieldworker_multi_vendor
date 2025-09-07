<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureResource extends JsonResource
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
            'form_response_id' => $this->form_response_id,
            'user_id' => $this->user_id,
            'signatory_name' => $this->signatory_name,
            'signatory_role' => $this->signatory_role,
            'name' => $this->name, // Legacy field
            'role' => $this->role, // Legacy field
            'signature_image_path' => $this->signature_image_path,
            'signature_path' => $this->signature_path,
            'document_hash' => $this->document_hash,
            'signed_at' => $this->signed_at,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'form_response' => new FormResponseResource($this->whenLoaded('formResponse')),
            'user' => new UserResource($this->whenLoaded('user')),
            
            // Computed fields
            'signature_url' => $this->when($this->signature_path, function () {
                return asset('storage/' . $this->signature_path);
            }),
            'signature_image_url' => $this->when($this->signature_image_path, function () {
                return asset('storage/' . $this->signature_image_path);
            }),
            'is_verified' => $this->when($this->document_hash, function () {
                return !empty($this->document_hash);
            }),
            'time_since_signed' => $this->when($this->signed_at, function () {
                return $this->signed_at->diffForHumans();
            }),
        ];
    }
}
