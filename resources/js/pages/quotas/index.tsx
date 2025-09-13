import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    BarChart3,
    Search,
    Plus,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Users,
    Briefcase,
    HardDrive,
    Settings,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Infinity,
    Calendar,
    ChevronDown,
    ChevronRight,
    Grid3X3,
    List
} from 'lucide-react';

// TypeScript interfaces
interface Tenant {
    id: string;
    name: string;
}

interface Quota {
    id: string;
    tenant_id: string;
    tenant_name: string;
    quota_type: string;
    quota_limit: number;
    current_usage: number;
    status: 'active' | 'exceeded' | 'warning' | 'inactive';
    usage_percentage: number;
    is_unlimited: boolean;
    is_exceeded: boolean;
    reset_date: string | null;
    metadata: any;
    updated_at: string;
}

interface QuotasIndexProps {
    quotas: Quota[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        tenant?: string;
        type?: string;
        status?: string;
    };
    tenants: Tenant[];
    quota_types: string[];
    stats: {
        total_quotas: number;
        exceeded_quotas: number;
        warning_quotas: number;
        unlimited_quotas: number;
    };
}

export default function QuotasIndex({ quotas, pagination, filters, tenants, quota_types, stats }: QuotasIndexProps) {
    const [tenantFilter, setTenantFilter] = useState(filters.tenant || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Quota Management', href: '' },
    ];

    // Group quotas by tenant
    const groupedQuotas = quotas.reduce((groups, quota) => {
        const tenantId = quota.tenant_id;
        if (!groups[tenantId]) {
            groups[tenantId] = {
                tenant_name: quota.tenant_name,
                tenant_id: tenantId,
                quotas: []
            };
        }
        groups[tenantId].quotas.push(quota);
        return groups;
    }, {} as Record<string, { tenant_name: string; tenant_id: string; quotas: Quota[] }>);

    const tenantGroups = Object.values(groupedQuotas);

    const toggleTenant = (tenantId: string) => {
        const newExpanded = new Set(expandedTenants);
        if (newExpanded.has(tenantId)) {
            newExpanded.delete(tenantId);
        } else {
            newExpanded.add(tenantId);
        }
        setExpandedTenants(newExpanded);
    };

    const expandAll = () => {
        setExpandedTenants(new Set(tenantGroups.map(group => group.tenant_id)));
    };

    const collapseAll = () => {
        setExpandedTenants(new Set());
    };

    const handleFilterChange = (newTenant?: string, newType?: string, newStatus?: string) => {
        const params = new URLSearchParams();
        
        const tenant = newTenant !== undefined ? newTenant : tenantFilter;
        const type = newType !== undefined ? newType : typeFilter;
        const status = newStatus !== undefined ? newStatus : statusFilter;
        
        if (tenant !== 'all') params.set('tenant', tenant);
        if (type !== 'all') params.set('type', type);
        if (status !== 'all') params.set('status', status);
        
        router.get(route('admin.quotas.index'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setTenantFilter('all');
        setTypeFilter('all');
        setStatusFilter('all');
        router.get(route('admin.quotas.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
            case 'users': return <Users className="h-4 w-4" />;
            case 'workers': return <Users className="h-4 w-4" />;
            case 'jobs_per_month': return <Briefcase className="h-4 w-4" />;
            case 'assets': return <Settings className="h-4 w-4" />;
            case 'storage_mb': return <HardDrive className="h-4 w-4" />;
            default: return <Settings className="h-4 w-4" />;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quota Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                        <div>
                            <h1 className="text-3xl font-bold">Quota Management</h1>
                            <p className="text-gray-500">Monitor and manage resource quotas across all tenants</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Quotas</p>
                                    <p className="text-2xl font-bold">{stats.total_quotas}</p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Exceeded Quotas</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.exceeded_quotas}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Warning Quotas</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.warning_quotas}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Unlimited Quotas</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.unlimited_quotas}</p>
                                </div>
                                <Infinity className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Search className="h-5 w-5" />
                            <span>Filters</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <Select 
                                    value={tenantFilter} 
                                    onValueChange={(value) => {
                                        setTenantFilter(value);
                                        handleFilterChange(value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Tenants" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tenants</SelectItem>
                                        {tenants.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.id}>
                                                {tenant.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select 
                                    value={typeFilter} 
                                    onValueChange={(value) => {
                                        setTypeFilter(value);
                                        handleFilterChange(undefined, value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {quota_types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {formatQuotaType(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select 
                                    value={statusFilter} 
                                    onValueChange={(value) => {
                                        setStatusFilter(value);
                                        handleFilterChange(undefined, undefined, value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="exceeded">Exceeded</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex space-x-2">
                                <Button 
                                    variant="outline" 
                                    onClick={clearFilters}
                                    disabled={tenantFilter === 'all' && typeFilter === 'all' && statusFilter === 'all'}
                                    size="sm"
                                >
                                    Clear Filters
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => window.location.reload()}
                                    size="sm"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <div className="flex border rounded-md">
                                    <Button
                                        type="button"
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-r-none"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('table')}
                                        className="rounded-l-none"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex border rounded-md">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={expandAll}
                                        className="rounded-r-none"
                                    >
                                        Expand All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={collapseAll}
                                        className="rounded-l-none"
                                    >
                                        Collapse All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quotas Views */}
                {viewMode === 'grid' ? (
                    /* Grid View - Grouped by Tenant */
                    <div className="space-y-6">
                        {tenantGroups.map((group) => (
                            <Card key={group.tenant_id}>
                                <CardHeader 
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleTenant(group.tenant_id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-2">
                                                {expandedTenants.has(group.tenant_id) ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                                )}
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {group.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <span>{group.tenant_name}</span>
                                                <Badge variant="outline" className="ml-2">
                                                    {group.quotas.length} quota{group.quotas.length !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                        </CardTitle>
                                        <Link href={`/admin/quotas/tenant/${group.tenant_id}`} onClick={(e) => e.stopPropagation()}>
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Manage All
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                {expandedTenants.has(group.tenant_id) && (
                                    <CardContent>
                                        <div className="space-y-3">
                                            {group.quotas.map((quota) => (
                                                <div key={quota.id} className="border rounded-lg p-4 hover:bg-gray-50/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            {getTypeIcon(quota.quota_type)}
                                                            <div>
                                                                <p className="font-medium">{formatQuotaType(quota.quota_type)} Quota</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {quota.current_usage} / {quota.is_unlimited ? '∞' : quota.quota_limit}
                                                                    {!quota.is_unlimited && ` (${quota.usage_percentage}% used)`}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(quota.status)}
                                                                <Badge className={getStatusColor(quota.status)}>
                                                                    {quota.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Usage Bar */}
                                                    {!quota.is_unlimited && (
                                                        <div className="mt-3">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className={`h-2 rounded-full ${getUsageColor(quota.usage_percentage)}`}
                                                                    style={{ width: `${Math.min(quota.usage_percentage, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Additional Info */}
                                                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>Last updated: {quota.updated_at}</span>
                                                        {quota.reset_date && (
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>Resets: {quota.reset_date}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}

                        {tenantGroups.length === 0 && (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotas found</h3>
                                    <p className="text-gray-500">
                                        {tenantFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                                            ? 'No quotas match your current filters.'
                                            : 'No quotas have been configured yet.'
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    /* Table View - Flat List */
                    <Card>
                        <CardHeader>
                            <CardTitle>Quota Overview - Table View</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Limit</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotas.map((quota) => (
                                        <TableRow key={quota.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                                                        {quota.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{quota.tenant_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getTypeIcon(quota.quota_type)}
                                                    <span>{formatQuotaType(quota.quota_type)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{quota.current_usage}</TableCell>
                                            <TableCell>{quota.is_unlimited ? '∞' : quota.quota_limit}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span>{quota.is_unlimited ? 'Unlimited' : `${quota.usage_percentage}%`}</span>
                                                    {!quota.is_unlimited && (
                                                        <div className="w-16 bg-gray-200 rounded-full h-1">
                                                            <div 
                                                                className={`h-1 rounded-full ${getUsageColor(quota.usage_percentage)}`}
                                                                style={{ width: `${Math.min(quota.usage_percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(quota.status)}
                                                    <Badge className={getStatusColor(quota.status)}>
                                                        {quota.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{quota.updated_at}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/quotas/tenant/${quota.tenant_id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {quotas.length === 0 && (
                                <div className="text-center py-8">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotas found</h3>
                                    <p className="text-gray-500">
                                        {tenantFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                                            ? 'No quotas match your current filters.'
                                            : 'No quotas have been configured yet.'
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} quotas
                        </div>
                        <div className="flex space-x-1">
                            {pagination.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', (pagination.current_page - 1).toString());
                                        router.get(route('admin.quotas.index'), Object.fromEntries(params), {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    Previous
                                </Button>
                            )}
                            
                            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                let pageNum;
                                if (pagination.last_page <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.current_page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.current_page >= pagination.last_page - 2) {
                                    pageNum = pagination.last_page - 4 + i;
                                } else {
                                    pageNum = pagination.current_page - 2 + i;
                                }
                                
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === pagination.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            const params = new URLSearchParams(window.location.search);
                                            params.set('page', pageNum.toString());
                                            router.get(route('admin.quotas.index'), Object.fromEntries(params), {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            
                            {pagination.current_page < pagination.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', (pagination.current_page + 1).toString());
                                        router.get(route('admin.quotas.index'), Object.fromEntries(params), {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
