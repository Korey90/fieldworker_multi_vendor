import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    UserPlus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    UserCheck, 
    UserX,
    Mail,
    Phone,
    Calendar
} from 'lucide-react';
import type { User, Role, PaginatedData, BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';

interface UsersIndexProps {
    users: PaginatedData<User>;
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
        status?: boolean | null;
    };
}

export default function UsersIndex({ users, roles, filters }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status !== null ? filters.status?.toString() : 'all'
    );

    const handleSearch = () => {
        router.get('/admin/users', {
            search: searchTerm || undefined,
            role: selectedRole !== 'all' ? selectedRole : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedRole('all');
        setSelectedStatus('all');
        router.get('/admin/users', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (user: User) => {
        router.patch(`/admin/users/${user.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Handle success
            },
        });
    };

    const handleDeleteUser = (user: User) => {
        if (confirm('Czy na pewno chcesz usunąć tego użytkownika? Ta akcja jest nieodwracalna.')) {
            router.delete(`/admin/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Użytkownicy',
            href: 'admin/users',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zarządzanie użytkownikami" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Użytkownicy</h1>
                        <p className="text-gray-600">Zarządzanie kontami użytkowników w systemie</p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Dodaj użytkownika
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
                                        placeholder="Szukaj użytkowników..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtruj po roli" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wszystkie role</SelectItem>
                                        {roles?.map((role) => (
                                            <SelectItem key={role.id} value={role.slug}>
                                                {role.name}
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
                                        <SelectItem value="true">Aktywny</SelectItem>
                                        <SelectItem value="false">Nieaktywny</SelectItem>
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

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users?.data?.map((user) => (
                        <Card key={user.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                            <Badge className={getStatusColor(user.is_active)}>
                                                {user.is_active ? 'Aktywny' : 'Nieaktywny'}
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
                                                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    Zobacz profil
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/users/${user.id}/edit`} className="flex items-center gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edytuj
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                                {user.is_active ? (
                                                    <>
                                                        <UserX className="h-4 w-4 mr-2" />
                                                        Dezaktywuj
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Aktywuj
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteUser(user)}
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
                                        <Mail className="h-4 w-4" />
                                        {user.email}
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {user.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Utworzono: {new Date(user.created_at).toLocaleDateString('pl-PL')}
                                    </div>
                                </div>

                                {user.roles && user.roles.length > 0 && (
                                    <div className="mt-4">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Role:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map((role) => (
                                                <Badge key={role.id} variant="secondary" className="text-xs">
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {(!users?.data || users.data.length === 0) && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak użytkowników</h3>
                            <p className="text-gray-600 mb-4">
                                Nie znaleziono użytkowników spełniających kryteria wyszukiwania.
                            </p>
                            <Button asChild>
                                <Link href="/admin/users/create">
                                    Dodaj pierwszego użytkownika
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {users?.data?.length > 0 && users?.meta?.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            {users.links?.prev && (
                                <Link href={users.links.prev}>
                                    <Button variant="outline">Poprzednia</Button>
                                </Link>
                            )}
                            <span className="text-sm text-gray-600">
                                Strona {users.meta.current_page} z {users.meta.last_page}
                            </span>
                            {users.links?.next && (
                                <Link href={users.links.next}>
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