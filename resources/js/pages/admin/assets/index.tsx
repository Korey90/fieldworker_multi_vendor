import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    Package,
    MapPin,
    User,
    Calendar,
    ToggleLeft,
    ToggleRight,
    DollarSign
} from 'lucide-react';
import type { Asset, Location, PaginatedData, BreadcrumbItem } from '@/types';

interface AssetsIndexProps {
    assets: PaginatedData<Asset>;
    locations: Location[];
    assetTypes: string[];
    statuses: string[];
    filters: {
        search?: string;
        status?: string;
        asset_type?: string;
        location_id?: number;
        assigned?: string;
    };
}

export default function AssetsIndex({ assets, locations, assetTypes, statuses, filters }: AssetsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedType, setSelectedType] = useState(filters.asset_type || 'all');
    const [selectedLocation, setSelectedLocation] = useState(filters.location_id?.toString() || 'all');
    const [selectedAssigned, setSelectedAssigned] = useState(filters.assigned || 'all');

    const handleSearch = () => {
        router.get('/admin/assets', {
            search: searchTerm || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            asset_type: selectedType !== 'all' ? selectedType : undefined,
            location_id: selectedLocation !== 'all' ? selectedLocation : undefined,
            assigned: selectedAssigned !== 'all' ? selectedAssigned : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedLocation('all');
        setSelectedAssigned('all');
        router.get('/admin/assets', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (asset: Asset) => {
        router.patch(`/admin/assets/${asset.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteAsset = (asset: Asset) => {
        if (confirm('Czy na pewno chcesz usunąć ten zasób? Ta akcja jest nieodwracalna.')) {
            router.delete(`/admin/assets/${asset.id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'retired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Aktywny';
            case 'inactive': return 'Nieaktywny';
            case 'maintenance': return 'Konserwacja';
            case 'retired': return 'Wycofany';
            default: return status;
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Zasoby',
            href: '/admin/assets',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zarządzanie zasobami" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Zasoby</h1>
                        <p className="text-gray-600">Zarządzanie zasobami i sprzętem firmy</p>
                    </div>
                    <Link href="/admin/assets/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Dodaj zasób
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Szukaj zasobów..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie statusy</SelectItem>
                                        {statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {getStatusText(status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Typ zasobu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie typy</SelectItem>
                                        {assetTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Lokalizacja" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
                                        {locations?.map((location) => (
                                            <SelectItem key={location.id} value={location.id.toString()}>
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedAssigned} onValueChange={setSelectedAssigned}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Przypisanie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie</SelectItem>
                                        <SelectItem value="assigned">Przypisane</SelectItem>
                                        <SelectItem value="unassigned">Nieprzypisane</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filtruj
                                </Button>
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Wyczyść
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets?.data?.map((asset) => (
                        <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <Package className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                                            <Badge className={getStatusColor(asset.status)}>
                                                {getStatusText(asset.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/assets/${asset.id}`} className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Zobacz szczegóły
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/assets/${asset.id}/edit`} className="flex items-center gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edytuj
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleToggleStatus(asset)}>
                                                {asset.status === 'active' ? (
                                                    <>
                                                        <ToggleLeft className="h-4 w-4 mr-2" />
                                                        Dezaktywuj
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleRight className="h-4 w-4 mr-2" />
                                                        Aktywuj
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteAsset(asset)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Usuń
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Typ: {asset.asset_type}
                                    </div>
                                    {asset.serial_number && (
                                        <div className="flex items-center gap-2">
                                            <span className="h-4 w-4 text-center font-mono">#</span>
                                            S/N: {asset.serial_number}
                                        </div>
                                    )}
                                    {asset.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {asset.location.name}
                                        </div>
                                    )}
                                    {asset.current_assignment ? (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Przypisany: {asset.current_assignment.user.name}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <User className="h-4 w-4" />
                                            Nieprzypisany
                                        </div>
                                    )}
                                    {asset.current_value && (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Wartość: {asset.current_value.toLocaleString('pl-PL')} PLN
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Dodano: {new Date(asset.created_at).toLocaleDateString('pl-PL')}
                                    </div>
                                </div>

                                {asset.description && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700 line-clamp-2">{asset.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {(!assets?.data || assets.data.length === 0) && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak zasobów</h3>
                            <p className="text-gray-600 mb-4">
                                Nie znaleziono zasobów spełniających kryteria wyszukiwania.
                            </p>
                            <Button asChild>
                                <Link href="/admin/assets/create">
                                    Dodaj pierwszy zasób
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {assets?.data?.length > 0 && assets?.meta?.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            {assets.links?.prev && (
                                <Link href={assets.links.prev}>
                                    <Button variant="outline">Poprzednia</Button>
                                </Link>
                            )}
                            <span className="text-sm text-gray-600">
                                Strona {assets.meta.current_page} z {assets.meta.last_page}
                            </span>
                            {assets.links?.next && (
                                <Link href={assets.links.next}>
                                    <Button variant="outline">Następna</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}