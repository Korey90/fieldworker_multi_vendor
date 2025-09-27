import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    Search, 
    Plus, 
    Filter, 
    Download, 
    Users, 
    MapPin, 
    Calendar,
    Phone,
    Mail,
    Award,
    Clock,
    Grid3X3,
    List,
    Eye,
    Edit
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Worker {
    id: string;
    tenant_id: string;
    location_id?: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    dob: string; // date of birth
    insurance_number: string;
    phone?: string;
    email: string;
    hire_date: string;
    hourly_rate: number;
    status: 'active' | 'inactive' | 'on_leave';
    data: string;
    last_activity: string;
    tenant: {
        id: string;
        name: string;
    };
    location?: {
        name: string;
        address: string;
    };
    skills: Array<{
        id: string;
        name: string;
        level: number; // 1-5 scale
    }>;
    certifications: Array<{
        id: string;
        name: string;
        expiry_date: string;
        status: 'valid' | 'expiring' | 'expired';
    }>;
    current_job?: {
        id: string;
        title: string;
        location: string;
    };
}

interface Location {
    id: string;
    name: string;
    tenant_id?: string;
    tenant?: {
        id: string;
        name: string;
    };
}

interface Skill {
    id: string;
    name: string;
    category: string;
}

interface Tenant {
    id: string;
    name: string;
}

interface WorkersIndexProps {
    workers: {
        data: Worker[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        tenant?: string;
        status?: string;
        location?: string;
        skills?: string[];
    };
    tenants: Tenant[];
    locations: Location[];
    skills: Skill[];
    stats: {
        total_workers: number;
        active_workers: number;
        on_leave: number;
        inactive_workers: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Workers', href: '/admin/workers' },
];

export default function WorkersIndex({ workers, filters, tenants, locations, skills, stats }: WorkersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tenantFilter, setTenantFilter] = useState(filters.tenant || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [locationFilter, setLocationFilter] = useState(filters.location || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                handleFilterChange(searchTerm);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleFilterChange = (newSearch?: string, newTenant?: string, newStatus?: string, newLocation?: string) => {
        const params = new URLSearchParams();
        
        const search = newSearch !== undefined ? newSearch : searchTerm;
        const tenant = newTenant !== undefined ? newTenant : tenantFilter;
        const status = newStatus !== undefined ? newStatus : statusFilter;
        const location = newLocation !== undefined ? newLocation : locationFilter;
        
        if (search) params.set('search', search);
        if (tenant !== 'all') params.set('tenant', tenant);
        if (status !== 'all') params.set('status', status);
        if (location !== 'all') params.set('location', location);
        
        router.get(route('admin.workers.index'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTenantFilter('all');
        setStatusFilter('all');
        setLocationFilter('all');
        router.get(route('admin.workers.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: Worker['status']) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'on_leave':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: Worker['status']) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'inactive':
                return 'Inactive';
            case 'on_leave':
                return 'On Leave';
            default:
                return 'Unknown';
        }
    };

    const getCertificationColor = (status: string) => {
        switch (status) {
            case 'valid':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'expiring':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'expired':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getSkillLevelText = (level: number) => {
        switch (level) {
            case 1:
                return 'Beginner';
            case 2:
                return 'Intermediate';
            case 3:
                return 'Advanced';
            case 4:
                return 'Expert';
            case 5:
                return 'Master';
            default:
                return 'Unknown';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workers Management" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
                        <p className="text-muted-foreground">
                            Manage and monitor your field workforce ({stats.total_workers} workers)
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Link href="/admin/workers/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Worker
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                                    <p className="text-2xl font-bold">{stats.total_workers}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active_workers}</p>
                                </div>
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.on_leave}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats.inactive_workers}</p>
                                </div>
                                <Users className="h-8 w-8 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
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
                                <Input
                                    placeholder="Search workers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Select 
                                    value={tenantFilter} 
                                    onValueChange={(value) => {
                                        setTenantFilter(value);
                                        handleFilterChange(undefined, value);
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
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select 
                                    value={locationFilter} 
                                    onValueChange={(value) => {
                                        setLocationFilter(value);
                                        handleFilterChange(undefined, undefined, undefined, value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Locations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Locations</SelectItem>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={location.id}>
                                                {location.name}
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
                                    disabled={!searchTerm && tenantFilter === 'all' && statusFilter === 'all' && locationFilter === 'all'}
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

                {/* Workers Views */}
                {viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {workers.data.map((worker) => (
                            <Card key={worker.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {`${worker.first_name[0]}${worker.last_name[0]}`.toUpperCase()}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{worker.first_name} {worker.last_name}</CardTitle>
                                                <p className="text-sm text-muted-foreground">#{worker.employee_number}</p>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusColor(worker.status)}>
                                            {getStatusText(worker.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Tenant Info */}
                                    <div className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                {worker.tenant.name}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">{worker.email}</span>
                                        </div>
                                        {worker.phone && (
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{worker.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Current Job */}
                                    
                                    {worker.current_job && (
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <MapPin className="h-4 w-4 text-green-600" />
                                                <span className="font-medium">Current Job:</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 truncate">
                                                {worker.current_job.title}co
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                📍 {worker.current_job.location}to
                                            </p>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">Skills</div>
                                        <div className="flex flex-wrap gap-1">
                                            {worker.skills.slice(0, 3).map((skill: any) => (
                                                <Badge key={skill.id} variant="outline" className="text-xs">
                                                    {skill.name}
                                                </Badge>
                                            ))}
                                            {worker.skills.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{worker.skills.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

{/* Certifications */}
<div>
  <div className="text-xs font-medium text-muted-foreground mb-2">Certifications</div>
  <div className="space-y-1">
    {worker.certifications.slice(0, 2).map((cert: any) => (
      <div key={cert.id} className="flex items-center justify-between text-xs">
        <span className="truncate">{cert.name}</span>
        <Badge className={`text-xs ${getCertificationColor(cert.status)}`}>
          {cert.status}
        </Badge>
      </div>
    ))}
    {worker.certifications.length > 2 && (
      <p className="text-xs text-muted-foreground">
        +{worker.certifications.length - 2} more certifications
      </p>
    )}
  </div>
</div>


                                    {/* Actions */}
                                    <div className="flex justify-between space-x-2 pt-2">
                                        <Link href={route('admin.workers.show', worker.id)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={route('admin.workers.edit', worker.id)}>
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
                ) : (
                    /* Table View */
                    <Card>
                        <CardHeader>
                            <CardTitle>Workers Overview - Table View</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Worker</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Skills</TableHead>
                                        <TableHead>Current Job</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workers.data.map((worker) => (
                                        <TableRow key={worker.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                                                        {`${worker.first_name[0]}${worker.last_name[0]}`.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{worker.first_name} {worker.last_name}</div>
                                                        <div className="text-sm text-muted-foreground">#{worker.employee_number}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                    {worker.tenant.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(worker.status)}>
                                                    {getStatusText(worker.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{worker.location?.name || 'Not assigned'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {worker.skills.slice(0, 2).map((skill: any) => (
                                                        <Badge key={skill.id} variant="outline" className="text-xs">
                                                            {skill.name}
                                                        </Badge>
                                                    ))}
                                                    {worker.skills.length > 2 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{worker.skills.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{worker.current_job?.title || 'No active job'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{worker.last_activity}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Link href={route('admin.workers.show', worker.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.workers.edit', worker.id)}>
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
                {workers.data.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No workers found</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by adding your first field worker to the system.
                            </p>
                            <Link href="/admin/workers/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Worker
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {workers.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {((workers.current_page - 1) * workers.per_page) + 1} to {Math.min(workers.current_page * workers.per_page, workers.total)} of {workers.total} workers
                        </div>
                        <div className="flex space-x-1">
                            {workers.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', (workers.current_page - 1).toString());
                                        router.get(route('admin.workers.index'), Object.fromEntries(params), {
                                            preserveState: true,
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    Previous
                                </Button>
                            )}
                            
                            {Array.from({ length: Math.min(5, workers.last_page) }, (_, i) => {
                                let pageNum;
                                if (workers.last_page <= 5) {
                                    pageNum = i + 1;
                                } else if (workers.current_page <= 3) {
                                    pageNum = i + 1;
                                } else if (workers.current_page >= workers.last_page - 2) {
                                    pageNum = workers.last_page - 4 + i;
                                } else {
                                    pageNum = workers.current_page - 2 + i;
                                }
                                
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pageNum === workers.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            const params = new URLSearchParams(window.location.search);
                                            params.set('page', pageNum.toString());
                                            router.get(route('admin.workers.index'), Object.fromEntries(params), {
                                                preserveState: true,
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            
                            {workers.current_page < workers.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('page', (workers.current_page + 1).toString());
                                        router.get(route('admin.workers.index'), Object.fromEntries(params), {
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
