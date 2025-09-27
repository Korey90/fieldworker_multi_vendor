<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Job;
use App\Models\User;
use App\Models\Worker;
use App\Models\TenantQuota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{

    public function __construct()
    {
        // Apply middleware to ensure only authenticated users with tenant access
        $this->middleware(['auth', 'role:admin,tenant']);

        $this->middleware(function ($request, $next) {
            $this->tenantId = Auth::user()->tenant_id;
            return $next($request);
        });
    }
    /**
     * Display the tenant dashboard with key metrics and recent activity
     */
    public function index(): InertiaResponse
    {

        // Get notification statistics
        $notificationStats = [
            'total' => Notification::where('tenant_id', $this->tenantId)->count(),
            'unread' => Notification::where('tenant_id', $this->tenantId)->where('is_read', false)->count(),
            'alerts' => Notification::where('tenant_id', $this->tenantId)->whereIn('type', ['alert', 'safety_alert'])->count(),
            'recent' => Notification::where('tenant_id', $this->tenantId)
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        // Get recent notifications (last 5)
        $recentNotifications = Notification::where('tenant_id', $this->tenantId)
            ->with('user')
            ->latest()
            ->limit(5)
            ->get();

        // Get worker statistics
        $workerStats = [
            'total' => Worker::where('tenant_id', $this->tenantId)->count(),
            'active' => Worker::where('tenant_id', $this->tenantId)
                ->where('status', 'active') //active inactive itp
                ->count(),
        ];

        // Get job statistics (if jobs module exists)
        $jobStats = [
            'total' => Job::where('tenant_id', $this->tenantId)->count(),
            'active' => Job::where('tenant_id', $this->tenantId)->where('status', 'active')->count(),
            'completed' => Job::where('tenant_id', $this->tenantId)->where('status', 'completed')->count(),
            'pending' => Job::where('tenant_id', $this->tenantId)->where('status', 'pending')->count(),
        ];

        // Quick actions based on role
        $quickActions = $this->getQuickActions(auth()->user());

        // Get tenant quota information
        $tenantQuotas = TenantQuota::where('tenant_id', $this->tenantId)
            ->get()
            ->map(function ($quota) {
                return [
                    'id' => $quota->id,
                    'quota_type' => $quota->quota_type,
                    'quota_limit' => $quota->quota_limit,
                    'current_usage' => $quota->current_usage,
                    'usage_percentage' => $quota->getUsagePercentage(),
                    'status' => $quota->status,
                    'is_unlimited' => $quota->isUnlimited(),
                    'is_exceeded' => $quota->isExceeded(),
                ];
            });

        return Inertia::render('tenant/dashboard', [
            'stats' => [
                'notifications' => $notificationStats,
                'workers' => $workerStats,
                'jobs' => $jobStats,
            ],
            'recentNotifications' => $recentNotifications,
            'quickActions' => $quickActions,
            'tenant' => auth()->user()->tenant,
            'quotas' => $tenantQuotas,
        ]);
    }

    /**
     * Get quick actions based on user role
     */
    private function getQuickActions($user): array
    {
        $actions = [
            [
                'title' => 'Send Notification',
                'description' => 'Send a notification to your team',
                'icon' => 'Bell',
                'href' => route('tenant.notifications.create'),
                'color' => 'blue',
            ],
            [
                'title' => 'View All Notifications',
                'description' => 'Manage your organization notifications',
                'icon' => 'List',
                'href' => route('tenant.notifications.index'),
                'color' => 'gray',
            ],
        ];

        // Add role-specific actions
        if ($user->hasRole('admin')) {
            $actions[] = [
                'title' => 'Mark All as Read',
                'description' => 'Mark all notifications as read',
                'icon' => 'CheckCircle',
                'action' => 'markAllAsRead',
                'color' => 'green',
            ];
        }

        return $actions;
    }
}