import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    Shield, 
    Users,
    Settings
} from 'lucide-react';
import type { Role } from '@/types';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface RolesIndexProps {
    roles: Role[];
    filters: {
        search?: string;
    };
}

export default function RolesIndex({ roles, filters }: RolesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/admin/roles', {
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/admin/roles', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteRole = (role: Role) => {
        if (confirm(`Czy na pewno chcesz usunąć rolę "${role.name}"? Ta akcja jest nieodwracalna.`)) {
            router.delete(`/admin/roles/${role.id}`, {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs = [
        { title: 'Role', href: '/admin/roles' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zarządzanie rolami" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Role</h1>
                        <p className="text-gray-600">Zarządzanie rolami i ich uprawnieniami</p>
                    </div>
                    <Link href="/admin/roles/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Dodaj rolę
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Szukaj ról..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Szukaj
                                </Button>
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Wyczyść
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <Card key={role.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <CardTitle className="text-lg">{role.name}</CardTitle>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/roles/${role.id}`} className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Zobacz szczegóły
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/roles/${role.id}/edit`} className="flex items-center gap-2">
                                                <Edit className="h-4 w-4" />
                                                Edytuj
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => handleDeleteRole(role)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Usuń
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {role.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {role.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span>{role.users?.length || 0} użytkowników</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-gray-400" />
                                        <span>{role.permissions?.length || 0} uprawnień</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                    Slug: {role.slug}
                                </div>

                                {role.permissions && role.permissions.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-2">
                                            Przykładowe uprawnienia:
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 3).map((permission) => (
                                                <Badge key={permission.id} variant="secondary" className="text-xs">
                                                    {permission.name}
                                                </Badge>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{role.permissions.length - 3} więcej
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 border-t">
                                    <Link href={`/admin/roles/${role.id}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            Zobacz szczegóły
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {roles.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak ról</h3>
                            <p className="text-gray-600 mb-4">
                                Nie znaleziono ról spełniających kryteria wyszukiwania.
                            </p>
                            <Button asChild>
                                <Link href="/admin/roles/create">
                                    Dodaj pierwszą rolę
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}