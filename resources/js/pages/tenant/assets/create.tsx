import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Asset, Location } from '@/types';

interface Props {
    asset?: Asset;
    locations: Location[];
    assetTypes: string[];
}

interface FormData {
    name: string;
    description: string;
    asset_type: string;
    serial_number: string;
    purchase_date: string;
    purchase_cost: string;
    current_value: string;
    status: string;
    location_id: string;
    data: Record<string, any>;
}

interface Errors {
    [key: string]: string;
}

export default function CreateEdit({ asset, locations, assetTypes }: Props) {
    const isEditing = !!asset;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const [formData, setFormData] = useState<FormData>({
        name: asset?.name || '',
        description: asset?.description || '',
        asset_type: asset?.asset_type || '',
        serial_number: asset?.serial_number || '',
        purchase_date: asset?.purchase_date || '',
        purchase_cost: asset?.purchase_cost?.toString() || '',
        current_value: asset?.current_value?.toString() || '',
        status: asset?.status || 'active',
        location_id: asset?.location_id?.toString() || 'no_location',
        data: asset?.data || {},
    });

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Asset name is required';
        }

        if (!formData.asset_type) {
            newErrors.asset_type = 'Asset type is required';
        }

        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        if (formData.purchase_cost && isNaN(Number(formData.purchase_cost))) {
            newErrors.purchase_cost = 'Purchase cost must be a valid number';
        }

        if (formData.current_value && isNaN(Number(formData.current_value))) {
            newErrors.current_value = 'Current value must be a valid number';
        }

        if (formData.purchase_date && !Date.parse(formData.purchase_date)) {
            newErrors.purchase_date = 'Purchase date must be a valid date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        const submitData = {
            ...formData,
            purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
            current_value: formData.current_value ? Number(formData.current_value) : null,
            location_id: formData.location_id && formData.location_id !== 'no_location' ? Number(formData.location_id) : null,
        };

        try {
            if (isEditing) {
                router.put(route('tenant.assets.update', asset.id), submitData, {
                    onSuccess: () => {
                        router.visit(route('tenant.assets.show', asset.id));
                    },
                    onError: (errors) => {
                        setErrors(errors);
                        setIsSubmitting(false);
                    },
                });
            } else {
                router.post(route('tenant.assets.store'), submitData, {
                    onSuccess: (page: any) => {
                        // Assuming the response contains the new asset ID
                        const newAssetId = page.props?.asset?.id;
                        if (newAssetId) {
                            router.visit(route('tenant.assets.show', newAssetId));
                        } else {
                            router.visit(route('tenant.assets.index'));
                        }
                    },
                    onError: (errors) => {
                        setErrors(errors);
                        setIsSubmitting(false);
                    },
                });
            }
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? `Edit Asset: ${asset.name}` : 'Create New Asset'} />
            
            <div className="space-y-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={isEditing ? route('tenant.assets.show', asset.id) : route('tenant.assets.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {isEditing ? 'Back to Asset' : 'Back to Assets'}
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center space-x-3">
                                <Package className="h-6 w-6" />
                                <span>{isEditing ? `Edit Asset: ${asset.name}` : 'Create New Asset'}</span>
                            </h1>
                            <p className="text-gray-600">
                                {isEditing ? 'Update asset information' : 'Add a new asset to your inventory'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Essential details about the asset
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Asset Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter asset name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="asset_type">Asset Type *</Label>
                                    <Select 
                                        value={formData.asset_type} 
                                        onValueChange={(value) => handleInputChange('asset_type', value)}
                                    >
                                        <SelectTrigger className={errors.asset_type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select asset type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assetTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asset_type && (
                                        <p className="text-sm text-red-600">{errors.asset_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="serial_number">Serial Number</Label>
                                    <Input
                                        id="serial_number"
                                        type="text"
                                        value={formData.serial_number}
                                        onChange={(e) => handleInputChange('serial_number', e.target.value)}
                                        placeholder="Enter serial number"
                                        className={errors.serial_number ? 'border-red-500' : ''}
                                    />
                                    {errors.serial_number && (
                                        <p className="text-sm text-red-600">{errors.serial_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="retired">Retired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Enter asset description"
                                        rows={3}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Information</CardTitle>
                            <CardDescription>
                                Cost and valuation details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_cost">Purchase Cost ($)</Label>
                                    <Input
                                        id="purchase_cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.purchase_cost}
                                        onChange={(e) => handleInputChange('purchase_cost', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.purchase_cost ? 'border-red-500' : ''}
                                    />
                                    {errors.purchase_cost && (
                                        <p className="text-sm text-red-600">{errors.purchase_cost}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="current_value">Current Value ($)</Label>
                                    <Input
                                        id="current_value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.current_value}
                                        onChange={(e) => handleInputChange('current_value', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.current_value ? 'border-red-500' : ''}
                                    />
                                    {errors.current_value && (
                                        <p className="text-sm text-red-600">{errors.current_value}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purchase_date">Purchase Date</Label>
                                    <Input
                                        id="purchase_date"
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                                        className={errors.purchase_date ? 'border-red-500' : ''}
                                    />
                                    {errors.purchase_date && (
                                        <p className="text-sm text-red-600">{errors.purchase_date}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Location Assignment</CardTitle>
                            <CardDescription>
                                Where is this asset located?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="location_id">Location</Label>
                                <Select 
                                    value={formData.location_id} 
                                    onValueChange={(value) => handleInputChange('location_id', value)}
                                >
                                    <SelectTrigger className={errors.location_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select location (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no_location">No Location</SelectItem>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={location.id.toString()}>
                                                {location.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.location_id && (
                                    <p className="text-sm text-red-600">{errors.location_id}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                        >
                            <Link href={isEditing ? route('tenant.assets.show', asset.id) : route('tenant.assets.index')}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Asset' : 'Create Asset')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}