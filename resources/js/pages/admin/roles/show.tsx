import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Edit, 
    Shield, 
    Users, 
    Settings,
    ArrowLeft,
    Trash2,
    Key
} from 'lucide-react';
import type { Role, Permission } from '@/types';

interface RoleShowProps {
    role: Role;
    availablePermissions: Record<string, Permission[]>;
}

export default function RoleShow({ role, availablePermissions }: RoleShowProps) {
    const handleDeleteRole = () => {
        if (confirm(`Czy na pewno chcesz usunąć rolę "${role.name}"? Ta akcja jest nieodwracalna.`)) {
            router.delete(`/admin/roles/${role.id}`, {
                preserveScroll: true,
            });
        }
    };

    const groupedCurrentPermissions = role.permissions?.reduce((acc, permission) => {
        const group = permission.permission_group;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>) || {};

    const breadcrumbs = [
        { title: 'Role', href: '/admin/roles' },
        { title: role.name, href: `/admin/roles/${role.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rola - ${role.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/roles">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Powrót do listy
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Szczegóły roli</h1>
                            <p className="text-gray-600">Zarządzanie rolą i jej uprawnieniami</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={handleDeleteRole}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Usuń rolę
                        </Button>
                        <Link href={`/admin/roles/${role.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edytuj
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Role Info Card */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <Shield className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                                <CardTitle className="text-xl">{role.name}</CardTitle>
                                <Badge variant="secondary" className="mt-2">
                                    {role.slug}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {role.description && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-2">Opis:</div>
                                        <p className="text-sm text-gray-600">{role.description}</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span>{role.users?.length || 0} użytkowników</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                    <Settings className="h-4 w-4 text-gray-400" />
                                    <span>{role.permissions?.length || 0} uprawnień</span>
                                </div>

                                {role.tenant_id && (
                                    <div className="text-xs text-gray-500 border-t pt-2">
                                        Rola specyficzna dla organizacji
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="permissions" className="w-full">
                            <TabsList>
                                <TabsTrigger value="permissions">Uprawnienia</TabsTrigger>
                                <TabsTrigger value="users">Użytkownicy</TabsTrigger>
                                <TabsTrigger value="manage">Zarządzaj</TabsTrigger>
                            </TabsList>

                            <TabsContent value="permissions" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Przypisane uprawnienia</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Uprawnienia przypisane do tej roli ({role.permissions?.length || 0})
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {Object.keys(groupedCurrentPermissions).length > 0 ? (
                                            <div className="space-y-6">
                                                {Object.entries(groupedCurrentPermissions).map(([group, permissions]) => (
                                                    <div key={group}>
                                                        <h4 className="font-medium text-gray-900 mb-3 capitalize">
                                                            {group.replace('_', ' ')}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {permissions.map((permission) => (
                                                                <div 
                                                                    key={permission.id} 
                                                                    className="p-3 border rounded-lg bg-green-50 border-green-200"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Key className="h-4 w-4 text-green-600" />
                                                                        <div className="font-medium text-sm">{permission.name}</div>
                                                                    </div>
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
                                            <p className="text-gray-500 text-center py-8">
                                                Brak przypisanych uprawnień
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="users" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Użytkownicy z tą rolą</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Lista użytkowników którzy mają przypisaną tę rolę ({role.users?.length || 0})
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {role.users && role.users.length > 0 ? (
                                            <div className="space-y-3">
                                                {role.users.map((user) => (
                                                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-gray-600">{user.email}</div>
                                                        </div>
                                                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                            {user.is_active ? 'Aktywny' : 'Nieaktywny'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">
                                                Brak użytkowników z tą rolą
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="manage" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Zarządzanie rolą</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Dodaj lub usuń uprawnienia z tej roli
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-500">
                                            Funkcjonalność zarządzania uprawnieniami będzie dostępna wkrótce.
                                            Użyj przycisku "Edytuj" aby modyfikować rolę.
                                        </p>
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