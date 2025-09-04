<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenat;
use App\Models\User;
use App\Models\Worker;
use App\Models\Job;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->get('tenant_id');
        
        $data = [
            'overview' => $this->getOverviewStats($tenantId),
            'recent_jobs' => $this->getRecentJobs($tenantId),
            'recent_notifications' => $this->getRecentNotifications($tenantId),
            'worker_status' => $this->getWorkerStatusStats($tenantId),
            'asset_status' => $this->getAssetStatusStats($tenantId),
        ];

        return response()->json(['data' => $data]);
    }

    /**
     * Get detailed statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->get('tenant_id');
        $period = $request->get('period', '30'); // days
        
        $data = [
            'overview' => $this->getOverviewStats($tenantId),
            'jobs_by_status' => $this->getJobsByStatus($tenantId, $period),
            'jobs_by_date' => $this->getJobsByDate($tenantId, $period),
            'worker_performance' => $this->getWorkerPerformance($tenantId, $period),
            'location_stats' => $this->getLocationStats($tenantId),
            'asset_utilization' => $this->getAssetUtilization($tenantId),
            'form_completion_rates' => $this->getFormCompletionRates($tenantId, $period),
        ];

        return response()->json(['data' => $data]);
    }

    /**
     * Get recent activity
     */
    public function recentActivity(Request $request): JsonResponse
    {
        $tenantId = $request->get('tenant_id');
        $limit = $request->get('limit', 20);
        
        $activities = AuditLog::query()
            ->with(['user', 'tenant'])
            ->when($tenantId, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'model' => class_basename($activity->auditable_type),
                    'model_id' => $activity->auditable_id,
                    'user' => $activity->user ? $activity->user->name : 'System',
                    'created_at' => $activity->created_at,
                    'description' => $this->getActivityDescription($activity),
                ];
            });

        return response()->json(['data' => $activities]);
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats($tenantId = null)
    {
        $query = function ($model) use ($tenantId) {
            return $tenantId ? $model::where('tenat_id', $tenantId) : $model::query();
        };

        return [
            'tenants' => $tenantId ? 1 : Tenat::count(),
            'users' => $query(User::class)->count(),
            'workers' => $query(Worker::class)->count(),
            'active_workers' => $query(Worker::class)->where('status', 'active')->count(),
            'jobs' => $query(Job::class)->count(),
            'active_jobs' => $query(Job::class)->where('status', 'active')->count(),
            'completed_jobs' => $query(Job::class)->where('status', 'completed')->count(),
            'assets' => $query(Asset::class)->count(),
            'active_assets' => $query(Asset::class)->where('status', 'active')->count(),
            'locations' => $query(Location::class)->count(),
            'unread_notifications' => $query(Notification::class)->where('is_read', false)->count(),
        ];
    }

    /**
     * Get recent jobs
     */
    private function getRecentJobs($tenantId = null, $limit = 10)
    {
        return Job::query()
            ->with(['location', 'assignments.worker.user'])
            ->when($tenantId, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'status' => $job->status,
                    'location' => $job->location ? $job->location->name : null,
                    'scheduled_at' => $job->scheduled_at,
                    'workers_count' => $job->assignments->count(),
                    'created_at' => $job->created_at,
                ];
            });
    }

    /**
     * Get recent notifications
     */
    private function getRecentNotifications($tenantId = null, $limit = 10)
    {
        return Notification::query()
            ->with(['user'])
            ->when($tenantId, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'type' => $notification->type,
                    'user' => $notification->user ? $notification->user->name : null,
                    'created_at' => $notification->created_at,
                ];
            });
    }

    /**
     * Get worker status statistics
     */
    private function getWorkerStatusStats($tenantId = null)
    {
        $query = Worker::query();
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        return $query
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn($item) => $item->count);
    }

    /**
     * Get asset status statistics
     */
    private function getAssetStatusStats($tenantId = null)
    {
        $query = Asset::query();
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        return $query
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn($item) => $item->count);
    }

    /**
     * Get jobs by status for period
     */
    private function getJobsByStatus($tenantId = null, $period = 30)
    {
        $query = Job::query();
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        return $query
            ->where('created_at', '>=', now()->subDays($period))
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->map(fn($item) => $item->count);
    }

    /**
     * Get jobs by date for period
     */
    private function getJobsByDate($tenantId = null, $period = 30)
    {
        $query = Job::query();
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        return $query
            ->where('created_at', '>=', now()->subDays($period))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();
    }

    /**
     * Get worker performance statistics
     */
    private function getWorkerPerformance($tenantId = null, $period = 30)
    {
        $query = Worker::query()
            ->with(['jobAssignments' => function ($q) use ($period) {
                $q->where('created_at', '>=', now()->subDays($period));
            }]);
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        return $query
            ->get()
            ->map(function ($worker) {
                $assignments = $worker->jobAssignments;
                return [
                    'worker_id' => $worker->id,
                    'worker_name' => $worker->user ? $worker->user->name : 'Unknown',
                    'total_jobs' => $assignments->count(),
                    'completed_jobs' => $assignments->where('status', 'completed')->count(),
                    'completion_rate' => $assignments->count() > 0 ? 
                        round(($assignments->where('status', 'completed')->count() / $assignments->count()) * 100, 2) : 0,
                ];
            })
            ->sortByDesc('total_jobs')
            ->take(10)
            ->values();
    }

    /**
     * Get location statistics
     */
    private function getLocationStats($tenantId = null)
    {
        $query = Location::query()
            ->with(['workers', 'jobs', 'assets']);
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        return $query
            ->get()
            ->map(function ($location) {
                return [
                    'location_id' => $location->id,
                    'location_name' => $location->name,
                    'workers_count' => $location->workers->count(),
                    'jobs_count' => $location->jobs->count(),
                    'assets_count' => $location->assets->count(),
                ];
            });
    }

    /**
     * Get asset utilization
     */
    private function getAssetUtilization($tenantId = null)
    {
        $query = Asset::query();
        
        if ($tenantId) {
            $query->where('tenat_id', $tenantId);
        }

        $total = $query->count();
        $assigned = $query->whereNotNull('assigned_to')->count();

        return [
            'total_assets' => $total,
            'assigned_assets' => $assigned,
            'available_assets' => $total - $assigned,
            'utilization_rate' => $total > 0 ? round(($assigned / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get form completion rates
     */
    private function getFormCompletionRates($tenantId = null, $period = 30)
    {
        // This would need FormResponse model implementation
        return [
            'total_responses' => 0,
            'completed_responses' => 0,
            'completion_rate' => 0,
        ];
    }

    /**
     * Get activity description
     */
    private function getActivityDescription($activity)
    {
        $model = class_basename($activity->auditable_type);
        $action = $activity->action;
        
        return match($action) {
            'created' => "Created {$model} #{$activity->auditable_id}",
            'updated' => "Updated {$model} #{$activity->auditable_id}",
            'deleted' => "Deleted {$model} #{$activity->auditable_id}",
            default => "{$action} {$model} #{$activity->auditable_id}",
        };
    }
}
