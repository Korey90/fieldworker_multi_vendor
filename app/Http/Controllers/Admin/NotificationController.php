<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request): Response
    {

        $query = Notification::with(['user:id,name,email']);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by read status
        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search in title and message
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // Sort by created_at desc by default
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $notifications = $query->paginate(15)->withQueryString();

        // Get filter options
        $types = Notification::distinct()
            ->pluck('type')
            ->sort()
            ->values();

        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('notifications/index', [
            'notificationData' => $notifications,
            'filters' => [
                'type' => $request->filled('type') ? $request->type : null,
                'is_read' => $request->filled('is_read') ? $request->boolean('is_read') : null,
                'user_id' => $request->filled('user_id') ? $request->user_id : null,
                'search' => $request->filled('search') ? $request->search : null,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
            'types' => $types,
            'users' => $users,
            'stats' => [
                'total' => Notification::count(),
                'unread' => Notification::where('is_read', false)->count(),
                'alerts' => Notification::where('type', 'alert')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new notification.
     */
    public function create(): Response
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $types = [
            'info' => 'Information',
            'success' => 'Success',
            'warning' => 'Warning',
            'alert' => 'Alert',
            'safety_alert' => 'Safety Alert',
            'maintenance' => 'Maintenance',
        ];

        return Inertia::render('notifications/create', [
            'users' => $users,
            'types' => $types,
        ]);
    }

    /**
     * Store a newly created notification.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('tenant_id', $tenantId)
            ],
            'type' => ['required', 'string', Rule::in(['info', 'success', 'warning', 'alert', 'safety_alert', 'maintenance'])],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'data' => ['nullable', 'array'],
        ]);

        $notification = Notification::create([
            ...$validated,
            'tenant_id' => $tenantId,
        ]);

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Notification created successfully.');
    }

    /**
     * Display the specified notification.
     */
    public function show(Notification $notification): Response
    {
        $user = Auth::user();
        
        // Ensure notification belongs to user's tenant
        if ($notification->tenant_id !== $user->tenant_id) {
            abort(404);
        }

        $notification->load(['user:id,name,email']);

        return Inertia::render('notifications/show', [
            'notification' => $notification,
        ]);
    }

    /**
     * Show the form for editing the specified notification.
     */
    public function edit(Notification $notification): Response
    {
        $user = Auth::user();
        
        // Ensure notification belongs to user's tenant
        if ($notification->tenant_id !== $user->tenant_id) {
            abort(404);
        }

        $tenantId = $user->tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $types = [
            'info' => 'Information',
            'success' => 'Success',
            'warning' => 'Warning',
            'alert' => 'Alert',
            'safety_alert' => 'Safety Alert',
            'maintenance' => 'Maintenance',
        ];

        return Inertia::render('notifications/edit', [
            'notification' => $notification,
            'users' => $users,
            'types' => $types,
        ]);
    }

    /**
     * Update the specified notification.
     */
    public function update(Request $request, Notification $notification)
    {
        $user = Auth::user();
        
        // Ensure notification belongs to user's tenant
        if ($notification->tenant_id !== $user->tenant_id) {
            abort(404);
        }

        $tenantId = $user->tenant_id;

        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('tenant_id', $tenantId)
            ],
            'type' => ['required', 'string', Rule::in(['info', 'success', 'warning', 'alert', 'safety_alert', 'maintenance'])],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'data' => ['nullable', 'array'],
            'is_read' => ['boolean'],
        ]);

        $notification->update($validated);

        return redirect()->route('admin.notifications.show', $notification)
            ->with('success', 'Notification updated successfully.');
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(Notification $notification)
    {
        $user = Auth::user();
        
        // Ensure notification belongs to user's tenant
        if ($notification->tenant_id !== $user->tenant_id) {
            abort(404);
        }

        $notification->delete();

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Notification deleted successfully.');
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        $user = Auth::user();
        
        // Ensure notification belongs to user's tenant
        if ($notification->tenant_id !== $user->tenant_id) {
            abort(404);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark notification as unread.
     */
    public function markAsUnread(Notification $notification)
    {
        $user = Auth::user();
        
        // Ensure notification belongs to user's tenant
        if ($notification->tenant_id !== $user->tenant_id) {
            abort(404);
        }

        $notification->update([
            'is_read' => false,
            'read_at' => null,
        ]);

        return back()->with('success', 'Notification marked as unread.');
    }

    /**
     * Bulk delete notifications.
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:notifications,id'],
        ]);

        $deletedCount = Notification::where('tenant_id', $tenantId)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return back()->with('success', "Deleted {$deletedCount} notifications.");
    }
}