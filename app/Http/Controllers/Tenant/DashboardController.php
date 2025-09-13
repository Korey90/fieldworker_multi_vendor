<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Job;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display the tenant dashboard with key metrics and recent activity
     */
    public function index(): InertiaResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id;

        // Get notification statistics
        $notificationStats = [
            'total' => Notification::where('tenant_id', $tenantId)->count(),
            'unread' => Notification::where('tenant_id', $tenantId)->where('is_read', false)->count(),
            'alerts' => Notification::where('tenant_id', $tenantId)->whereIn('type', ['alert', 'safety_alert'])->count(),
            'recent' => Notification::where('tenant_id', $tenantId)
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ];

        // Get recent notifications (last 5)
        $recentNotifications = Notification::where('tenant_id', $tenantId)
            ->with('user')
            ->latest()
            ->limit(5)
            ->get();

        // Get worker statistics
        $workerStats = [
            'total' => User::where('tenant_id', $tenantId)->whereHas('roles', function($q) {
                $q->where('slug', 'worker');
            })->count(),
            'active' => User::where('tenant_id', $tenantId)
                ->whereHas('roles', function($q) {
                    $q->where('slug', 'worker');
                })
                ->where('is_active', true)
                ->count(),
        ];

        // Get job statistics (if jobs module exists)
        $jobStats = [
            'total' => Job::where('tenant_id', $tenantId)->count(),
            'active' => Job::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            'completed' => Job::where('tenant_id', $tenantId)->where('status', 'completed')->count(),
            'pending' => Job::where('tenant_id', $tenantId)->where('status', 'pending')->count(),
        ];

        // Quick actions based on role
        $quickActions = $this->getQuickActions($user);

        return Inertia::render('tenant/dashboard', [
            'stats' => [
                'notifications' => $notificationStats,
                'workers' => $workerStats,
                'jobs' => $jobStats,
            ],
            'recentNotifications' => $recentNotifications,
            'quickActions' => $quickActions,
            'tenant' => $user->tenant,
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