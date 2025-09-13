import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WorkerPerformanceChart } from '@/components/dashboard/worker-performance-chart';
import { JobTimelineChart } from '@/components/dashboard/job-timeline-chart';
import { AssetUtilizationChart } from '@/components/dashboard/asset-utilization-chart';
import { LocationMap } from '@/components/dashboard/location-map';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { SystemStatus } from '@/components/dashboard/system-status';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, Briefcase, Settings, Activity, AlertTriangle } from 'lucide-react';

interface DashboardProps {
    stats: {
        activeWorkers: number;
        activeJobs: number;
        completedToday: number;
        alerts: number;
    };
    recentActivity: Array<{
        id: string;
        type: 'job_created' | 'job_completed' | 'job_active' | 'job_pending' | 'job_assigned' | 'job_cancelled' | 'worker_assigned' | 'alert' | 'info' | 'maintenance';
        title: string;
        description: string;
        timestamp: string;
        user?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
    }>;
    user: {
        name: string;
        email: string;
        tenant_name: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ stats, recentActivity, user }: DashboardProps) {
    // Convert timestamp strings to Date objects for the activities
    const activitiesWithDates = recentActivity.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
    }));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fieldworker Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome to your Fieldworker control center, {user.name}. Monitor operations for {user.tenant_name}.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Active Workers"
                        value={stats.activeWorkers}
                        description="Currently in field"
                        icon={Users}
                        trend={{ value: 8, isPositive: true }}
                        color="blue"
                    />
                    <StatsCard
                        title="Active Jobs"
                        value={stats.activeJobs}
                        description="In progress"
                        icon={Briefcase}
                        trend={{ value: 12, isPositive: true }}
                        color="green"
                    />
                    <StatsCard
                        title="Completed Today"
                        value={stats.completedToday}
                        description="Tasks finished"
                        icon={Activity}
                        trend={{ value: 5, isPositive: false }}
                        color="purple"
                    />
                    <StatsCard
                        title="Alerts"
                        value={stats.alerts}
                        description="Require attention"
                        icon={AlertTriangle}
                        color="red"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Recent Activity */}
                        <RecentActivity activities={activitiesWithDates} />
                        
                        {/* Charts Section */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <WorkerPerformanceChart />
                            <JobTimelineChart />
                            <AssetUtilizationChart />
                        </div>

                        {/* Location Map Section */}
                        <LocationMap />
                    </div>
                    
                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <QuickActions />
                        <AlertsPanel />
                        <SystemStatus />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
