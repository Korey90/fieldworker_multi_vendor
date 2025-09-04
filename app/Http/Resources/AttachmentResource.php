<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentResource extends JsonResource
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
            'filename' => $this->filename,
            'original_filename' => $this->original_filename,
            'file_path' => $this->file_path,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'user' => new UserResource($this->whenLoaded('user')),
            
            // Computed fields
            'file_size_human' => $this->when(
                $this->file_size,
                fn() => $this->formatBytes($this->file_size)
            ),
            'file_extension' => $this->when(
                $this->filename,
                fn() => pathinfo($this->filename, PATHINFO_EXTENSION)
            ),
            'is_image' => $this->when(
                $this->mime_type,
                fn() => str_starts_with($this->mime_type, 'image/')
            ),
            'download_url' => route('attachments.download', $this->id),
        ];
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
