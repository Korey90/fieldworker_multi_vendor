import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Users, Briefcase, HardHat, Server, Settings, Edit, Eye, Plus } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem, type Tenant } from '@/types';

interface TenantWithCounts extends Tenant {
    users_count: number;
    workers_count: number;
    jobs_count: number;
    assets_count: number;
    sector_model_count: number;
}

interface SectorData {
    id: string;
    name: string;
    code: string;
}

interface TenantsPageProps {
    tenants: TenantWithCounts[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    tenant_data: {
        sectors: SectorData[];
    };
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

export default function TenantsPage({ tenants, pagination, filters, tenant_data }: TenantsPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/quotas/tenants', { search: searchTerm }, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/10 text-green-700 border-green-200';
            case 'suspended':
                return 'bg-red-500/10 text-red-700 border-red-200';
            case 'inactive':
                return 'bg-gray-500/10 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-500/10 text-gray-700 border-gray-200';
        }
    };

    const getSectorName = (tenantId: number): string => {
        const sector = tenant_data.sectors.find(s => s.id === tenantId.toString());
        return sector?.name || 'N/A';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Quotas - Tenants" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Manage Quotas</h1>
                        <p className="text-muted-foreground">
                            Monitor and manage resource quotas for all tenants
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Tenant
                    </Button>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Search & Filter</CardTitle>
                        <CardDescription>
                            Find specific tenants by name or filter by criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search tenants by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button type="submit">Search</Button>
                            {filters.search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get('/quotas/tenants');
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Tenants Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tenants.map((tenant) => (
                        <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{tenant.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {getSectorName(tenant.id)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(tenant.status)}>
                                        {tenant.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Resource Counts */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span className="text-muted-foreground">Users:</span>
                                        <span className="font-medium">{tenant.users_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <HardHat className="h-4 w-4 text-green-500" />
                                        <span className="text-muted-foreground">Workers:</span>
                                        <span className="font-medium">{tenant.workers_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase className="h-4 w-4 text-orange-500" />
                                        <span className="text-muted-foreground">Jobs:</span>
                                        <span className="font-medium">{tenant.jobs_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Server className="h-4 w-4 text-purple-500" />
                                        <span className="text-muted-foreground">Assets:</span>
                                        <span className="font-medium">{tenant.assets_count}</span>
                                    </div>
                                </div>

                                {/* Domain Information */}
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground">Domain</p>
                                    <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                                        {tenant.domain}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => router.visit(`/quotas/tenants/${tenant.id}`)}
                                    >
                                        <Eye className="mr-1 h-3 w-3" />
                                        View
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => router.visit(`/quotas/tenants/${tenant.id}/manage`)}
                                    >
                                        <Settings className="mr-1 h-3 w-3" />
                                        Manage Quotas
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {tenants.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No tenants found</h3>
                            <p className="text-muted-foreground">
                                {filters.search 
                                    ? "No tenants match your search criteria" 
                                    : "There are no tenants to display"
                                }
                            </p>
                            {filters.search && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get('/quotas/tenants');
                                    }}
                                >
                                    Clear Search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <Card>
                        <CardContent className="flex items-center justify-between py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                {pagination.total} tenants
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => router.get('/quotas/tenants', { 
                                        ...filters, 
                                        page: pagination.current_page - 1 
                                    })}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <Button
                                                key={page}
                                                variant={pagination.current_page === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => router.get('/quotas/tenants', { 
                                                    ...filters, 
                                                    page 
                                                })}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => router.get('/quotas/tenants', { 
                                        ...filters, 
                                        page: pagination.current_page + 1 
                                    })}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}