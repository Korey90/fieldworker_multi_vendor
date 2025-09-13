import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    Key, 
    ToggleLeft, 
    ToggleRight,
    Shield
} from 'lucide-react';
import type { Permission } from '@/types';

interface PermissionsIndexProps {
    permissions: Record<string, Permission[]>;
    groups: string[];
    filters: {
        search?: string;
        group?: string;
        status?: boolean | null;
    };
}

export default function PermissionsIndex({ permissions, groups, filters }: PermissionsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedGroup, setSelectedGroup] = useState(filters.group || 'all');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status !== null ? filters.status?.toString() : 'all'
    );

    const handleSearch = () => {
        router.get('/admin/permissions', {
            search: searchTerm || undefined,
            group: selectedGroup !== 'all' ? selectedGroup : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedGroup('all');
        setSelectedStatus('all');
        router.get('/admin/permissions', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (permission: Permission) => {
        router.patch(`/admin/permissions/${permission.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeletePermission = (permission: Permission) => {
        if (confirm(`Czy na pewno chcesz usunąć uprawnienie "${permission.name}"? Ta akcja jest nieodwracalna.`)) {
            router.delete(`/admin/permissions/${permission.id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const groupNames = Object.keys(permissions);
    const totalPermissions = Object.values(permissions).flat().length;

    const breadcrumbs = [
        { title: 'Permissions', href: '/admin/permissions' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zarządzanie uprawnieniami" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Uprawnienia</h1>
                        <p className="text-gray-600">
                            Zarządzanie uprawnieniami systemu ({totalPermissions} uprawnień w {groupNames.length} grupach)
                        </p>
                    </div>
                    <Link href="/admin/permissions/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Dodaj uprawnienie
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
                                        placeholder="Szukaj uprawnień..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Grupa uprawnień" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie grupy</SelectItem>
                                        {groups.map((group) => (
                                            <SelectItem key={group} value={group}>
                                                {group.replace('_', ' ').toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie statusy</SelectItem>
                                        <SelectItem value="true">Aktywne</SelectItem>
                                        <SelectItem value="false">Nieaktywne</SelectItem>
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

                {/* Permissions by Groups */}
                <div className="space-y-8">
                    {groupNames.map((groupName) => (
                        <div key={groupName}>
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="h-6 w-6 text-blue-600" />
                                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                                    {groupName.replace('_', ' ')}
                                </h2>
                                <Badge variant="outline">
                                    {permissions[groupName].length} uprawnień
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {permissions[groupName].map((permission) => (
                                    <Card key={permission.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <div className="flex items-center space-x-2">
                                                <Key className="h-4 w-4 text-gray-600" />
                                                <CardTitle className="text-base">{permission.name}</CardTitle>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(permission.is_active)}>
                                                    {permission.is_active ? 'Aktywne' : 'Nieaktywne'}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/permissions/${permission.id}`} className="flex items-center gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                Zobacz szczegóły
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/permissions/${permission.id}/edit`} className="flex items-center gap-2">
                                                                <Edit className="h-4 w-4" />
                                                                Edytuj
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(permission)}>
                                                            {permission.is_active ? (
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
                                                            onClick={() => handleDeletePermission(permission)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Usuń
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {permission.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {permission.description}
                                                </p>
                                            )}

                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Klucz:</span>
                                                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                                        {permission.permission_key}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Slug:</span>
                                                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                                        {permission.slug}
                                                    </code>
                                                </div>
                                                {permission.key && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Klucz dodatkowy:</span>
                                                        <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                                            {permission.key}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>

                                            {permission.roles && permission.roles.length > 0 && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 mb-2">
                                                        Używane w rolach ({permission.roles.length}):
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {permission.roles.slice(0, 2).map((role) => (
                                                            <Badge key={role.id} variant="outline" className="text-xs">
                                                                {role.name}
                                                            </Badge>
                                                        ))}
                                                        {permission.roles.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{permission.roles.length - 2} więcej
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {groupNames.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak uprawnień</h3>
                            <p className="text-gray-600 mb-4">
                                Nie znaleziono uprawnień spełniających kryteria wyszukiwania.
                            </p>
                            <Button asChild>
                                <Link href="/admin/permissions/create">
                                    Dodaj pierwsze uprawnienie
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}