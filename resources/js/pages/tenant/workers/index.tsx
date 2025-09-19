import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, User, MapPin, Calendar, Phone, Mail, Grid3X3, List, HardHat } from 'lucide-react';

interface Skill {
    id: string;
    name: string;
    pivot: {
        level: string;
    };
}

interface Location {
    id: string;
    name: string;
    address: string;
}

interface JobAssignment {
    id: string;
    job: {
        id: string;
        title: string;
        status: string;
    };
}

interface Worker {
    id: string;
    employee_number?: string;
    first_name: string;
    last_name: string;
    status: 'active' | 'inactive' | 'suspended';
    hire_date: string;
    hourly_rate?: number;
    created_at: string;
    user: {
        id: string;
        name: string;
        email: string | 'nie ma';
        phone?: string;
    };
    location?: Location;
    skills: Skill[];
    job_assignments: JobAssignment[];
}

interface Props {
    workers: {
        data: Worker[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    locations: Array<{
        id: string;
        name: string;
    }>;
    skills: Array<{
        id: string;
        name: string;
    }>;
    filters: {
        search?: string;
        status?: string;
        location_id?: string;
        skill_id?: string;
    };
    can: {
        create: boolean;
    };
}

const WorkersIndex: React.FC<Props> = ({ workers, locations, skills, filters, can }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [locationFilter, setLocationFilter] = useState(filters.location_id || 'all');
    const [skillFilter, setSkillFilter] = useState(filters.skill_id || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
            suspended: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: string) => {
        const texts = {
            active: 'Aktywny',
            inactive: 'Nieaktywny',
            suspended: 'Zawieszony',
        };
        return texts[status as keyof typeof texts] || status;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('tenant.workers.index'), {
            search,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            location_id: locationFilter !== 'all' ? locationFilter : undefined,
            skill_id: skillFilter !== 'all' ? skillFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getWorkerFullName = (worker: Worker) => {
        return `${worker.first_name} ${worker.last_name}`;
    };

    return (
        <AppLayout>
            <Head title="Zarządzanie pracownikami" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Zarządzanie pracownikami</h1>
                                <p className="mt-2 text-gray-600">
                                    Zarządzaj pracownikami w swojej organizacji
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
                                    <Link href={route('tenant.workers.create')}>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nowy pracownik
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
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Szukaj pracowników..."
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
                                            <SelectItem value="active">Aktywni</SelectItem>
                                            <SelectItem value="inactive">Nieaktywni</SelectItem>
                                            <SelectItem value="suspended">Zawieszeni</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Lokalizacja" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.id}>
                                                    {location.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={skillFilter} onValueChange={setSkillFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Umiejętność" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Wszystkie umiejętności</SelectItem>
                                            {skills.map((skill) => (
                                                <SelectItem key={skill.id} value={skill.id}>
                                                    {skill.name}
                                                </SelectItem>
                                            ))}
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

                    {/* Workers List */}
                    {workers.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="text-gray-500">
                                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium mb-2">Brak pracowników</h3>
                                    <p className="mb-4">Nie znaleziono żadnych pracowników spełniających kryteria wyszukiwania.</p>
                                    {can.create && (
                                        <Link href={route('tenant.workers.create')}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Dodaj pierwszego pracownika
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="space-y-4">
                            {workers.data.map((worker) => (
                                <Card key={worker.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {getWorkerFullName(worker)}
                                                    </h3>
                                                    <Badge className={getStatusColor(worker.status)}>
                                                        {getStatusText(worker.status)}
                                                    </Badge>
                                                    {worker.employee_number && (
                                                        <span className="text-sm text-gray-500">
                                                            #{worker.employee_number}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{worker.user?.email || 'nie ma'}</span>
                                                    </div>
                                                    
                                                    {worker?.user?.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{worker.user?.phone || 'nie ma'}</span>
                                                        </div>
                                                    )}

                                                    {worker.location && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{worker.location.name}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Zatrudniony: {formatDate(worker.hire_date)}</span>
                                                    </div>

                                                    {worker.hourly_rate && (
                                                        <div className="flex items-center gap-1">
                                                            <span>Stawka: {formatCurrency(worker.hourly_rate)}/h</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Skills */}
                                                {worker.skills.length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <HardHat className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm font-medium text-gray-700">Umiejętności:</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {worker.skills.slice(0, 3).map((skill) => (
                                                                <Badge key={skill.id} variant="outline" className="text-xs">
                                                                    {skill.name} ({skill.pivot.level})
                                                                </Badge>
                                                            ))}
                                                            {worker.skills.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{worker.skills.length - 3} więcej
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Current Jobs */}
                                                {worker.job_assignments.length > 0 && (
                                                    <div className="text-sm text-blue-600">
                                                        Aktywne zlecenia: {worker.job_assignments.length}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Link href={route('tenant.workers.show', worker.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                
                                                <Link href={route('tenant.workers.edit', worker.id)}>
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
                                            <TableHead>Pracownik</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Lokalizacja</TableHead>
                                            <TableHead>Umiejętności</TableHead>
                                            <TableHead>Stawka</TableHead>
                                            <TableHead>Data zatrudnienia</TableHead>
                                            <TableHead className="text-right">Akcje</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {workers.data.map((worker) => (
                                            <TableRow key={worker.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {getWorkerFullName(worker)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {worker.user?.email || 'nie ma'}
                                                            {worker.employee_number && ` • #${worker.employee_number}`}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(worker.status)}>
                                                        {getStatusText(worker.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {worker.location ? (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{worker.location.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {worker.skills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {worker.skills.slice(0, 2).map((skill) => (
                                                                <Badge key={skill.id} variant="outline" className="text-xs">
                                                                    {skill.name}
                                                                </Badge>
                                                            ))}
                                                            {worker.skills.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{worker.skills.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Brak</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {worker.hourly_rate ? (
                                                        <div className="text-sm">
                                                            {formatCurrency(worker.hourly_rate)}/h
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {formatDate(worker.hire_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={route('tenant.workers.show', worker.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        
                                                        <Link href={route('tenant.workers.edit', worker.id)}>
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
                    {workers.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {Array.from({ length: workers.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === workers.current_page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => router.get(route('tenant.workers.index', { page }))}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Wyświetlono {workers.data.length} z {workers.total} pracowników
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default WorkersIndex;