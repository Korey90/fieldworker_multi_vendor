<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttachmentRequest;
use App\Http\Resources\AttachmentResource;
use App\Models\Attachment;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $attachments = Attachment::query()
            ->with(['tenant', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('original_filename', 'like', "%{$search}%")
                      ->orWhere('filename', 'like', "%{$search}%");
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->attachable_type, function ($query, $type) {
                $query->where('attachable_type', $type);
            })
            ->when($request->attachable_id, function ($query, $id) {
                $query->where('attachable_id', $id);
            })
            ->when($request->mime_type, function ($query, $mimeType) {
                $query->where('mime_type', 'like', "%{$mimeType}%");
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => AttachmentResource::collection($attachments->items()),
            'meta' => [
                'current_page' => $attachments->currentPage(),
                'last_page' => $attachments->lastPage(),
                'per_page' => $attachments->perPage(),
                'total' => $attachments->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AttachmentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $file = $request->file('file');
        
        // Generate unique filename
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        
        // Store file
        $path = $file->storeAs(
            'attachments/' . $validated['tenat_id'],
            $filename,
            'private'
        );

        $attachment = Attachment::create([
            'filename' => $filename,
            'original_filename' => $originalName,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'tenat_id' => $validated['tenat_id'],
            'user_id' => auth()->id(),
            'attachable_type' => $validated['attachable_type'] ?? null,
            'attachable_id' => $validated['attachable_id'] ?? null,
            'data' => [
                'description' => $validated['description'] ?? null,
                'uploaded_at' => now(),
                'ip_address' => $request->ip(),
            ]
        ]);

        $attachment->load(['tenant', 'user']);

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => new AttachmentResource($attachment)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $attachment = Attachment::with(['tenant', 'user'])->findOrFail($id);

        return response()->json([
            'data' => new AttachmentResource($attachment)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $attachment = Attachment::findOrFail($id);

        $validated = $request->validate([
            'original_filename' => 'sometimes|required|string|max:255',
            'attachable_type' => 'nullable|string',
            'attachable_id' => 'nullable|integer',
            'description' => 'nullable|string|max:500',
        ]);

        // Update data field
        $data = $attachment->data ?? [];
        if (isset($validated['description'])) {
            $data['description'] = $validated['description'];
        }
        $validated['data'] = $data;

        $attachment->update($validated);
        $attachment->load(['tenant', 'user']);

        return response()->json([
            'message' => 'Attachment updated successfully',
            'data' => new AttachmentResource($attachment)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $attachment = Attachment::findOrFail($id);
        
        // Delete file from storage
        if (Storage::disk('private')->exists($attachment->file_path)) {
            Storage::disk('private')->delete($attachment->file_path);
        }

        $attachment->delete();

        return response()->json([
            'message' => 'Attachment deleted successfully'
        ]);
    }

    /**
     * Download attachment
     */
    public function download(string $id): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $attachment = Attachment::findOrFail($id);

        if (!Storage::disk('private')->exists($attachment->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('private')->download(
            $attachment->file_path,
            $attachment->original_filename
        );
    }

    /**
     * Get attachment preview/thumbnail
     */
    public function preview(string $id): JsonResponse
    {
        $attachment = Attachment::findOrFail($id);

        if (!str_starts_with($attachment->mime_type, 'image/')) {
            return response()->json([
                'error' => 'Preview not available for this file type'
            ], 422);
        }

        $path = Storage::disk('private')->path($attachment->file_path);
        
        if (!file_exists($path)) {
            return response()->json([
                'error' => 'File not found'
            ], 404);
        }

        $base64 = base64_encode(file_get_contents($path));
        
        return response()->json([
            'data' => [
                'base64' => 'data:' . $attachment->mime_type . ';base64,' . $base64,
                'mime_type' => $attachment->mime_type,
                'filename' => $attachment->original_filename,
            ]
        ]);
    }

    /**
     * Bulk upload files
     */
    public function bulkUpload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'file|max:10240',
            'tenat_id' => 'required|exists:tenats,id',
            'attachable_type' => 'nullable|string',
            'attachable_id' => 'nullable|integer',
        ]);

        $uploadedFiles = [];
        $errors = [];

        foreach ($validated['files'] as $index => $file) {
            try {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;
                
                $path = $file->storeAs(
                    'attachments/' . $validated['tenat_id'],
                    $filename,
                    'private'
                );

                $attachment = Attachment::create([
                    'filename' => $filename,
                    'original_filename' => $originalName,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'tenat_id' => $validated['tenat_id'],
                    'user_id' => auth()->id(),
                    'attachable_type' => $validated['attachable_type'] ?? null,
                    'attachable_id' => $validated['attachable_id'] ?? null,
                    'data' => [
                        'uploaded_at' => now(),
                        'ip_address' => $request->ip(),
                        'bulk_upload' => true,
                    ]
                ]);

                $uploadedFiles[] = new AttachmentResource($attachment);
            } catch (\Exception $e) {
                $errors[] = [
                    'file_index' => $index,
                    'filename' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'message' => 'Bulk upload completed',
            'uploaded' => $uploadedFiles,
            'errors' => $errors,
            'success_count' => count($uploadedFiles),
            'error_count' => count($errors),
        ]);
    }

    /**
     * Get tenant storage usage
     */
    private function getTenantStorageUsage($tenantId): float
    {
        $totalBytes = Attachment::where('tenat_id', $tenantId)->sum('file_size');
        return $totalBytes / 1024 / 1024; // Convert to MB
    }

    /**
     * Get storage statistics
     */
    public function storageStats(Request $request): JsonResponse
    {
        $tenantId = $request->get('tenant_id');
        
        $stats = [
            'total_files' => Attachment::when($tenantId, fn($q) => $q->where('tenat_id', $tenantId))->count(),
            'total_size_mb' => $this->getTenantStorageUsage($tenantId),
            'by_type' => Attachment::when($tenantId, fn($q) => $q->where('tenat_id', $tenantId))
                ->selectRaw('mime_type, COUNT(*) as count, SUM(file_size) as total_size')
                ->groupBy('mime_type')
                ->get(),
            'recent_uploads' => Attachment::when($tenantId, fn($q) => $q->where('tenat_id', $tenantId))
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
