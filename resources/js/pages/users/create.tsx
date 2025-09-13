import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft,
    Save,
    User,
    Shield,
    Eye,
    EyeOff
} from 'lucide-react';
import type { Role, BreadcrumbItem } from '@/types';

interface UserCreateProps {
    roles: Role[];
}

export default function UserCreate({ roles }: UserCreateProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    const { data, setData, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        userData: {} as Record<string, any>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use router.post with proper data structure
        router.post('/admin/users', {
            name: data.name,
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            phone: data.phone,
            is_active: isActive,
            roles: selectedRoles,
            data: data.userData, // Send userData as 'data' field
        });
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setSelectedRoles(prev => [...prev, roleId]);
        } else {
            setSelectedRoles(prev => prev.filter(id => id !== roleId));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Użytkownicy',
            href: '/admin/users',
        },
        {
            title: 'Dodaj użytkownika',
            href: '/admin/users/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dodaj nowego użytkownika" />

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
                            <h1 className="text-3xl font-bold text-gray-900">Dodaj nowego użytkownika</h1>
                            <p className="text-gray-600">Utwórz nowe konto użytkownika w systemie</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList>
                            <TabsTrigger value="basic">Podstawowe dane</TabsTrigger>
                            <TabsTrigger value="roles">Role i uprawnienia</TabsTrigger>
                            <TabsTrigger value="additional">Dodatkowe dane</TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Podstawowe informacje
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Imię i nazwisko *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Jan Kowalski"
                                                className={errors.name ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Adres email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="jan.kowalski@example.com"
                                                className={errors.email ? 'border-red-500' : ''}
                                                required
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="password">Hasło *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Wprowadź hasło"
                                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation">Potwierdź hasło *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPasswordConfirm ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Potwierdź hasło"
                                                    className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Numer telefonu</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="+48 123 456 789"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2 pt-8">
                                            <Checkbox
                                                id="is_active"
                                                checked={isActive}
                                                onCheckedChange={(checked) => {
                                                    setIsActive(checked === true);
                                                }}
                                            />
                                            <Label htmlFor="is_active">Konto aktywne</Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Roles Tab */}
                        <TabsContent value="roles" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role i uprawnienia
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Wybierz role dla użytkownika. Role określają dostępne funkcje w systemie.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {roles.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={selectedRoles.includes(role.id)}
                                                        onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                                                    />
                                                    <div className="flex-1">
                                                        <Label 
                                                            htmlFor={`role-${role.id}`}
                                                            className="font-medium cursor-pointer"
                                                        >
                                                            {role.name}
                                                        </Label>
                                                        {role.description && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {role.description}
                                                            </p>
                                                        )}
                                                        {role.permissions && role.permissions.length > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {role.permissions.length} uprawnień
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak dostępnych ról</h3>
                                            <p className="text-gray-600">
                                                Nie znaleziono żadnych ról w systemie.
                                            </p>
                                        </div>
                                    )}
                                    {/* Role assignment errors would be handled by backend validation */}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Additional Data Tab */}
                        <TabsContent value="additional" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dodatkowe dane</CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Opcjonalne dodatkowe informacje o użytkowniku (format JSON).
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="userData">Dodatkowe dane (JSON)</Label>
                                        <textarea
                                            id="userData"
                                            rows={8}
                                            value={JSON.stringify(data.userData, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setData('userData', parsed);
                                                } catch {
                                                    // Invalid JSON, keep the string value for now
                                                }
                                            }}
                                            placeholder='{\n  "department": "IT",\n  "position": "Developer",\n  "notes": ""\n}'
                                            className={`w-full p-3 border rounded-md font-mono text-sm ${errors.userData ? 'border-red-500' : ''}`}
                                        />
                                        {errors.userData && (
                                            <p className="text-sm text-red-600 mt-1">{errors.userData}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">
                                            Wprowadź poprawny format JSON. Pozostaw puste jeśli nie potrzebujesz dodatkowych danych.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Link href="/admin/users">
                            <Button variant="outline">
                                Anuluj
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Tworzenie...' : 'Utwórz użytkownika'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}