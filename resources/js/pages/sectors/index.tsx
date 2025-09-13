import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Building2, 
    Plus, 
    Search, 
    Grid3X3, 
    Table2, 
    Eye, 
    Edit, 
    Trash2, 
    MapPin, 
    Users,
    CheckCircle,
    XCircle,
    Filter,
    MoreHorizontal
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sector } from '@/types';

interface Props {
    sectors: Sector[];
    filters: {
        search?: string;
        is_active?: boolean;
        sort?: string;
        direction?: string;
    };
}

export default function SectorsIndex({ sectors, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active?.toString() ?? 'all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/admin/sectors', { 
            search: value, 
            is_active: isActiveFilter === 'all' ? undefined : isActiveFilter 
        }, { preserveState: true });
    };

    const handleActiveFilter = (value: string) => {
        setIsActiveFilter(value);
        router.get('/admin/sectors', { 
            search, 
            is_active: value === 'all' ? undefined : value 
        }, { preserveState: true });
    };

    const handleDelete = (sector: Sector) => {
        if (confirm(`Are you sure you want to delete "${sector.name}"? This action cannot be undone.`)) {
            router.delete(`/admin/sectors/${sector.id}`);
        }
    };

    const filteredSectors = sectors.filter(sector => {
        if (search && !sector.name.toLowerCase().includes(search.toLowerCase()) && 
            !sector.description?.toLowerCase().includes(search.toLowerCase()) &&
            !sector.code.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (isActiveFilter !== 'all' && sector.is_active.toString() !== isActiveFilter) {
            return false;
        }
        return true;
    });

    const SectorCard = ({ sector }: { sector: Sector }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">{sector.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {sector.code}
                                </Badge>
                                {sector.is_active ? (
                                    <Badge variant="default" className="text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Inactive
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/sectors/${sector.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/sectors/${sector.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            {(!sector.locations_count && !sector.tenants_count) && (
                                <DropdownMenuItem onClick={() => handleDelete(sector)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                {sector.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                        {sector.description}
                    </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{sector.locations_count || 0} locations</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{sector.tenants_count || 0} tenants</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const breadcrumbs = [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Sectors', href: '/admin/sectors' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sectors Management" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sectors Management</h1>
                        <p className="text-muted-foreground">
                            Manage business sectors and their configurations
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/sectors/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sector
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search sectors..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    
                    <Select value={isActiveFilter} onValueChange={handleActiveFilter}>
                        <SelectTrigger className="w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center border rounded-lg">
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="rounded-r-none border-r"
                        >
                            <Table2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-l-none"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sectors ({filteredSectors.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Code</th>
                                            <th className="text-left p-2">Name</th>
                                            <th className="text-left p-2">Description</th>
                                            <th className="text-left p-2">Status</th>
                                            <th className="text-left p-2">Locations</th>
                                            <th className="text-left p-2">Tenants</th>
                                            <th className="text-right p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSectors.map((sector) => (
                                            <tr key={sector.id} className="border-b hover:bg-muted/50">
                                                <td className="p-2">
                                                    <Badge variant="outline">{sector.code}</Badge>
                                                </td>
                                                <td className="p-2 font-medium">{sector.name}</td>
                                                <td className="p-2 text-muted-foreground max-w-xs truncate">
                                                    {sector.description || '-'}
                                                </td>
                                                <td className="p-2">
                                                    {sector.is_active ? (
                                                        <Badge variant="default">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{sector.locations_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{sector.tenants_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/sectors/${sector.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/sectors/${sector.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {(!sector.locations_count && !sector.tenants_count) && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => handleDelete(sector)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSectors.map((sector) => (
                            <SectorCard key={sector.id} sector={sector} />
                        ))}
                    </div>
                )}

                {filteredSectors.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No sectors found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {search || isActiveFilter !== 'all' 
                                    ? "No sectors match your current filters. Try adjusting your search criteria."
                                    : "Get started by creating your first sector."
                                }
                            </p>
                            {(!search && isActiveFilter === 'all') && (
                                <Button asChild>
                                    <Link href="/admin/sectors/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Sector
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}