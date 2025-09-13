import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Tenant, Feature } from '@/types';
import { ArrowLeftIcon, BuildingIcon, ShieldIcon, UserIcon, HardDriveIcon } from 'lucide-react';

interface TenantEditProps {
    tenant: Tenant & {
        quota_summary?: {
            current_users: number;
            current_storage_gb: number;
            max_users: number;
            max_storage_gb: number;
        };
        features?: Feature[];
    };
    sectors: Array<{ code: string; name: string }>;
    features: Feature[];
}

export default function TenantEdit({ tenant, sectors, features }: TenantEditProps) {
    const { data, setData, put, processing, errors, isDirty } = useForm({
        name: tenant.name || '',
        sector: tenant.sector || '',
        status: tenant.status || 'active',
        description: tenant.description || '',
        max_users: tenant.quota_summary?.max_users || 10,
        max_storage_gb: tenant.quota_summary?.max_storage_gb || 5,
        features: tenant.features?.map(f => f.id) || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.tenants.update', tenant.id));
    };

    const handleFeatureToggle = (featureId: number) => {
        const currentFeatures = [...data.features];
        const index = currentFeatures.indexOf(featureId);
        
        if (index === -1) {
            currentFeatures.push(featureId);
        } else {
            currentFeatures.splice(index, 1);
        }
        
        setData('features', currentFeatures);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUsagePercentage = (current: number, max: number) => {
        return Math.min(Math.round((current / max) * 100), 100);
    };

    return (
        <AppLayout>
            <Head title={`Admin - Edit Tenant: ${tenant.name}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href={route('admin.tenants.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Tenants
                        </Link>
                        <Link
                            href={route('admin.tenants.show', tenant.id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            View Details
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <BuildingIcon className="h-8 w-8 text-blue-600" />
                                Edit Tenant: {tenant.name}
                            </h1>
                            <p className="text-gray-600">Update tenant settings and configuration</p>
                        </div>
                        <Badge className={getStatusColor(tenant.status)}>
                            {tenant.status}
                        </Badge>
                    </div>
                </div>

                {/* Current Usage Stats (if available) */}
                {tenant.quota_summary && (
                    <div className="mb-6">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3 text-gray-700">Current Usage</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Users Usage */}
                                <div className="flex items-center gap-3">
                                    <UserIcon className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Users</span>
                                            <span>{tenant.quota_summary.current_users} / {tenant.quota_summary.max_users}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${getUsagePercentage(tenant.quota_summary.current_users, tenant.quota_summary.max_users)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Storage Usage */}
                                <div className="flex items-center gap-3">
                                    <HardDriveIcon className="h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Storage</span>
                                            <span>{tenant.quota_summary.current_storage_gb.toFixed(1)} / {tenant.quota_summary.max_storage_gb} GB</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full" 
                                                style={{ width: `${getUsagePercentage(tenant.quota_summary.current_storage_gb, tenant.quota_summary.max_storage_gb)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Form */}
                <div className="max-w-4xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Basic Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        🏢 Basic Information
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Tenant Name */}
                                        <div>
                                            <Label htmlFor="name">Tenant Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-red-500' : ''}
                                                placeholder="e.g., ABC Construction Company"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                This will be the organization name displayed throughout the system
                                            </p>
                                        </div>

                                        {/* Sector */}
                                        <div>
                                            <Label htmlFor="sector">Sector *</Label>
                                            <select
                                                id="sector"
                                                value={data.sector}
                                                onChange={(e) => setData('sector', e.target.value)}
                                                className={`w-full border rounded px-3 py-2 ${errors.sector ? 'border-red-500' : ''}`}
                                            >
                                                <option value="">Select a sector</option>
                                                {sectors.map((sector) => (
                                                    <option key={sector.code} value={sector.code}>
                                                        {sector.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.sector && (
                                                <p className="text-red-500 text-sm mt-1">{errors.sector}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Choose the primary industry sector for this tenant
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <select
                                                id="status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value as 'active' | 'suspended' | 'inactive')}
                                                className="w-full border rounded px-3 py-2"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Changing status affects tenant access immediately
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                                className={errors.description ? 'border-red-500' : ''}
                                                placeholder="Optional description about this tenant organization..."
                                                rows={3}
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                {/* Features */}
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <ShieldIcon className="h-5 w-5" />
                                        Features & Permissions
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {features.map((feature) => (
                                            <div key={feature.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id={`feature-${feature.id}`}
                                                    checked={data.features.includes(feature.id)}
                                                    onChange={() => handleFeatureToggle(feature.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <label 
                                                        htmlFor={`feature-${feature.id}`}
                                                        className="font-medium text-sm cursor-pointer"
                                                    >
                                                        {feature.name}
                                                    </label>
                                                    {feature.description && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {feature.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {features.length === 0 && (
                                        <p className="text-gray-500 text-center py-4">
                                            No features available to configure
                                        </p>
                                    )}
                                </Card>
                            </div>

                            {/* Right Column - Quotas */}
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        📊 Resource Quotas
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Max Users */}
                                        <div>
                                            <Label htmlFor="max_users">Maximum Users</Label>
                                            <Input
                                                id="max_users"
                                                type="number"
                                                min="1"
                                                max="1000"
                                                value={data.max_users}
                                                onChange={(e) => setData('max_users', parseInt(e.target.value) || 10)}
                                                className={errors.max_users ? 'border-red-500' : ''}
                                            />
                                            {errors.max_users && (
                                                <p className="text-red-500 text-sm mt-1">{errors.max_users}</p>
                                            )}
                                            {tenant.quota_summary && data.max_users < tenant.quota_summary.current_users && (
                                                <p className="text-amber-600 text-sm mt-1">
                                                    ⚠️ Current users ({tenant.quota_summary.current_users}) exceed new limit
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Maximum number of users this tenant can have
                                            </p>
                                        </div>

                                        {/* Max Storage */}
                                        <div>
                                            <Label htmlFor="max_storage_gb">Storage Limit (GB)</Label>
                                            <Input
                                                id="max_storage_gb"
                                                type="number"
                                                min="1"
                                                max="1000"
                                                step="0.5"
                                                value={data.max_storage_gb}
                                                onChange={(e) => setData('max_storage_gb', parseFloat(e.target.value) || 5)}
                                                className={errors.max_storage_gb ? 'border-red-500' : ''}
                                            />
                                            {errors.max_storage_gb && (
                                                <p className="text-red-500 text-sm mt-1">{errors.max_storage_gb}</p>
                                            )}
                                            {tenant.quota_summary && data.max_storage_gb < tenant.quota_summary.current_storage_gb && (
                                                <p className="text-amber-600 text-sm mt-1">
                                                    ⚠️ Current storage ({tenant.quota_summary.current_storage_gb.toFixed(1)} GB) exceeds new limit
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Maximum storage space for files and attachments
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Warnings */}
                                {isDirty && (
                                    <Card className="p-6 bg-amber-50 border-amber-200">
                                        <h4 className="font-semibold mb-3 text-amber-800">⚠️ Unsaved Changes</h4>
                                        <div className="space-y-2 text-sm text-amber-700">
                                            <div>• You have unsaved changes</div>
                                            <div>• Changes will affect this tenant immediately</div>
                                            <div>• Users may be logged out if status changes</div>
                                        </div>
                                    </Card>
                                )}

                                {/* Guidelines */}
                                <Card className="p-6 bg-blue-50">
                                    <h4 className="font-semibold mb-3 text-blue-800">💡 Edit Tips</h4>
                                    <div className="space-y-2 text-sm text-blue-700">
                                        <div>• Status changes affect access immediately</div>
                                        <div>• Reducing quotas may affect active users</div>
                                        <div>• Feature changes apply to new sessions</div>
                                        <div>• Consider notifying users before major changes</div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Actions */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Last updated: {new Date(tenant.updated_at).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={route('admin.tenants.show', tenant.id)}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing || !isDirty}
                                        className={isDirty ? 'bg-blue-600' : ''}
                                    >
                                        {processing ? 'Saving Changes...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}