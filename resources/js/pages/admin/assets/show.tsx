import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
    Edit, 
    Package, 
    MapPin, 
    Calendar, 
    DollarSign, 
    User, 
    History, 
    ArrowLeft,
    MoreHorizontal,
    UserPlus,
    UserMinus,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Settings
} from 'lucide-react';
import type { Asset, Worker, BreadcrumbItem } from '@/types';

interface AssetShowProps {
    asset: Asset;
    workers?: Worker[];
}

export default function AssetShow({ asset, workers }: AssetShowProps) {
    const [selectedWorker, setSelectedWorker] = useState('');
    
    const { data, setData, post, processing } = useForm({
        worker_id: '',
    });

    const handleAssignAsset = () => {
        if (!selectedWorker) return;
        
        setData('worker_id', selectedWorker);
        post(`/admin/assets/${asset.id}/assign`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedWorker('');
                setData('worker_id', '');
            },
        });
    };

    const handleUnassignAsset = () => {
        router.post(`/admin/assets/${asset.id}/unassign`, {}, {
            preserveScroll: true,
        });
    };

    const handleToggleStatus = () => {
        router.patch(`/admin/assets/${asset.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteAsset = () => {
        if (confirm('Czy na pewno chcesz usunąć ten zasób? Ta akcja jest nieodwracalna.')) {
            router.delete(`/admin/assets/${asset.id}`, {
                onSuccess: () => {
                    router.visit('/admin/assets');
                },
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'retired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Aktywny';
            case 'inactive': return 'Nieaktywny';
            case 'maintenance': return 'Konserwacja';
            case 'retired': return 'Wycofany';
            default: return status;
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Zasoby', href: '/admin/assets' },
        { title: asset.name, href: `/admin/assets/${asset.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Zasób: ${asset.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/assets">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={getStatusColor(asset.status)}>
                                    {getStatusText(asset.status)}
                                </Badge>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600">{asset.asset_type}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/assets/${asset.id}/edit`}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edytuj
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleToggleStatus}>
                                    {asset.status === 'active' ? (
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
                                    onClick={handleDeleteAsset}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Usuń zasób
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="details">Szczegóły</TabsTrigger>
                        <TabsTrigger value="assignment">Przypisanie</TabsTrigger>
                        <TabsTrigger value="maintenance">Konserwacja</TabsTrigger>
                        <TabsTrigger value="history">Historia</TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <Label className="text-sm font-medium text-gray-700">Nazwa</Label>
                                        <p className="text-sm text-gray-900">{asset.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Typ zasobu</Label>
                                        <p className="text-sm text-gray-900">{asset.asset_type}</p>
                                    </div>
                                    {asset.serial_number && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Numer seryjny</Label>
                                            <p className="text-sm font-mono text-gray-900">{asset.serial_number}</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                                        <Badge className={getStatusColor(asset.status)}>
                                            {getStatusText(asset.status)}
                                        </Badge>
                                    </div>
                                    {asset.description && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Opis</Label>
                                            <p className="text-sm text-gray-900">{asset.description}</p>
                                        </div>
                                    )}
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
                                    {asset.purchase_date && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Data zakupu</Label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(asset.purchase_date).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>
                                    )}
                                    {asset.purchase_cost && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Koszt zakupu</Label>
                                            <p className="text-sm text-gray-900">
                                                {asset.purchase_cost.toLocaleString('pl-PL')} PLN
                                            </p>
                                        </div>
                                    )}
                                    {asset.current_value && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Aktualna wartość</Label>
                                            <p className="text-sm text-gray-900">
                                                {asset.current_value.toLocaleString('pl-PL')} PLN
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Data utworzenia</Label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(asset.created_at).toLocaleDateString('pl-PL')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location Information */}
                            {asset.location && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Lokalizacja
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Nazwa lokalizacji</Label>
                                            <p className="text-sm text-gray-900">{asset.location.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Adres</Label>
                                            <p className="text-sm text-gray-900">
                                                {asset.location.address}, {asset.location.city}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Current Assignment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Aktualne przypisanie
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {asset.current_assignment ? (
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Przypisany do</Label>
                                                <p className="text-sm text-gray-900">{asset.current_assignment.user.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Email</Label>
                                                <p className="text-sm text-gray-900">{asset.current_assignment.user.email}</p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={handleUnassignAsset}
                                                className="flex items-center gap-2"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                                Usuń przypisanie
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Zasób nie jest przypisany do nikogo</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Assignment Tab */}
                    <TabsContent value="assignment" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Zarządzanie przypisaniem
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {asset.current_assignment ? (
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-blue-900">
                                                    Aktualnie przypisany do: {asset.current_assignment.user.name}
                                                </p>
                                                <p className="text-sm text-blue-700">{asset.current_assignment.user.email}</p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                onClick={handleUnassignAsset}
                                                className="flex items-center gap-2"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                                Usuń przypisanie
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-600">Ten zasób nie jest przypisany do żadnego pracownika.</p>
                                        
                                        {workers && workers.length > 0 && (
                                            <div className="space-y-4">
                                                <Label htmlFor="worker-select">Wybierz pracownika do przypisania</Label>
                                                <div className="flex gap-2">
                                                    <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder="Wybierz pracownika..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {workers.map((worker) => (
                                                                <SelectItem key={worker.id} value={worker.id}>
                                                                    {worker.user.name} ({worker.user.email})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button 
                                                        onClick={handleAssignAsset}
                                                        disabled={!selectedWorker || processing}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                        Przypisz
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Maintenance Tab */}
                    <TabsContent value="maintenance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Historia konserwacji
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500">Historia konserwacji będzie dostępna w przyszłych wersjach.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Historia zmian
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {asset.audit_logs && asset.audit_logs.length > 0 ? (
                                    <div className="space-y-4">
                                        {asset.audit_logs.map((log, index) => (
                                            <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900">{log.action}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(log.created_at).toLocaleDateString('pl-PL')}
                                                    </p>
                                                </div>
                                                {log.user && (
                                                    <p className="text-sm text-gray-600">przez {log.user.name}</p>
                                                )}
                                                {log.old_values && (
                                                    <div className="mt-2 text-sm">
                                                        <p className="text-gray-600">Stare wartości:</p>
                                                        <pre className="text-xs bg-gray-50 p-2 rounded">
                                                            {JSON.stringify(log.old_values, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {log.new_values && (
                                                    <div className="mt-2 text-sm">
                                                        <p className="text-gray-600">Nowe wartości:</p>
                                                        <pre className="text-xs bg-gray-50 p-2 rounded">
                                                            {JSON.stringify(log.new_values, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Brak historii zmian dla tego zasobu.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}