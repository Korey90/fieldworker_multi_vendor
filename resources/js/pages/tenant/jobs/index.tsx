import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, Calendar, MapPin, User, Clock, Grid3X3, List } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduled_start?: string;
    created_at: string;
    location?: {
        id: string;
        name: string | 'nieznany';
        address: string | null;
    };
    assignments?: Array<{
        worker: {
            user: {
                name: string | 'Nieznany';
            };
        };
    }>;
}

interface Props {
    jobs: {
        data: Job[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    can: {
        create: boolean;
    };
}

const JobsIndex: React.FC<Props> = ({ jobs, can }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 border-gray-200',
            medium: 'bg-blue-100 text-blue-800 border-blue-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            urgent: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('tenant.jobs.index'), {
            search,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Zarządzanie pracami" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Zarządzanie pracami</h1>
                                <p className="mt-2 text-gray-600">
                                    Zarządzaj pracami i zleceniami w swojej organizacji
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="h-8 px-3"
                                        title="Widok kafelkowy"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('table')}
                                        className="h-8 px-3"
                                        title="Widok tabelaryczny"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>

                                {can.create && (
                                    <Link href={route('tenant.jobs.create')}>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nowa praca
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSearch}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Szukaj prac..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie statusy</SelectItem>
                                            <SelectItem value="pending">Oczekujące</SelectItem>
                                            <SelectItem value="in_progress">W toku</SelectItem>
                                            <SelectItem value="completed">Ukończone</SelectItem>
                                            <SelectItem value="cancelled">Anulowane</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Priorytet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie priorytety</SelectItem>
                                            <SelectItem value="low">Niski</SelectItem>
                                            <SelectItem value="medium">Średni</SelectItem>
                                            <SelectItem value="high">Wysoki</SelectItem>
                                            <SelectItem value="urgent">Pilny</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button type="submit" variant="outline">
                                        <Search className="h-4 w-4 mr-2" />
                                        Szukaj
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Jobs List */}
                    {jobs.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="text-gray-500">
                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium mb-2">Brak prac</h3>
                                    <p className="mb-4">Nie znaleziono żadnych prac spełniających kryteria wyszukiwania.</p>
                                    {can.create && (
                                        <Link href={route('tenant.jobs.create')}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Dodaj pierwszą pracę
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="space-y-4">
                            {jobs.data.map((job) => (
                                <Card key={job.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {job.title}
                                                    </h3>
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {job.status === 'pending' && 'Oczekująca'}
                                                        {job.status === 'in_progress' && 'W toku'}
                                                        {job.status === 'completed' && 'Ukończona'}
                                                        {job.status === 'cancelled' && 'Anulowana'}
                                                    </Badge>
                                                    <Badge className={getPriorityColor(job.priority)}>
                                                        {job.priority === 'low' && 'Niski'}
                                                        {job.priority === 'medium' && 'Średni'}
                                                        {job.priority === 'high' && 'Wysoki'}
                                                        {job.priority === 'urgent' && 'Pilny'}
                                                    </Badge>
                                                </div>
                                                
                                                <p className="text-gray-600 mb-3 line-clamp-2">
                                                    {job.description}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    {job.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{job.location.name || 'Nieznana lokalizacja'}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {job.scheduled_start && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Planowane: {formatDate(job.scheduled_start)}</span>
                                                        </div>
                                                    )}

                                                    {job.assignments && job.assignments.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            <span>
                                                                {job.assignments.length === 1 
                                                                    ? job.assignments[0].worker.user?.name || 'Nieznany pracownik'
                                                                    : `${job.assignments.length} pracowników`
                                                                }
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Utworzona: {formatDate(job.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Link href={route('tenant.jobs.show', job.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                
                                                <Link href={route('tenant.jobs.edit', job.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        /* Table View */
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tytuł</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priorytet</TableHead>
                                            <TableHead>Lokalizacja</TableHead>
                                            <TableHead>Pracownicy</TableHead>
                                            <TableHead>Planowane rozpoczęcie</TableHead>
                                            <TableHead>Data utworzenia</TableHead>
                                            <TableHead className="text-right">Akcje</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jobs.data.map((job) => (
                                            <TableRow key={job.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{job.title}</div>
                                                        <div className="text-sm text-gray-500 line-clamp-1">{job.description}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {job.status === 'pending' && 'Oczekująca'}
                                                        {job.status === 'in_progress' && 'W toku'}
                                                        {job.status === 'completed' && 'Ukończona'}
                                                        {job.status === 'cancelled' && 'Anulowana'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getPriorityColor(job.priority)}>
                                                        {job.priority === 'low' && 'Niski'}
                                                        {job.priority === 'medium' && 'Średni'}
                                                        {job.priority === 'high' && 'Wysoki'}
                                                        {job.priority === 'urgent' && 'Pilny'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {job.location ? (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{job.location.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {job.assignments && job.assignments.length > 0 ? (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <User className="h-3 w-3" />
                                                            <span>
                                                                {job.assignments.length === 1 
                                                                    ? job.assignments[0].worker.user?.name || 'Nieznany pracownik'
                                                                    : `${job.assignments.length} pracowników`
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Brak przypisań</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {job.scheduled_start ? (
                                                        <div className="text-sm">
                                                            {formatDate(job.scheduled_start)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {formatDate(job.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={route('tenant.jobs.show', job.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        
                                                        <Link href={route('tenant.jobs.edit', job.id)}>
                                                            <Button variant="outline" size="sm">
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

                    {/* Pagination */}
                    {jobs.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {Array.from({ length: jobs.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === jobs.current_page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => router.get(route('tenant.jobs.index', { page }))}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Wyświetlono {jobs.data.length} z {jobs.total} prac
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default JobsIndex;