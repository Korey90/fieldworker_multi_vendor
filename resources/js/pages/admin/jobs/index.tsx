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
    Calendar,
    MapPin,
    Clock,
    Users,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    Briefcase,
    AlertTriangle,
    Grid3X3,
    List
} from 'lucide-react';
import { type BreadcrumbItem, type Job, type PaginatedData, type Location } from '@/types';

interface JobsIndexProps {
    jobs: PaginatedData<Job>;
    locations: Location[];
    filters: {
        search?: string;
        status?: string;
        location_id?: string;
    };
    statuses: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Jobs', href: '/admin/jobs' },
];

export default function JobsIndex({ 
    jobs = { data: [], meta: { total: 0, from: 0, to: 0, last_page: 1, current_page: 1, per_page: 15, path: '' }, links: { first: '', last: '', prev: null, next: null } }, 
    locations = [], 
    filters = {}, 
    statuses = {} 
}: JobsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedLocation, setSelectedLocation] = useState(filters.location_id || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Debounced search effect - tylko dla wyszukiwania tekstowego
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                applyFilters();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Natychmiastowe filtrowanie dla select-ów
    useEffect(() => {
        if (selectedStatus !== (filters.status || 'all')) {
            applyFilters();
        }
    }, [selectedStatus]);

    useEffect(() => {
        if (selectedLocation !== (filters.location_id || 'all')) {
            applyFilters();
        }
    }, [selectedLocation]);

    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (searchTerm) params.set('search', searchTerm);
        if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedLocation && selectedLocation !== 'all') params.set('location_id', selectedLocation);
        
        router.get(route('admin.jobs.index'), Object.fromEntries(params), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        applyFilters();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedLocation('all');
        router.get(route('admin.jobs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        clearFilters();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'in_progress':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
            case 'completed':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'cancelled':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getPriorityIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'in_progress':
                return <Briefcase className="h-4 w-4" />;
            case 'completed':
                return <Calendar className="h-4 w-4" />;
            case 'cancelled':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jobs Management" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Jobs Management</h1>
                        <p className="text-muted-foreground">
                            Manage and track all field work assignments ({jobs?.meta?.total || 0} jobs)
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Link href="/admin/jobs/kanban">
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Kanban
                            </Button>
                        </Link>
                        <Link href="/admin/jobs/calendar">
                            <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar
                            </Button>
                        </Link>
                        <Link href="/admin/jobs/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Job
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Search className="h-5 w-5" />
                            <span>Filtry (filtrowanie na żywo)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <Input
                                    placeholder="Szukaj zadań..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <Select 
                                    value={selectedStatus} 
                                    onValueChange={(value) => setSelectedStatus(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wszystkie statusy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie statusy</SelectItem>
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select 
                                    value={selectedLocation} 
                                    onValueChange={(value) => setSelectedLocation(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wszystkie lokalizacje" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={location.id.toString()}>
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                {/* Placeholder for future filters */}
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={clearFilters}
                                    disabled={!searchTerm && selectedStatus === 'all' && selectedLocation === 'all'}
                                >
                                    Wyczyść filtry
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

                {/* Jobs Views */}
                {jobs?.data && jobs.data.length > 0 ? (
                    viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.data.map((job) => (
                                <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {getPriorityIcon(job.status)}
                                                        <span className="ml-1">{statuses[job.status]}</span>
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg line-clamp-2 mb-2">
                                                    {job.title}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {job.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            {/* Location */}
                                            {job.location && (
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{job.location.name}</span>
                                                </div>
                                            )}

                                            {/* Scheduled Date */}
                                            {job.scheduled_at && (
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(job.scheduled_at)}</span>
                                                </div>
                                            )}

                                            {/* Assigned Workers */}
                                            {job.assignments && job.assignments.length > 0 && (
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <Users className="h-4 w-4" />
                                                    <span>{job.assignments.length} worker(s) assigned</span>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <div className="text-xs text-muted-foreground">
                                                    Created: {formatDate(job.created_at)}
                                                </div>
                                                <div className="flex space-x-1">
                                                    <Link href={`/admin/jobs/${job.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/jobs/${job.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this job?')) {
                                                                router.delete(`/admin/jobs/${job.id}`);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        /* Table View */
                        <Card>
                            <CardHeader>
                                <CardTitle>Jobs Overview - Table View</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Job Title</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Scheduled</TableHead>
                                            <TableHead>Workers</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jobs.data.map((job) => (
                                            <TableRow key={job.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{job.title}</div>
                                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                                            {job.description}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {getPriorityIcon(job.status)}
                                                        <span className="ml-1">{statuses[job.status]}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{job.location?.name || 'Not assigned'}</TableCell>
                                                <TableCell className="text-sm">
                                                    {job.scheduled_at ? formatDate(job.scheduled_at) : 'Not scheduled'}
                                                </TableCell>
                                                <TableCell>
                                                    {job.assignments && job.assignments.length > 0 
                                                        ? `${job.assignments.length} worker(s)` 
                                                        : 'Unassigned'
                                                    }
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(job.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Link href={`/admin/jobs/${job.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/jobs/${job.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this job?')) {
                                                                    router.delete(`/admin/jobs/${job.id}`);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {Object.keys(filters).some(key => filters[key as keyof typeof filters]) 
                                    ? "No jobs match your current filters. Try adjusting your search criteria."
                                    : "Get started by creating your first job assignment."
                                }
                            </p>
                            <Link href="/admin/jobs/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Job
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {jobs?.data && jobs.data.length > 0 && jobs?.meta?.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {jobs?.meta?.from || 0} to {jobs?.meta?.to || 0} of {jobs?.meta?.total || 0} jobs
                        </div>
                        <div className="flex space-x-2">
                            {jobs?.links?.prev && (
                                <Link href={jobs.links.prev}>
                                    <Button variant="outline" size="sm">
                                        Previous
                                    </Button>
                                </Link>
                            )}
                            {jobs?.links?.next && (
                                <Link href={jobs.links.next}>
                                    <Button variant="outline" size="sm">
                                        Next
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}