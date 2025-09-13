import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowLeft,
    Save,
    Key
} from 'lucide-react';
import type { Permission } from '@/types';

interface PermissionEditProps {
    permission: Permission;
    existingGroups: string[];
}

export default function PermissionEdit({ permission, existingGroups }: PermissionEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
        key: permission.key || '',
        permission_key: permission.permission_key,
        permission_group: permission.permission_group,
        slug: permission.slug,
        description: permission.description || '',
        is_active: permission.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/permissions/${permission.id}`);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const generatePermissionKey = (name: string, group: string) => {
        const nameKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const groupKey = group.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        return `${groupKey}.${nameKey}`;
    };

    const handleNameChange = (name: string) => {
        setData(data => ({
            ...data,
            name,
            slug: generateSlug(name),
            permission_key: generatePermissionKey(name, data.permission_group)
        }));
    };

    const handleGroupChange = (group: string) => {
        setData(data => ({
            ...data,
            permission_group: group,
            permission_key: generatePermissionKey(data.name, group)
        }));
    };

    const breadcrumbs = [
        { title: 'Permissions', href: '/admin/permissions' },
        { title: 'Edit', href: '' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edytuj uprawnienie - ${permission.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={`/admin/permissions/${permission.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Powrót do uprawnienia
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edytuj uprawnienie</h1>
                            <p className="text-gray-600">Modyfikuj uprawnienie {permission.name}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Podstawowe informacje
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nazwa uprawnienia</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="np. Zarządzanie użytkownikami"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="permission_group">Grupa uprawnień</Label>
                                    <div className="flex gap-2">
                                        <Select 
                                            value={data.permission_group} 
                                            onValueChange={handleGroupChange}
                                        >
                                            <SelectTrigger className={errors.permission_group ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Wybierz lub utwórz grupę" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {existingGroups.map((group) => (
                                                    <SelectItem key={group} value={group}>
                                                        {group.replace('_', ' ').toUpperCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Lub wpisz nową grupę"
                                            value={data.permission_group}
                                            onChange={(e) => handleGroupChange(e.target.value)}
                                            className="w-1/2"
                                        />
                                    </div>
                                    {errors.permission_group && (
                                        <p className="text-sm text-red-600 mt-1">{errors.permission_group}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Opis (opcjonalny)</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Krótki opis uprawnienia..."
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">Uprawnienie aktywne</Label>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        <div>Role korzystające: {permission.roles?.length || 0}</div>
                                        <div>ID: {permission.id}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Szczegóły techniczne</CardTitle>
                                <p className="text-sm text-gray-600">
                                    Identyfikatory używane przez system
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="permission_key">Klucz uprawnienia</Label>
                                    <Input
                                        id="permission_key"
                                        value={data.permission_key}
                                        onChange={(e) => setData('permission_key', e.target.value)}
                                        placeholder="np. users.manage"
                                        className={errors.permission_key ? 'border-red-500' : ''}
                                    />
                                    {errors.permission_key && (
                                        <p className="text-sm text-red-600 mt-1">{errors.permission_key}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unikalny klucz używany przez system (format: grupa.akcja)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="manage-users"
                                        className={errors.slug ? 'border-red-500' : ''}
                                    />
                                    {errors.slug && (
                                        <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Slug URL-friendly (bez spacji, małe litery)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="key">Klucz dodatkowy (opcjonalny)</Label>
                                    <Input
                                        id="key"
                                        value={data.key}
                                        onChange={(e) => setData('key', e.target.value)}
                                        placeholder="np. manage_users"
                                        className={errors.key ? 'border-red-500' : ''}
                                    />
                                    {errors.key && (
                                        <p className="text-sm text-red-600 mt-1">{errors.key}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dodatkowy klucz dla kompatybilności wstecznej
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Link href={`/admin/permissions/${permission.id}`}>
                            <Button variant="outline">
                                Anuluj
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Zapisywanie...' : 'Zapisz zmiany'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}