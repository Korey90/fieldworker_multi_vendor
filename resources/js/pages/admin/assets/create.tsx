import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowLeft,
    Save,
    Package,
    MapPin,
    DollarSign,
    User
} from 'lucide-react';
import type { Location, Worker, BreadcrumbItem } from '@/types';

interface AssetCreateProps {
    locations: Location[];
    workers: Worker[];
}

export default function AssetCreate({ locations, workers }: AssetCreateProps) {
    const [selectedLocation, setSelectedLocation] = useState('none');
    const [selectedWorker, setSelectedWorker] = useState('none');
    const [selectedStatus, setSelectedStatus] = useState('active');

    const { data, setData, processing, errors } = useForm({
        name: '',
        description: '',
        asset_type: '',
        serial_number: '',
        purchase_date: '',
        purchase_cost: '',
        current_value: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/admin/assets', {
            name: data.name,
            description: data.description,
            asset_type: data.asset_type,
            serial_number: data.serial_number,
            purchase_date: data.purchase_date || undefined,
            purchase_cost: data.purchase_cost || undefined,
            current_value: data.current_value || undefined,
            status: selectedStatus,
            location_id: selectedLocation !== 'none' ? selectedLocation : undefined,
            assigned_to: selectedWorker !== 'none' ? selectedWorker : undefined,
        });
    };

    const statuses = [
        { value: 'active', label: 'Aktywny' },
        { value: 'inactive', label: 'Nieaktywny' },
        { value: 'maintenance', label: 'Konserwacja' },
        { value: 'retired', label: 'Wycofany' },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Zasoby',
            href: '/admin/assets',
        },
        {
            title: 'Dodaj zasób',
            href: '/admin/assets/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dodaj nowy zasób" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/assets">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Powrót do listy
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dodaj nowy zasób</h1>
                            <p className="text-gray-600">Utwórz nowy zasób w systemie</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Informacje podstawowe
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nazwa zasobu *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        placeholder="np. Laptop Dell XPS 13"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="asset_type">Typ zasobu *</Label>
                                    <Input
                                        id="asset_type"
                                        type="text"
                                        value={data.asset_type}
                                        onChange={(e) => setData('asset_type', e.target.value)}
                                        className={errors.asset_type ? 'border-red-500' : ''}
                                        placeholder="np. Laptop, Telefon, Samochód"
                                        required
                                    />
                                    {errors.asset_type && (
                                        <p className="text-sm text-red-600 mt-1">{errors.asset_type}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="serial_number">Numer seryjny</Label>
                                    <Input
                                        id="serial_number"
                                        type="text"
                                        value={data.serial_number}
                                        onChange={(e) => setData('serial_number', e.target.value)}
                                        className={errors.serial_number ? 'border-red-500' : ''}
                                        placeholder="np. ABC123XYZ"
                                    />
                                    {errors.serial_number && (
                                        <p className="text-sm text-red-600 mt-1">{errors.serial_number}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wybierz status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="description">Opis</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('description', e.target.value)}
                                        className={errors.description ? 'border-red-500' : ''}
                                        placeholder="Opis zasobu..."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Informacje finansowe
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="purchase_date">Data zakupu</Label>
                                    <Input
                                        id="purchase_date"
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={(e) => setData('purchase_date', e.target.value)}
                                        className={errors.purchase_date ? 'border-red-500' : ''}
                                    />
                                    {errors.purchase_date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.purchase_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="purchase_cost">Koszt zakupu (PLN)</Label>
                                    <Input
                                        id="purchase_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_cost}
                                        onChange={(e) => setData('purchase_cost', e.target.value)}
                                        className={errors.purchase_cost ? 'border-red-500' : ''}
                                        placeholder="0.00"
                                    />
                                    {errors.purchase_cost && (
                                        <p className="text-sm text-red-600 mt-1">{errors.purchase_cost}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="current_value">Aktualna wartość (PLN)</Label>
                                    <Input
                                        id="current_value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.current_value}
                                        onChange={(e) => setData('current_value', e.target.value)}
                                        className={errors.current_value ? 'border-red-500' : ''}
                                        placeholder="0.00"
                                    />
                                    {errors.current_value && (
                                        <p className="text-sm text-red-600 mt-1">{errors.current_value}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Lokalizacja
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="location">Lokalizacja</Label>
                                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wybierz lokalizację" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Brak lokalizacji</SelectItem>
                                            {locations?.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.name} - {location.city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Przypisanie
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="worker">Przypisz do pracownika</Label>
                                    <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wybierz pracownika" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nieprzypisany</SelectItem>
                                            {workers?.map((worker) => (
                                                <SelectItem key={worker.id} value={worker.id}>
                                                    {worker.user.name} ({worker.user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link href="/admin/assets">
                            <Button type="button" variant="outline">
                                Anuluj
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Zapisywanie...' : 'Utwórz zasób'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}