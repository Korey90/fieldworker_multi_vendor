<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NotificationController extends Controller
{
    use AuthorizesRequests;

    protected $tenant;
    protected $tenantId;

    public function __construct()
    {
        // Apply middleware to ensure only tenant admins and global admins can access
        $this->middleware(['auth', 'role:tenant.admin']);
        
        // Initialize tenant in middleware context
        $this->middleware(function ($request, $next) {
            $user = Auth::user();
            
            // Global admins can access any tenant (for support purposes)
            // Tenant admins can only access their own tenant
            if ($user->hasRole('admin')) {
                // For global admin, tenant can be specified via route parameter or current user's tenant
                $this->tenantId = $request->route('tenant_id') ?? $user->tenant_id;
            } else {
                // For tenant admin, always use their own tenant
                $this->tenantId = $user->tenant_id;
            }
            
            // Validate tenant exists and user has access
            $this->tenant = Tenant::find($this->tenantId);
            if (!$this->tenant) {
                abort(404, 'Tenant not found');
            }
            
            // Ensure tenant admin can only access their own tenant
            if (!$user->hasRole('admin') && $user->tenant_id !== $this->tenantId) {
                abort(403, 'Access denied to this tenant');
            }
            
            return $next($request);
        });
    }

    /**
     * Display tenant's notifications with filters and pagination
     */
    public function index(Request $request): InertiaResponse
    {
        // Build query scoped to current tenant
        $query = Notification::with('user')
            ->where('tenant_id', $this->tenantId)
            ->latest();

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by read status
        if ($request->filled('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }

        // Filter by user (within tenant)
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

        // Get filter options (scoped to tenant)
        $types = Notification::where('tenant_id', $this->tenantId)
            ->distinct()
            ->pluck('type')
            ->sort()
            ->values();

        $users = User::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('tenant/notifications/index', [
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
                'total' => Notification::where('tenant_id', $this->tenantId)->count(),
                'unread' => Notification::where('tenant_id', $this->tenantId)->where('is_read', false)->count(),
                'alerts' => Notification::where('tenant_id', $this->tenantId)->where('type', 'alert')->count(),
            ],
            'tenant' => $this->tenant,
        ]);
    }

    /**
     * Show the form for creating a new notification
     */
    public function create(): InertiaResponse
    {
        // Get users within current tenant
        $users = User::where('tenant_id', $this->tenantId)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('tenant/notifications/create', [
            'users' => $users,
            'tenant' => $this->tenant,
        ]);
    }

    /**
     * Store a newly created notification
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,success,warning,alert,safety_alert,maintenance',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Ensure user_id belongs to same tenant if specified
        if ($validated['user_id']) {
            $targetUser = User::find($validated['user_id']);
            if (!$targetUser || $targetUser->tenant_id !== $this->tenantId) {
                return back()->withErrors(['user_id' => 'Selected user does not belong to your organization.']);
            }
        }

        $notification = Notification::create([
            'tenant_id' => $this->tenantId,
            'user_id' => $validated['user_id'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'is_read' => false,
        ]);

        return redirect()->route('tenant.notifications.index')
            ->with('success', 'Notification created successfully.');
    }

    /**
     * Display the specified notification
     */
    public function show(Notification $notification): InertiaResponse
    {
        // Ensure notification belongs to current tenant
        if ($notification->tenant_id !== $this->tenantId) {
            abort(404);
        }

        $notification->load('user');

        return Inertia::render('tenant/notifications/show', [
            'notification' => $notification,
            'tenant' => $this->tenant,
        ]);
    }

    /**
     * Update the specified notification
     */
    public function update(Request $request, Notification $notification)
    {
        // Ensure notification belongs to current tenant
        if ($notification->tenant_id !== $this->tenantId) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,success,warning,alert,safety_alert,maintenance',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Ensure user_id belongs to same tenant if specified
        if ($validated['user_id']) {
            $targetUser = User::find($validated['user_id']);
            if (!$targetUser || $targetUser->tenant_id !== $this->tenantId) {
                return back()->withErrors(['user_id' => 'Selected user does not belong to your organization.']);
            }
        }

        $notification->update($validated);

        return redirect()->route('tenant.notifications.index')
            ->with('success', 'Notification updated successfully.');
    }

    /**
     * Remove the specified notification
     */
    public function destroy(Notification $notification)
    {
        // Ensure notification belongs to current tenant
        if ($notification->tenant_id !== $this->tenantId) {
            abort(404);
        }

        $notification->delete();

        return redirect()->route('tenant.notifications.index')
            ->with('success', 'Notification deleted successfully.');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification)
    {
        // Ensure notification belongs to current tenant
        if ($notification->tenant_id !== $this->tenantId) {
            abort(404);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Mark all tenant notifications as read
     */
    public function markAllAsRead()
    {
        Notification::where('tenant_id', $this->tenantId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }
}