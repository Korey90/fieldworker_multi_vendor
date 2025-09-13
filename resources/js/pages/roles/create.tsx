import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    ArrowLeft,
    Save,
    Shield,
    Key
} from 'lucide-react';
import type { Permission } from '@/types';

interface RoleCreateProps {
    permissions: Record<string, Permission[]>;
}

export default function RoleCreate({ permissions }: RoleCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        slug: '',
        permissions: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/roles');
    };

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId));
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (name: string) => {
        setData(data => ({
            ...data,
            name,
            slug: data.slug || generateSlug(name)
        }));
    };

    const breadcrumbs = [
        { title: 'Roles', href: '/admin/roles' },
        { title: 'Create', href: '/admin/roles/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dodaj nową rolę" />

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
                            <h1 className="text-3xl font-bold text-gray-900">Dodaj nową rolę</h1>
                            <p className="text-gray-600">Utwórz nową rolę i przypisz jej uprawnienia</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Podstawowe informacje
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Nazwa roli</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            placeholder="np. Administrator"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            placeholder="administrator"
                                            className={errors.slug ? 'border-red-500' : ''}
                                        />
                                        {errors.slug && (
                                            <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Unikalny identyfikator roli (bez spacji, małe litery)
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Opis (opcjonalny)</Label>
                                        <Input
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Krótki opis roli..."
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Permissions */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        Uprawnienia ({data.permissions.length} wybranych)
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Wybierz uprawnienia które będą przypisane do tej roli
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.entries(permissions).map(([group, groupPermissions]) => (
                                        <div key={group}>
                                            <h4 className="font-medium text-gray-900 mb-3 capitalize">
                                                {group.replace('_', ' ')}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {groupPermissions.map((permission) => (
                                                    <div 
                                                        key={permission.id} 
                                                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={data.permissions.includes(permission.id)}
                                                            onCheckedChange={(checked) => 
                                                                handlePermissionChange(permission.id, checked as boolean)
                                                            }
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <Label 
                                                                htmlFor={`permission-${permission.id}`}
                                                                className="text-sm font-medium cursor-pointer"
                                                            >
                                                                {permission.name}
                                                            </Label>
                                                            {permission.description && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    {permission.description}
                                                                </p>
                                                            )}
                                                            <code className="text-xs text-gray-500 mt-1 block">
                                                                {permission.permission_key}
                                                            </code>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {Object.keys(permissions).length === 0 && (
                                        <p className="text-gray-500 text-center py-8">
                                            Brak dostępnych uprawnień
                                        </p>
                                    )}

                                    {errors.permissions && (
                                        <p className="text-sm text-red-600">{errors.permissions}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Link href="/admin/roles">
                            <Button variant="outline">
                                Anuluj
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Zapisywanie...' : 'Zapisz rolę'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}