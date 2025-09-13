import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bell, Users, Briefcase, Activity, AlertTriangle, Eye, CheckCircle } from 'lucide-react';

interface TenantDashboardProps {
    stats: {
        notifications: {
            total: number;
            unread: number;
            alerts: number;
            recent: number;
        };
        workers: {
            total: number;
            active: number;
            inactive: number;
        };
        jobs: {
            total: number;
            active: number;
            completed: number;
            pending: number;
        };
    };
    recentNotifications: Array<{
        id: number;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'alert' | 'safety_alert' | 'system';
        is_read: boolean;
        created_at: string;
        user?: {
            name: string;
            email: string;
        };
    }>;
    quickActions: Array<{
        title: string;
        description: string;
        icon: string;
        href?: string;
        action?: string;
        color: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';
    }>;
    tenant: {
        id: number;
        name: string;
        slug: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tenant Dashboard',
        href: '/tenant/dashboard',
    },
];

export default function TenantDashboard({ stats, recentNotifications, quickActions, tenant }: TenantDashboardProps) {
    // Convert notifications to activity format for reusability
    const recentActivity = recentNotifications.map(notification => ({
        id: notification.id.toString(),
        type: notification.type as 'info' | 'alert' | 'maintenance',
        title: notification.title,
        description: notification.message,
        timestamp: notification.created_at,
        user: notification.user?.name,
        priority: notification.type === 'safety_alert' ? 'critical' as const :
                 notification.type === 'alert' ? 'high' as const :
                 notification.type === 'warning' ? 'medium' as const : 
                 'low' as const,
    }));

    // Convert quick actions to expected format
    const dashboardActions = quickActions.map(action => ({
        title: action.title,
        description: action.description,
        icon: action.icon === 'Bell' ? Bell :
              action.icon === 'Eye' ? Eye :
              action.icon === 'CheckCircle' ? CheckCircle :
              action.icon === 'List' ? Activity : Bell,
        href: action.href,
        onClick: action.action ? () => {
            if (action.action === 'markAllAsRead') {
                // Handle mark all as read action
                window.location.href = '/tenant/notifications/mark-all-read';
            }
        } : undefined,
        variant: action.color === 'blue' ? 'default' as const :
                action.color === 'green' ? 'secondary' as const :
                action.color === 'red' ? 'destructive' as const :
                'outline' as const,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tenant.name} - Dashboard`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage operations for {tenant.name}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Notifications"
                        value={stats.notifications.total}
                        description="All notifications"
                        icon={Bell}
                        trend={{ value: stats.notifications.recent, isPositive: true }}
                        color="blue"
                    />
                    <StatsCard
                        title="Unread Notifications"
                        value={stats.notifications.unread}
                        description="Require attention"
                        icon={AlertTriangle}
                        color="orange"
                    />
                    <StatsCard
                        title="Active Workers"
                        value={stats.workers.active}
                        description={`of ${stats.workers.total} total`}
                        icon={Users}
                        trend={{ 
                            value: Math.round((stats.workers.active / stats.workers.total) * 100), 
                            isPositive: true 
                        }}
                        color="green"
                    />
                    <StatsCard
                        title="Active Jobs"
                        value={stats.jobs.active}
                        description={`${stats.jobs.pending} pending`}
                        icon={Briefcase}
                        trend={{ 
                            value: stats.jobs.completed, 
                            isPositive: true 
                        }}
                        color="purple"
                    />
                </div>

                {/* Alert Cards for High Priority Items */}
                {stats.notifications.alerts > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <h3 className="font-semibold text-red-800">
                                {stats.notifications.alerts} Alert{stats.notifications.alerts > 1 ? 's' : ''} Require Immediate Attention
                            </h3>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                            Please review safety alerts and urgent notifications in the notifications panel.
                        </p>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Recent Activity - spans 2 columns */}
                    <div className="lg:col-span-2">
                        <RecentActivity 
                            activities={recentActivity}
                        />
                    </div>

                    {/* Quick Actions - spans 1 column */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {dashboardActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant}
                                        className="w-full justify-start"
                                        asChild={!!action.href}
                                        onClick={action.onClick}
                                    >
                                        {action.href ? (
                                            <a href={action.href} className="flex items-center gap-2">
                                                <action.icon className="h-4 w-4" />
                                                <div className="text-left">
                                                    <div className="font-medium">{action.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {action.description}
                                                    </div>
                                                </div>
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <action.icon className="h-4 w-4" />
                                                <div className="text-left">
                                                    <div className="font-medium">{action.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {action.description}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Stats - spans 1 column */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Workforce Overview</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Workers</span>
                                    <span className="font-medium">{stats.workers.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Active Now</span>
                                    <span className="font-medium text-green-600">{stats.workers.active}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Inactive</span>
                                    <span className="font-medium text-gray-600">{stats.workers.inactive}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Job Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Jobs</span>
                                    <span className="font-medium">{stats.jobs.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Active</span>
                                    <span className="font-medium text-blue-600">{stats.jobs.active}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Pending</span>
                                    <span className="font-medium text-yellow-600">{stats.jobs.pending}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Completed</span>
                                    <span className="font-medium text-green-600">{stats.jobs.completed}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}