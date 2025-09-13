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
    Building2,
    Search,
    Plus,
    Users,
    Briefcase,
    Settings,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    UserMinus,
    UserCheck,
    Calendar,
    HardDrive,
    Grid3X3,
    List
} from 'lucide-react';

// TypeScript interfaces
interface Sector {
    code: string;
    name: string;
}

interface Tenant {
    id: string;
    name: string;
    sector: string;
    sector_name: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
    stats: {
        users: number;
        workers: number;
        jobs: number;
    };
    quota: {
        users_limit: number | null;
        users_used: number;
        storage_limit: number | null;
        storage_used: number;
    } | null;
    features: string[];
}

interface TenantsIndexProps {
    tenants: Tenant[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        sector?: string;
    };
    sectors: Sector[];
}

export default function TenantsIndex({ tenants, pagination, filters, sectors }: TenantsIndexProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [sectorFilter, setSectorFilter] = useState(filters.sector || 'all');

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                handleFilterChange(searchValue);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchValue]);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Tenants', href: '' },
    ];

    const handleFilterChange = (newSearch?: string, newStatus?: string, newSector?: string) => {
        const params = new URLSearchParams();
        
        const search = newSearch !== undefined ? newSearch : searchValue;
        const status = newStatus !== undefined ? newStatus : statusFilter;
        const sector = newSector !== undefined ? newSector : sectorFilter;
        
        if (search) params.set('search', search);
        if (status !== 'all') params.set('status', status);
        if (sector !== 'all') params.set('sector', sector);
        
        router.get(route('admin.tenants.index'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange();
    };

    const clearFilters = () => {
        setSearchValue('');
        setStatusFilter('all');
        setSectorFilter('all');
        router.get(route('admin.tenants.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'inactive': return 'Inactive';
            case 'suspended': return 'Suspended';
            default: return 'Unknown';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenants Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold">Tenants Management</h1>
                            <p className="text-gray-500">Manage organizations and their configurations</p>
                        </div>
                    </div>
                    <Link href={route('admin.tenants.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Tenant
                        </Button>
                    </Link>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Input
                                    placeholder="Search tenants..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Select 
                                    value={statusFilter} 
                                    onValueChange={(value) => {
                                        setStatusFilter(value);
                                        handleFilterChange(undefined, value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select 
                                    value={sectorFilter} 
                                    onValueChange={(value) => {
                                        setSectorFilter(value);
                                        handleFilterChange(undefined, undefined, value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Sectors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sectors</SelectItem>
                                        {sectors.map((sector) => (
                                            <SelectItem key={sector.code} value={sector.code}>
                                                {sector.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={clearFilters}
                                    disabled={!searchValue && statusFilter === 'all' && sectorFilter === 'all'}
                                >
                                    Clear Filters
                                </Button>
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
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tenants Grid */}
                {viewMode === 'grid' && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tenants.map((tenant) => (
                            <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{tenant.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">{tenant.sector_name}</p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(tenant.status)}>
                                            {getStatusText(tenant.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Statistics */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-center space-x-1">
                                                <Users className="h-3 w-3 text-blue-600" />
                                            </div>
                                            <p className="text-sm font-bold text-blue-900">{tenant.stats.users}</p>
                                            <p className="text-xs text-blue-600">Users</p>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <div className="flex items-center justify-center space-x-1">
                                                <Users className="h-3 w-3 text-green-600" />
                                            </div>
                                            <p className="text-sm font-bold text-green-900">{tenant.stats.workers}</p>
                                            <p className="text-xs text-green-600">Workers</p>
                                        </div>
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <div className="flex items-center justify-center space-x-1">
                                                <Briefcase className="h-3 w-3 text-orange-600" />
                                            </div>
                                            <p className="text-sm font-bold text-orange-900">{tenant.stats.jobs}</p>
                                            <p className="text-xs text-orange-600">Jobs</p>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex justify-between space-x-2 pt-2">
                                        <Link href={route('admin.tenants.show', tenant.id)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={route('admin.tenants.edit', tenant.id)}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Tenants Table */}
                {viewMode === 'table' && (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Sector</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Users</TableHead>
                                        <TableHead className="text-center">Workers</TableHead>
                                        <TableHead className="text-center">Jobs</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                                                        {tenant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{tenant.name}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tenant.sector_name}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(tenant.status)}>
                                                    {getStatusText(tenant.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{tenant.stats.users}</TableCell>
                                            <TableCell className="text-center">{tenant.stats.workers}</TableCell>
                                            <TableCell className="text-center">{tenant.stats.jobs}</TableCell>
                                            <TableCell>{tenant.created_at}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={route('admin.tenants.show', tenant.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.tenants.edit', tenant.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {tenants.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants found</h3>
                            <p className="text-gray-500 text-center mb-6">
                                {filters.search || filters.status || filters.sector 
                                    ? 'No tenants match your current filters. Try adjusting your search criteria.'
                                    : 'Get started by creating your first tenant organization.'
                                }
                            </p>
                            <Link href={route('admin.tenants.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Tenant
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} tenants
                        </div>
                        <div className="flex space-x-1">
                            {pagination.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', (pagination.current_page - 1).toString());
                                        router.get(route('admin.tenants.index'), Object.fromEntries(params), {
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
                                            router.get(route('admin.tenants.index'), Object.fromEntries(params), {
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
                                        router.get(route('admin.tenants.index'), Object.fromEntries(params), {
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
