import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    BarChart3,
    Users,
    Briefcase,
    HardDrive,
    Settings,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Infinity,
    Calendar,
    Save,
    RotateCcw,
    Activity,
    ArrowLeft
} from 'lucide-react';

// TypeScript interfaces
interface Tenant {
    id: string;
    name: string;
    status: string;
}

interface Quota {
    id: string;
    tenant_id: string;
    quota_type: string;
    quota_limit: number;
    current_usage: number;
    status: 'active' | 'exceeded' | 'warning' | 'inactive';
    usage_percentage: number;
    is_unlimited: boolean;
    is_exceeded: boolean;
    reset_date: string | null;
    metadata: any;
    created_at: string;
    updated_at: string;
}

interface Recommendation {
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    suggested_limit?: number;
}

interface QuotaTenantProps {
    tenant: Tenant;
    quotas: Quota[];
    recommendations: Recommendation[];
    current_usage: {
        users: number;
        workers: number;
        jobs: number;
        storage: number;
    };
}

export default function QuotaTenant({ tenant, quotas, recommendations, current_usage }: QuotaTenantProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Quota Management', href: '/admin/quotas' },
        { title: tenant.name, href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        quotas: quotas.reduce((acc, quota) => {
            acc[quota.quota_type] = {
                quota_limit: quota.is_unlimited ? 0 : quota.quota_limit,
                is_unlimited: quota.is_unlimited
            };
            return acc;
        }, {} as Record<string, { quota_limit: number; is_unlimited: boolean }>)
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'exceeded': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'exceeded': return <XCircle className="h-4 w-4 text-red-600" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'inactive': return <XCircle className="h-4 w-4 text-gray-600" />;
            default: return <XCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'users': return <Users className="h-6 w-6" />;
            case 'workers': return <Users className="h-6 w-6" />;
            case 'jobs_per_month': return <Briefcase className="h-6 w-6" />;
            case 'assets': return <Settings className="h-6 w-6" />;
            case 'storage_mb': return <HardDrive className="h-6 w-6" />;
            default: return <Settings className="h-6 w-6" />;
        }
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatQuotaType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'info': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/quotas/tenant/${tenant.id}`);
    };

    const handleSyncQuota = (quotaType: string) => {
        put(`/admin/quotas/tenant/${tenant.id}/sync/${quotaType}`, {
            preserveScroll: true,
        });
    };

    const handleResetQuota = (quotaId: string) => {
        put(`/admin/quotas/${quotaId}/reset`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quota Management - ${tenant.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/quotas">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Quotas
                            </Button>
                        </Link>
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                        <div>
                            <h1 className="text-3xl font-bold">{tenant.name} - Quota Management</h1>
                            <p className="text-gray-500">Configure and monitor resource quotas for this tenant</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Current Usage Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Users</p>
                                    <p className="text-2xl font-bold">{current_usage.users}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Workers</p>
                                    <p className="text-2xl font-bold">{current_usage.workers}</p>
                                </div>
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Jobs</p>
                                    <p className="text-2xl font-bold">{current_usage.jobs}</p>
                                </div>
                                <Briefcase className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Storage (MB)</p>
                                    <p className="text-2xl font-bold">{current_usage.storage}</p>
                                </div>
                                <HardDrive className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>Recommendations</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            {rec.severity === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                                            {rec.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                                            {rec.severity === 'info' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getSeverityColor(rec.severity)}>
                                                    {rec.severity}
                                                </Badge>
                                                <span className="text-sm font-medium">{formatQuotaType(rec.type)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                                            {rec.suggested_limit && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Suggested limit: {rec.suggested_limit}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quota Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quota Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {quotas.map((quota) => (
                                <div key={quota.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {getTypeIcon(quota.quota_type)}
                                            <div>
                                                <h3 className="text-lg font-semibold">{formatQuotaType(quota.quota_type)} Quota</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Current usage: {quota.current_usage} / {quota.is_unlimited ? '∞' : quota.quota_limit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(quota.status)}
                                            <Badge className={getStatusColor(quota.status)}>
                                                {quota.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Usage Bar */}
                                    {!quota.is_unlimited && (
                                        <div className="mb-4">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className={`h-3 rounded-full ${getUsageColor(quota.usage_percentage)}`}
                                                    style={{ width: `${Math.min(quota.usage_percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {quota.usage_percentage}% used
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`unlimited-${quota.quota_type}`}
                                                checked={data.quotas[quota.quota_type]?.is_unlimited || false}
                                                onChange={(e) => setData('quotas', {
                                                    ...data.quotas,
                                                    [quota.quota_type]: {
                                                        ...data.quotas[quota.quota_type],
                                                        is_unlimited: e.target.checked
                                                    }
                                                })}
                                                className="rounded"
                                            />
                                            <Label htmlFor={`unlimited-${quota.quota_type}`} className="text-sm">
                                                Unlimited
                                            </Label>
                                        </div>

                                        {!data.quotas[quota.quota_type]?.is_unlimited && (
                                            <div>
                                                <Label htmlFor={`limit-${quota.quota_type}`}>Quota Limit</Label>
                                                <Input
                                                    id={`limit-${quota.quota_type}`}
                                                    type="number"
                                                    min="0"
                                                    value={data.quotas[quota.quota_type]?.quota_limit || 0}
                                                    onChange={(e) => setData('quotas', {
                                                        ...data.quotas,
                                                        [quota.quota_type]: {
                                                            ...data.quotas[quota.quota_type],
                                                            quota_limit: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                />
                                                {errors[`quotas.${quota.quota_type}.quota_limit`] && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        {errors[`quotas.${quota.quota_type}.quota_limit`]}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSyncQuota(quota.quota_type)}
                                                className="flex-1"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Sync
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResetQuota(quota.id)}
                                                className="flex-1"
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset
                                            </Button>
                                        </div>
                                    </div>

                                    {quota.reset_date && (
                                        <div className="mt-3 flex items-center space-x-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span>Next reset: {quota.reset_date}</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center justify-end space-x-4">
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
