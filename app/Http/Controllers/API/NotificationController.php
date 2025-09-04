<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->with(['user', 'tenant'])
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->is_read !== null, function ($query) use ($request) {
                $query->where('is_read', $request->boolean('is_read'));
            })
            ->when($request->priority, function ($query, $priority) {
                $priorities = ['emergency' => 1, 'urgent' => 2, 'warning' => 3, 'info' => 4, 'low' => 5];
                $types = array_keys(array_filter($priorities, function($p) use ($priority) {
                    return $p <= $priority;
                }));
                $query->whereIn('type', $types);
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => NotificationResource::collection($notifications->items()),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $notification = Notification::with(['user', 'tenant'])->findOrFail($id);

        // Mark as read when viewed
        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'data' => new NotificationResource($notification)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(string $id): JsonResponse
    {
        $notification = Notification::findOrFail($id);

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => new NotificationResource($notification)
        ]);
    }

    /**
     * Mark all notifications as read for current user
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $updatedCount = Notification::where('user_id', $validated['user_id'])
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => "Marked {$updatedCount} notifications as read"
        ]);
    }

    /**
     * Get notification statistics for user
     */
    public function stats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $validated['user_id'];

        $stats = [
            'total' => Notification::where('user_id', $userId)->count(),
            'unread' => Notification::where('user_id', $userId)->where('is_read', false)->count(),
            'read' => Notification::where('user_id', $userId)->where('is_read', true)->count(),
            'by_type' => [
                'emergency' => Notification::where('user_id', $userId)->where('type', 'emergency')->count(),
                'urgent' => Notification::where('user_id', $userId)->where('type', 'urgent')->count(),
                'warning' => Notification::where('user_id', $userId)->where('type', 'warning')->count(),
                'info' => Notification::where('user_id', $userId)->where('type', 'info')->count(),
            ],
            'recent' => Notification::where('user_id', $userId)
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $count = Notification::where('user_id', $validated['user_id'])
            ->where('is_read', false)
            ->count();

        return response()->json([
            'unread_count' => $count
        ]);
    }

    /**
     * Create a new notification (for system use)
     */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string|in:emergency,urgent,warning,info',
            'user_id' => 'required|exists:users,id',
            'tenat_id' => 'required|exists:tenats,id',
            'data' => 'nullable|array',
        ]);

        $notification = Notification::create($validated);
        $notification->load(['user', 'tenant']);

        return response()->json([
            'message' => 'Notification created successfully',
            'data' => new NotificationResource($notification)
        ], 201);
    }

    /**
     * Bulk delete notifications
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id',
        ]);

        $deletedCount = Notification::whereIn('id', $validated['notification_ids'])->delete();

        return response()->json([
            'message' => "Deleted {$deletedCount} notifications"
        ]);
    }
}
