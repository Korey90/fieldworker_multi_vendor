import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Edit, 
    Key, 
    Shield,
    ArrowLeft,
    Trash2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import type { Permission } from '@/types';

interface PermissionShowProps {
    permission: Permission;
}


export default function PermissionShow({ permission }: PermissionShowProps) {
    const handleDeletePermission = () => {
        if (confirm(`Czy na pewno chcesz usunąć uprawnienie "${permission.name}"? Ta akcja jest nieodwracalna.`)) {
            router.delete(`/admin/permissions/${permission.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleToggleStatus = () => {
        router.patch(`/admin/permissions/${permission.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    
const breadcrumbs = [
    { title: 'Permissions', href: '/admin/permissions' },
    { title: 'Show', href: '' },
];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Uprawnienie - ${permission.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/permissions">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Powrót do listy
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Szczegóły uprawnienia</h1>
                            <p className="text-gray-600">Zarządzanie uprawnieniem systemu</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={handleToggleStatus}
                            className={permission.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                        >
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
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleDeletePermission}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Usuń
                        </Button>
                        <Link href={`/admin/permissions/${permission.id}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edytuj
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Permission Info Card */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <Key className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                                <CardTitle className="text-xl">{permission.name}</CardTitle>
                                <Badge className={getStatusColor(permission.is_active)}>
                                    {permission.is_active ? 'Aktywne' : 'Nieaktywne'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {permission.description && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-2">Opis:</div>
                                        <p className="text-sm text-gray-600">{permission.description}</p>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Klucz uprawnienia:</div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            {permission.permission_key}
                                        </code>
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Slug:</div>
                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            {permission.slug}
                                        </code>
                                    </div>

                                    {permission.key && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">Klucz dodatkowy:</div>
                                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                {permission.key}
                                            </code>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <div className="text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <span>Grupa: {permission.permission_group}</span>
                                        </div>
                                        <div className="mt-2">
                                            Role: {permission.roles?.length || 0}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="roles" className="w-full">
                            <TabsList>
                                <TabsTrigger value="roles">Role ({permission.roles?.length || 0})</TabsTrigger>
                                <TabsTrigger value="details">Szczegóły techniczne</TabsTrigger>
                            </TabsList>

                            <TabsContent value="roles" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Role korzystające z tego uprawnienia</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Lista ról które mają przypisane to uprawnienie
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {permission.roles && permission.roles.length > 0 ? (
                                            <div className="space-y-3">
                                                {permission.roles.map((role) => (
                                                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div>
                                                            <div className="font-medium">{role.name}</div>
                                                            {role.description && (
                                                                <div className="text-sm text-gray-600">{role.description}</div>
                                                            )}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Użytkownicy: {role.users?.length || 0}
                                                            </div>
                                                        </div>
                                                        <Link href={`/admin/roles/${role.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                Zobacz rolę
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">
                                                Brak ról korzystających z tego uprawnienia
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Szczegóły techniczne</CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Informacje techniczne o uprawnieniu
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-gray-700">ID</div>
                                                <div className="text-sm text-gray-600">{permission.id}</div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-gray-700">Grupa uprawnień</div>
                                                <Badge variant="outline">{permission.permission_group}</Badge>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-gray-700">Status</div>
                                                <Badge className={getStatusColor(permission.is_active)}>
                                                    {permission.is_active ? 'Aktywne' : 'Nieaktywne'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium text-gray-700">Liczba ról</div>
                                                <div className="text-sm text-gray-600">{permission.roles?.length || 0}</div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Klucze identyfikacyjne:</div>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs text-gray-500">permission_key:</span>
                                                    <br />
                                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                        {permission.permission_key}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">slug:</span>
                                                    <br />
                                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                        {permission.slug}
                                                    </code>
                                                </div>
                                                {permission.key && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">key:</span>
                                                        <br />
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                            {permission.key}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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