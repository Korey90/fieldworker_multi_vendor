import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    Edit, 
    Mail, 
    Phone, 
    Calendar, 
    Shield, 
    UserCheck, 
    UserX, 
    Plus, 
    X,
    MoreHorizontal,
    Save,
    ArrowLeft
} from 'lucide-react';
import type { User, Role, Permission } from '@/types';

interface UserShowProps {
    user: User;
    availableRoles: Role[];
    allPermissions: Permission[];
}

export default function UserShow({ user, availableRoles, allPermissions }: UserShowProps) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
    const { data, setData, post, delete: destroy, processing, errors } = useForm({
        role_id: '',
    });

    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        is_active: user.is_active,
    });

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleAssignRole = () => {
        if (!data.role_id) return;
        
        post(`/admin/users/${user.id}/assign-role`, {
            preserveScroll: true,
            onSuccess: () => {
                setData('role_id', '');
            },
        });
    };

    const handleRemoveRole = (roleId: number) => {
        router.delete(`/admin/users/${user.id}/remove-role`, {
            data: { role_id: roleId },
            preserveScroll: true,
        });
    };

    const handleToggleStatus = () => {
        router.patch(`/admin/users/${user.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleUpdateProfile = () => {
        profileForm.put(`/admin/users/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingProfile(false);
            },
        });
    };

    const groupedPermissions = allPermissions.reduce((acc, permission) => {
        const group = permission.permission_group;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    const breadcrumbs = [
        { title: 'Użytkownicy', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Profil użytkownika - ${user.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/users">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Powrót do listy
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Profil użytkownika</h1>
                            <p className="text-gray-600">Szczegóły konta i zarządzanie uprawnieniami</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={handleToggleStatus}
                            className={user.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                        >
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
                        </Button>
                        <Link href={`/admin/users/${user.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edytuj
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <Avatar className="h-24 w-24 mx-auto mb-4">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-lg">
                                        {getUserInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-xl">{user.name}</CardTitle>
                                <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {user.is_active ? 'Aktywny' : 'Nieaktywny'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    {user.email}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {user.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    Utworzono: {new Date(user.created_at).toLocaleDateString('pl-PL')}
                                </div>
                                {user.worker && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="h-4 w-4 text-gray-400" />
                                        Pracownik terenowy
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="roles" className="w-full">
                            <TabsList>
                                <TabsTrigger value="roles">Role i uprawnienia</TabsTrigger>
                                <TabsTrigger value="permissions">Wszystkie uprawnienia</TabsTrigger>
                                <TabsTrigger value="activity">Aktywność</TabsTrigger>
                            </TabsList>

                            <TabsContent value="roles" className="space-y-6">
                                {/* Current Roles */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Przypisane role</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {user.roles && user.roles.length > 0 ? (
                                            <div className="space-y-3">
                                                {user.roles.map((role) => (
                                                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <div className="font-medium">{role.name}</div>
                                                            {role.description && (
                                                                <div className="text-sm text-gray-600">{role.description}</div>
                                                            )}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Uprawnienia: {role.permissions?.length || 0}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveRole(role.id)}
                                                            disabled={processing}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Brak przypisanych ról</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Assign New Role */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Przypisz nową rolę</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Wybierz rolę..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableRoles
                                                            .filter(role => !user.roles?.some(userRole => userRole.id === role.id))
                                                            .map((role) => (
                                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                                    <div>
                                                                        <div className="font-medium">{role.name}</div>
                                                                        <div className="text-sm text-gray-600">{role.description}</div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.role_id && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.role_id}</p>
                                                )}
                                            </div>
                                            <Button 
                                                onClick={handleAssignRole} 
                                                disabled={!data.role_id || processing}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Przypisz
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="permissions" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Wszystkie uprawnienia użytkownika</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Uprawnienia pochodzące z przypisanych ról
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {Object.keys(groupedPermissions).length > 0 ? (
                                            <div className="space-y-6">
                                                {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                                    <div key={group}>
                                                        <h4 className="font-medium text-gray-900 mb-3 capitalize">
                                                            {group.replace('_', ' ')}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {permissions.map((permission) => (
                                                                <div 
                                                                    key={permission.id} 
                                                                    className="p-3 border rounded-lg bg-gray-50"
                                                                >
                                                                    <div className="font-medium text-sm">{permission.name}</div>
                                                                    {permission.description && (
                                                                        <div className="text-xs text-gray-600 mt-1">
                                                                            {permission.description}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {permission.permission_key}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Brak uprawnień</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activity" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Ostatnia aktywność</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-500">Funkcjonalność aktywności będzie dostępna wkrótce.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}