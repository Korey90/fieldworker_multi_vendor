<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $logs = AuditLog::with(['user'])
            ->when($request->input('user_id'), function ($query, $userId) {
                return $query->where('user_id', $userId);
            })
            ->when($request->input('action'), function ($query, $action) {
                return $query->where('action', $action);
            })
            ->when($request->input('model_type'), function ($query, $modelType) {
                return $query->where('model_type', $modelType);
            })
            ->when($request->input('model_id'), function ($query, $modelId) {
                return $query->where('model_id', $modelId);
            })
            ->when($request->input('ip_address'), function ($query, $ipAddress) {
                return $query->where('ip_address', $ipAddress);
            })
            ->when($request->input('date_from'), function ($query, $dateFrom) {
                return $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->input('date_to'), function ($query, $dateTo) {
                return $query->whereDate('created_at', '<=', $dateTo);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return AuditLogResource::collection($logs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'action' => 'required|string|max:255',
            'model_type' => 'nullable|string|max:255',
            'model_id' => 'nullable|integer',
            'old_values' => 'nullable|array',
            'new_values' => 'nullable|array',
            'ip_address' => 'nullable|ip',
            'user_agent' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // Add IP address and user agent if not provided
        if (!isset($validated['ip_address'])) {
            $validated['ip_address'] = $request->ip();
        }
        
        if (!isset($validated['user_agent'])) {
            $validated['user_agent'] = $request->userAgent();
        }

        $auditLog = AuditLog::create($validated);
        $auditLog->load(['user']);

        return new AuditLogResource($auditLog);
    }

    /**
     * Display the specified resource.
     */
    public function show(AuditLog $auditLog)
    {
        $auditLog->load(['user']);
        return new AuditLogResource($auditLog);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AuditLog $auditLog)
    {
        // Audit logs should generally not be updated to maintain integrity
        return response()->json([
            'message' => 'Audit logs cannot be modified to maintain data integrity'
        ], 403);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AuditLog $auditLog)
    {
        // Only allow deletion by admin users and log the deletion
        if (!auth()->user() || !auth()->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Only administrators can delete audit logs'
            ], 403);
        }

        // Create a log entry for the deletion
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'deleted_audit_log',
            'model_type' => AuditLog::class,
            'model_id' => $auditLog->id,
            'old_values' => $auditLog->toArray(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'original_log_action' => $auditLog->action,
                'original_log_date' => $auditLog->created_at,
            ],
        ]);

        $auditLog->delete();
        return response()->noContent();
    }

    /**
     * Get audit statistics
     */
    public function statistics(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->subDays(30));
        $dateTo = $request->input('date_to', now());

        $query = AuditLog::whereBetween('created_at', [$dateFrom, $dateTo]);

        $stats = [
            'total_logs' => $query->count(),
            'unique_users' => $query->distinct('user_id')->count('user_id'),
            'unique_ips' => $query->distinct('ip_address')->count('ip_address'),
            'actions_breakdown' => $query->groupBy('action')
                ->selectRaw('action, count(*) as count')
                ->pluck('count', 'action'),
            'models_breakdown' => $query->whereNotNull('model_type')
                ->groupBy('model_type')
                ->selectRaw('model_type, count(*) as count')
                ->pluck('count', 'model_type'),
            'daily_activity' => $query->selectRaw('DATE(created_at) as date, count(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date'),
        ];

        return response()->json($stats);
    }

    /**
     * Get user activity
     */
    public function userActivity(Request $request)
    {
        $userId = $request->input('user_id');
        $dateFrom = $request->input('date_from', now()->subDays(7));
        $dateTo = $request->input('date_to', now());

        if (!$userId) {
            return response()->json(['error' => 'User ID is required'], 400);
        }

        $activity = AuditLog::where('user_id', $userId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'user_id' => $userId,
            'total_actions' => $activity->count(),
            'actions_breakdown' => $activity->groupBy('action')->map->count(),
            'models_affected' => $activity->whereNotNull('model_type')->groupBy('model_type')->map->count(),
            'first_activity' => $activity->last()?->created_at,
            'last_activity' => $activity->first()?->created_at,
            'unique_ips' => $activity->pluck('ip_address')->unique()->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'activity' => AuditLogResource::collection($activity->take(50)), // Last 50 actions
        ]);
    }

    /**
     * Get model history
     */
    public function modelHistory(Request $request)
    {
        $modelType = $request->input('model_type');
        $modelId = $request->input('model_id');

        if (!$modelType || !$modelId) {
            return response()->json(['error' => 'Model type and ID are required'], 400);
        }

        $history = AuditLog::where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'model_type' => $modelType,
            'model_id' => $modelId,
            'total_changes' => $history->count(),
            'history' => AuditLogResource::collection($history),
        ]);
    }

    /**
     * Search audit logs
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        
        if (!$query) {
            return response()->json(['error' => 'Search query is required'], 400);
        }

        $logs = AuditLog::where(function ($q) use ($query) {
            $q->where('action', 'like', "%{$query}%")
              ->orWhere('model_type', 'like', "%{$query}%")
              ->orWhere('ip_address', 'like', "%{$query}%")
              ->orWhereJsonContains('old_values', $query)
              ->orWhereJsonContains('new_values', $query)
              ->orWhereJsonContains('metadata', $query);
        })
        ->with(['user'])
        ->orderBy('created_at', 'desc')
        ->paginate($request->input('per_page', 15));

        return AuditLogResource::collection($logs);
    }
}
