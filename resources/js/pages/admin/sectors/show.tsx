import { Head, Link } from '@inertiajs/react';
import { 
    Building2, 
    MapPin, 
    Users, 
    Edit, 
    ArrowLeft, 
    CheckCircle, 
    XCircle,
    Calendar
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sector } from '@/types';

interface Props {
    sector: Sector;
}

export default function SectorsShow({ sector }: Props) {
    return (
        <AppLayout>
            <Head title={`Sector: ${sector.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/sectors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Sectors
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <Building2 className="h-8 w-8" />
                                {sector.name}
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                Sector Code: 
                                <Badge variant="outline">{sector.code}</Badge>
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/sectors/${sector.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Sector
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sector Information</CardTitle>
                                <CardDescription>
                                    Basic information about this sector
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Code
                                        </label>
                                        <p className="mt-1">
                                            <Badge variant="outline">{sector.code}</Badge>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </label>
                                        <p className="mt-1">
                                            {sector.is_active ? (
                                                <Badge variant="default">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Name
                                    </label>
                                    <p className="mt-1 text-lg font-medium">{sector.name}</p>
                                </div>

                                {sector.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Description
                                        </label>
                                        <p className="mt-1 text-sm">{sector.description}</p>
                                    </div>
                                )}

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Created At
                                        </label>
                                        <p className="mt-1 text-sm flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(sector.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Updated At
                                        </label>
                                        <p className="mt-1 text-sm flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(sector.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Locations */}
                        {sector.locations && sector.locations.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Associated Locations ({sector.locations.length})
                                    </CardTitle>
                                    <CardDescription>
                                        Locations using this sector
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {sector.locations.map((location) => (
                                            <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{location.name}</p>
                                                    {location.address && (
                                                        <p className="text-sm text-muted-foreground">{location.address}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tenants */}
                        {sector.tenants && sector.tenants.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Associated Tenants ({sector.tenants.length})
                                    </CardTitle>
                                    <CardDescription>
                                        Companies operating in this sector
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {sector.tenants.map((tenant) => (
                                            <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{tenant.name}</p>
                                                    <p className="text-sm text-muted-foreground">Tenant ID: {tenant.id}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Locations</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{sector.locations_count || 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Tenants</span>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{sector.tenants_count || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full" asChild>
                                    <Link href={`/admin/sectors/${sector.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Sector
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}