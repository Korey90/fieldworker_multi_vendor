<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Notification;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $tenantId = $user->tenant_id;

        // Get dashboard statistics
        $stats = [
            'activeWorkers' => Worker::where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->count(),
            'activeJobs' => Job::where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->count(),
            'completedToday' => Job::where('tenant_id', $tenantId)
                ->where('status', 'completed')
                ->whereDate('completed_at', today())
                ->count(),
            'alerts' => Notification::where('tenant_id', $tenantId)
                ->where('type', 'alert')
                ->where('is_read', false)
                ->count(),
        ];

        // Get recent activity
        $recentActivity = collect()
            ->merge(
                // Recent jobs
                Job::where('tenant_id', $tenantId)
                    ->with(['location:id,name'])
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
                        'priority' => 'medium',
                    ])
            )
            ->merge(
                // Recent notifications
                Notification::where('tenant_id', $tenantId)
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
                        'priority' => $notification->type === 'alert' ? 'high' : 'medium',
                    ])
            )
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->toArray();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'tenant_name' => $user->tenant?->name ?? 'Unknown Tenant',
            ],
        ]);
    }
}
