import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Building2, 
    Users, 
    Briefcase, 
    HardHat, 
    Server, 
    HardDrive,
    Zap,
    FileText,
    Bell,
    Paperclip,
    PenTool,
    AlertTriangle,
    CheckCircle,
    Clock,
    Edit,
    RefreshCw,
    TrendingUp,
    Activity
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';

interface TenantData {
    id: number;
    name: string;
    sector: string;
    status: 'active' | 'suspended' | 'inactive';
}

interface QuotaData {
    id: string;
    quota_type: string;
    quota_limit: number;
    current_usage: number;
    created_at: string;
    updated_at: string;
}

interface TenantQuotasPageProps {
    tenant: TenantData;
    quotas: QuotaData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Quotas',
        href: '#',
    },
    {
        title: 'Tenants',
        href: '/quotas/tenants',
    },
];

// Quota type configurations
const quotaTypeConfig = {
    users: {
        label: 'Users',
        icon: Users,
        color: 'blue',
        description: 'Total number of users',
        unit: 'users'
    },
    workers: {
        label: 'Workers',
        icon: HardHat,
        color: 'green',
        description: 'Active workers',
        unit: 'workers'
    },
    jobs: {
        label: 'Jobs',
        icon: Briefcase,
        color: 'orange',
        description: 'Monthly job limit',
        unit: 'jobs'
    },
    assets: {
        label: 'Assets',
        icon: Server,
        color: 'purple',
        description: 'Total assets',
        unit: 'assets'
    },
    storage: {
        label: 'Storage',
        icon: HardDrive,
        color: 'indigo',
        description: 'Storage space',
        unit: 'MB'
    },
    api_calls: {
        label: 'API Calls',
        icon: Zap,
        color: 'yellow',
        description: 'Monthly API requests',
        unit: 'calls'
    },
    forms: {
        label: 'Forms',
        icon: FileText,
        color: 'pink',
        description: 'Total forms',
        unit: 'forms'
    },
    notifications: {
        label: 'Notifications',
        icon: Bell,
        color: 'red',
        description: 'Monthly notifications',
        unit: 'notifications'
    },
    attachments: {
        label: 'Attachments',
        icon: Paperclip,
        color: 'gray',
        description: 'File attachments',
        unit: 'files'
    },
    signatures: {
        label: 'Signatures',
        icon: PenTool,
        color: 'teal',
        description: 'Digital signatures',
        unit: 'signatures'
    }
};

export default function TenantQuotasPage({ tenant, quotas }: TenantQuotasPageProps) {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        router.reload({ only: ['quotas'] });
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getUsagePercentage = (current: number, limit: number) => {
        if (limit <= 0) return 0;
        return Math.min((current / limit) * 100, 100);
    };

    const getUsageStatus = (current: number, limit: number) => {
        const percentage = getUsagePercentage(current, limit);
        if (limit < 0) return 'unlimited';
        if (percentage >= 100) return 'exceeded';
        if (percentage >= 90) return 'critical';
        if (percentage >= 75) return 'warning';
        return 'healthy';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'unlimited':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'healthy':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'warning':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'critical':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'exceeded':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'unlimited':
                return <TrendingUp className="h-4 w-4" />;
            case 'healthy':
                return <CheckCircle className="h-4 w-4" />;
            case 'warning':
            case 'critical':
                return <AlertTriangle className="h-4 w-4" />;
            case 'exceeded':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const formatValue = (value: number, type: string) => {
        const config = quotaTypeConfig[type as keyof typeof quotaTypeConfig];
        if (!config) return value.toString();

        if (type === 'storage') {
            if (value >= 1024) {
                return `${(value / 1024).toFixed(1)} GB`;
            }
            return `${value} MB`;
        }

        return value.toLocaleString();
    };

    const formatLimit = (limit: number, type: string) => {
        if (limit < 0) return 'Unlimited';
        return formatValue(limit, type);
    };

    const getTenantStatusBadge = (status: string) => {
        const colors = {
            active: 'bg-green-50 text-green-700 border-green-200',
            suspended: 'bg-red-50 text-red-700 border-red-200',
            inactive: 'bg-gray-50 text-gray-700 border-gray-200'
        };
        return colors[status as keyof typeof colors] || colors.inactive;
    };

    // Calculate overall statistics
    const totalQuotas = quotas.length;
    const healthyQuotas = quotas.filter(q => getUsageStatus(q.current_usage, q.quota_limit) === 'healthy').length;
    const warningQuotas = quotas.filter(q => {
        const status = getUsageStatus(q.current_usage, q.quota_limit);
        return status === 'warning' || status === 'critical';
    }).length;
    const exceededQuotas = quotas.filter(q => getUsageStatus(q.current_usage, q.quota_limit) === 'exceeded').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quotas - ${tenant.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.visit('/quotas/tenants')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tenants
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Quotas for {tenant.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Monitor and manage resource quotas
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={getTenantStatusBadge(tenant.status)}>
                            {tenant.status}
                        </Badge>
                        <Button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Quotas
                        </Button>
                    </div>
                </div>

                {/* Tenant Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{tenant.name}</CardTitle>
                                <CardDescription>
                                    Sector: {tenant.sector} • Status: {tenant.status}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Overview Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Quotas</p>
                                    <p className="text-2xl font-bold">{totalQuotas}</p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Healthy</p>
                                    <p className="text-2xl font-bold text-green-600">{healthyQuotas}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Warning</p>
                                    <p className="text-2xl font-bold text-yellow-600">{warningQuotas}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Exceeded</p>
                                    <p className="text-2xl font-bold text-red-600">{exceededQuotas}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quotas Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quotas.map((quota) => {
                        const config = quotaTypeConfig[quota.quota_type as keyof typeof quotaTypeConfig];
                        const status = getUsageStatus(quota.current_usage, quota.quota_limit);
                        const percentage = getUsagePercentage(quota.current_usage, quota.quota_limit);
                        const IconComponent = config?.icon || Activity;

                        return (
                            <Card key={quota.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-${config?.color || 'gray'}-100`}>
                                                <IconComponent className={`h-5 w-5 text-${config?.color || 'gray'}-600`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {config?.label || quota.quota_type}
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    {config?.description || `${quota.quota_type} quota`}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
                                            {getStatusIcon(status)}
                                            {status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Usage Display */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Usage</span>
                                            <span className="font-medium">
                                                {formatValue(quota.current_usage, quota.quota_type)} / {formatLimit(quota.quota_limit, quota.quota_type)}
                                            </span>
                                        </div>
                                        {quota.quota_limit > 0 && (
                                            <Progress 
                                                value={percentage} 
                                                className="h-2"
                                                // @ts-ignore - custom color based on status
                                                indicatorClassName={
                                                    status === 'exceeded' ? 'bg-red-500' :
                                                    status === 'critical' ? 'bg-orange-500' :
                                                    status === 'warning' ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }
                                            />
                                        )}
                                        {quota.quota_limit > 0 && (
                                            <div className="text-xs text-muted-foreground text-right">
                                                {percentage.toFixed(1)}% used
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Timestamps */}
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Created:</span>
                                            <span>{new Date(quota.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Updated:</span>
                                            <span>{new Date(quota.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {quotas.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No quotas configured</h3>
                            <p className="text-muted-foreground">
                                This tenant doesn't have any resource quotas set up yet.
                            </p>
                            <Button className="mt-4">
                                <Edit className="mr-2 h-4 w-4" />
                                Configure Quotas
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}