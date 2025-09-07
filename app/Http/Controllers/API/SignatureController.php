<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SignatureRequest;
use App\Http\Resources\SignatureResource;
use App\Models\Signature;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SignatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tenantId = $request->get('current_tenant_id') ?? auth()->user()->tenant_id;
        
        $signatures = Signature::with(['user'])
            ->where('tenant_id', $tenantId)
            ->when($request->input('user_id'), function ($query, $userId) {
                return $query->where('user_id', $userId);
            })
            ->when($request->input('signatory_name'), function ($query, $signatoryName) {
                return $query->where('signatory_name', 'like', "%{$signatoryName}%");
            })
            ->when($request->input('signatory_role'), function ($query, $signatoryRole) {
                return $query->where('signatory_role', 'like', "%{$signatoryRole}%");
            })
            ->when($request->input('date_from'), function ($query, $dateFrom) {
                return $query->whereDate('signed_at', '>=', $dateFrom);
            })
            ->when($request->input('date_to'), function ($query, $dateTo) {
                return $query->whereDate('signed_at', '<=', $dateTo);
            })
            ->orderBy('signed_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return SignatureResource::collection($signatures);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SignatureRequest $request)
    {
        $validated = $request->validated();

        // Generate unique filename for signature
        $filename = 'signatures/' . Str::uuid() . '.png';
        
        // Decode and store signature image
        $signatureImage = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $validated['signature_data']));
        Storage::disk('public')->put($filename, $signatureImage);

        $validated['signature_path'] = $filename;
        $validated['signature_image_path'] = $filename; // Same as signature_path for compatibility
        $validated['signed_at'] = now();
        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['user_id'] = auth()->id();
        unset($validated['signature_data']);

        $signature = Signature::create($validated);
        $signature->load(['user']);

        // Create audit log
        AuditLog::create([
            'tenant_id' => app('current_tenant')->id,
            'user_id' => auth()->id(),
            'action' => 'signature_created',
            'model_type' => Signature::class,
            'model_id' => $signature->id,
            'new_values' => $signature->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'signatory_name' => $signature->signatory_name,
                'document_hash' => $signature->document_hash,
            ],
        ]);

        return new SignatureResource($signature);
    }

    /**
     * Display the specified resource.
     */
    public function show(Signature $signature)
    {
        // Check tenant access
        if ($signature->tenant_id !== auth()->user()->tenant_id) {
            abort(404);
        }
        
        $signature->load(['user']);
        return new SignatureResource($signature);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SignatureRequest $request, Signature $signature)
    {
        // Check tenant access
        if ($signature->tenant_id !== auth()->user()->tenant_id) {
            abort(404);
        }
        
        // Signatures should generally not be updated to maintain integrity
        $oldValues = $signature->toArray();
        
        $validated = $request->validate([
            'signatory_role' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $signature->update($validated);
        $signature->load(['user']);

        // Create audit log for the update
        AuditLog::create([
            'tenant_id' => app('current_tenant')->id,
            'user_id' => auth()->id(),
            'action' => 'signature_updated',
            'model_type' => Signature::class,
            'model_id' => $signature->id,
            'old_values' => $oldValues,
            'new_values' => $signature->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return new SignatureResource($signature);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Signature $signature)
    {
        // Check tenant access
        if ($signature->tenant_id !== auth()->user()->tenant_id) {
            abort(404);
        }
        
        // Only allow deletion by admin users or the signature owner
        if (!auth()->user() || (auth()->id() !== $signature->user_id && !auth()->user()->hasRole('admin'))) {
            return response()->json([
                'message' => 'You can only delete your own signatures or must be an administrator'
            ], 403);
        }

        $oldValues = $signature->toArray();

        // Delete the signature file
        if ($signature->signature_path && Storage::disk('public')->exists($signature->signature_path)) {
            Storage::disk('public')->delete($signature->signature_path);
        }

        // Create audit log for the deletion
        AuditLog::create([
            'tenant_id' => app('current_tenant')->id,
            'user_id' => auth()->id(),
            'action' => 'signature_deleted',
            'model_type' => Signature::class,
            'model_id' => $signature->id,
            'old_values' => $oldValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'signatory_name' => $signature->signatory_name,
                'deleted_file' => $signature->signature_path,
            ],
        ]);

        $signature->delete();
        return response()->noContent();
    }

    /**
     * Download signature image
     */
    public function download(Signature $signature)
    {
        if (!$signature->signature_path || !Storage::disk('public')->exists($signature->signature_path)) {
            return response()->json(['error' => 'Signature file not found'], 404);
        }

        $filename = 'signature_' . $signature->signatory_name . '_' . $signature->signed_at->format('Y-m-d') . '.png';
        
        return Storage::disk('public')->download($signature->signature_path, $filename);
    }

    /**
     * Verify signature integrity
     */
    public function verify(Signature $signature, Request $request)
    {
        // Check tenant access
        if ($signature->tenant_id !== auth()->user()->tenant_id) {
            abort(404);
        }
        
        $documentHash = $request->input('document_hash');
        
        if (!$documentHash) {
            return response()->json(['error' => 'Document hash is required for verification'], 400);
        }

        $isValid = $signature->document_hash === $documentHash;
        
        // Log verification attempt
        AuditLog::create([
            'tenant_id' => app('current_tenant')->id,
            'user_id' => auth()->id(),
            'action' => 'signature_verification',
            'model_type' => Signature::class,
            'model_id' => $signature->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'verification_result' => $isValid ? 'valid' : 'invalid',
                'provided_hash' => $documentHash,
                'stored_hash' => $signature->document_hash,
            ],
        ]);

        return response()->json([
            'signature_id' => $signature->id,
            'is_valid' => $isValid,
            'signatory_name' => $signature->signatory_name,
            'signed_at' => $signature->signed_at,
            'verification_timestamp' => now(),
            'message' => $isValid ? 'Signature is valid' : 'Signature verification failed - document may have been modified',
        ]);
    }

    /**
     * Get signature statistics
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subDays(30));
        $dateTo = $request->input('date_to', now());

        $query = Signature::whereBetween('signed_at', [$dateFrom, $dateTo]);

        $stats = [
            'total_signatures' => $query->count(),
            'unique_signatories' => $query->distinct('signatory_name')->count('signatory_name'),
            'signatures_by_role' => $query->whereNotNull('signatory_role')
                ->groupBy('signatory_role')
                ->selectRaw('signatory_role, count(*) as count')
                ->pluck('count', 'signatory_role'),
            'daily_signatures' => $query->selectRaw('DATE(signed_at) as date, count(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date'),
            'storage_used' => $this->calculateStorageUsed(),
        ];

        return response()->json($stats);
    }

    /**
     * Get user signatures
     */
    public function userSignatures(Request $request)
    {
        $userId = $request->input('user_id', auth()->id());
        
        $signatures = Signature::where('user_id', $userId)
            ->with(['user'])
            ->orderBy('signed_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return SignatureResource::collection($signatures);
    }

    /**
     * Bulk delete signatures
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'signature_ids' => 'required|array',
            'signature_ids.*' => 'exists:signatures,id',
        ]);

        $signatures = Signature::whereIn('id', $request->input('signature_ids'))->get();
        
        // Check permissions
        foreach ($signatures as $signature) {
            if (auth()->id() !== $signature->user_id && !auth()->user()->hasRole('admin')) {
                return response()->json([
                    'message' => 'You can only delete your own signatures or must be an administrator'
                ], 403);
            }
        }

        $deletedCount = 0;
        foreach ($signatures as $signature) {
            // Delete the signature file
            if ($signature->signature_path && Storage::disk('public')->exists($signature->signature_path)) {
                Storage::disk('public')->delete($signature->signature_path);
            }

            // Create audit log
            AuditLog::create([
                'tenant_id' => app('current_tenant')->id,
                'user_id' => auth()->id(),
                'action' => 'signature_bulk_deleted',
                'model_type' => Signature::class,
                'model_id' => $signature->id,
                'old_values' => $signature->toArray(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $signature->delete();
            $deletedCount++;
        }

        return response()->json([
            'message' => "Successfully deleted {$deletedCount} signatures",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Calculate storage used by signatures
     */
    private function calculateStorageUsed()
    {
        $signatures = Signature::whereNotNull('signature_path')->get();
        $totalSize = 0;

        foreach ($signatures as $signature) {
            if (Storage::disk('public')->exists($signature->signature_path)) {
                $totalSize += Storage::disk('public')->size($signature->signature_path);
            }
        }

        return [
            'total_bytes' => $totalSize,
            'total_mb' => round($totalSize / 1024 / 1024, 2),
            'total_files' => $signatures->count(),
        ];
    }
}
