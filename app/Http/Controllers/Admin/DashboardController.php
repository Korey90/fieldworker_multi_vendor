<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Notification;
use App\Models\Worker;
use App\Models\TenantQuota;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{

    public function __construct()
    {
        // Apply middleware to ensure only authenticated users with admin access
        $this->middleware(['auth', 'admin']);

    }
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        // Admin dashboard - global overview of all tenants
        $stats = [
            'totalTenants' => \App\Models\Tenant::count(),
            'activeWorkers' => Worker::where('status', 'active')->count(),
            'activeJobs' => Job::where('status', 'active')->count(),
            'completedToday' => Job::where('status', 'completed')
                ->whereDate('completed_at', today())
                ->count(),
            'alerts' => Notification::where('type', 'alert')
                ->where('is_read', false)
                ->count(),
        ];

        // Get recent activity from all tenants
        $recentActivity = collect()
            ->merge(
                // Recent jobs from all tenants
                Job::with(['location:id,name', 'tenant:id,name'])
                    ->orderBy('updated_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(fn($job) => [
                        'id' => $job->id,
                        'type' => 'job_' . $job->status,
                        'title' => $job->title,
                        'description' => $job->description,
                        'timestamp' => $job->updated_at->toISOString(),
                        'user' => 'System',
                        'tenant' => $job->tenant?->name ?? 'Unknown',
                        'priority' => 'medium',
                    ])
            )
            ->merge(
                // Recent notifications from all tenants
                Notification::with(['tenant:id,name'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(fn($notification) => [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'description' => $notification->message,
                        'timestamp' => $notification->created_at->toISOString(),
                        'user' => 'System',
                        'tenant' => $notification->tenant?->name ?? 'Global',
                        'priority' => $notification->type === 'alert' ? 'high' : 'medium',
                    ])
            )
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->toArray();

        // Get quota summary for dashboard widget
        $quotaSummary = TenantQuota::with(['tenant:id,name'])
            ->where(function ($query) {
                $query->where('status', 'exceeded')
                      ->orWhere('status', 'warning')
                      ->orWhereRaw('current_usage >= (quota_limit * 0.8)'); // 80% threshold
            })
            ->orderBy('usage_percentage', 'desc')
            ->limit(10)
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
                    'tenant_name' => $quota->tenant?->name ?? 'Unknown',
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'quotaSummary' => $quotaSummary,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'tenant_name' => 'Global Admin',
                'is_global_admin' => true,
                'roles' => $user->roles->pluck('slug')->toArray(),
            ],
            'tenants' => \App\Models\Tenant::select('id', 'name', 'data->status as status')
                ->withCount(['users', 'jobs', 'workers'])
                ->get(),
        ]);
    }
}
