import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    MapPin, 
    Calendar, 
    DollarSign,
    User,
    Package,
    FileText,
    Download,
    History,
    AlertTriangle
} from 'lucide-react';
import { Asset } from '@/types';

interface Props {
    asset: Asset;
}

export default function Show({ asset }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            router.delete(route('tenant.assets.destroy', asset.id), {
                onSuccess: () => {
                    router.visit(route('tenant.assets.index'));
                }
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'default',
            inactive: 'secondary',
            maintenance: 'destructive',
            retired: 'outline'
        } as const;

        const colors = {
            active: 'bg-green-500',
            inactive: 'bg-gray-500', 
            maintenance: 'bg-orange-500',
            retired: 'bg-red-500'
        };

        return (
            <Badge 
                variant={variants[status as keyof typeof variants] || 'secondary'}
                className={status === 'active' ? colors.active : undefined}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    return (
        <AppLayout>
            <Head title={`Asset: ${asset.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('tenant.assets.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Assets
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center space-x-3">
                                <Package className="h-6 w-6" />
                                <span>{asset.name}</span>
                                {getStatusBadge(asset.status)}
                            </h1>
                            <p className="text-gray-600">Asset Details</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('tenant.assets.edit', asset.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-base font-medium">{asset.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Asset Type</label>
                                    <p className="text-base">
                                        <Badge variant="outline">{asset.asset_type}</Badge>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Serial Number</label>
                                    <p className="text-base font-mono">
                                        {asset.serial_number || <span className="text-gray-400">Not specified</span>}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <p className="text-base">
                                        {getStatusBadge(asset.status)}
                                    </p>
                                </div>
                                {asset.description && (
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Description</label>
                                        <p className="text-base text-gray-700 mt-1">{asset.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Financial Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Purchase Cost</label>
                                    <p className="text-base font-medium">
                                        {formatCurrency(asset.purchase_cost)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Current Value</label>
                                    <p className="text-base font-medium">
                                        {formatCurrency(asset.current_value)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Depreciation</label>
                                    <p className="text-base">
                                        {asset.purchase_cost && asset.current_value ? (
                                            <span className={asset.current_value < asset.purchase_cost ? 'text-red-600' : 'text-green-600'}>
                                                {formatCurrency(asset.current_value - asset.purchase_cost)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="bg-white p-6 rounded-lg border">
                            <h2 className="text-lg font-semibold mb-4 flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Important Dates
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                                    <p className="text-base">{formatDate(asset.purchase_date)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created Date</label>
                                    <p className="text-base">{formatDate(asset.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Data */}
                        {asset.data && Object.keys(asset.data).length > 0 && (
                            <div className="bg-white p-6 rounded-lg border">
                                <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                                <div className="prose max-w-none">
                                    <pre className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                                        {JSON.stringify(asset.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Location & Assignment */}
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Location & Assignment
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Current Location</label>
                                    <p className="text-base">
                                        {asset.location ? (
                                            <span className="flex items-center space-x-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span>{asset.location.name}</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Unassigned</span>
                                        )}
                                    </p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                                    <p className="text-base">
                                        {asset.current_assignment?.user ? (
                                            <span className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>{asset.current_assignment.user.name}</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Unassigned</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Asset ID</span>
                                    <span className="text-sm font-medium">#{asset.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Created</span>
                                    <span className="text-sm">{formatDate(asset.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Last Updated</span>
                                    <span className="text-sm">{formatDate(asset.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-4">Actions</h3>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={route('tenant.assets.edit', asset.id)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Asset
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <History className="h-4 w-4 mr-2" />
                                    View History
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Details
                                </Button>
                                <Separator />
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Asset
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}