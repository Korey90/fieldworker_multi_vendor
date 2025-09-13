import { Head, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, MapPinIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { Tenant, Sector } from '@/types';

interface AdminLocationCreateProps {
    tenants: Tenant[];
    sectors: Sector[];
}

export default function AdminLocationCreate({ tenants, sectors }: AdminLocationCreateProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        tenant_id: '',
        sector_id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        location_type: '',
        is_active: true,
        latitude: '',
        longitude: '',
        data: {},
    });

    const locationTypes = [
        'Office',
        'Warehouse',
        'Factory',
        'Store',
        'Branch',
        'Service Center',
        'Distribution Center',
        'Headquarters',
        'Workshop',
        'Other'
    ];

    const countries = [
        'Poland',
        'Germany',
        'United Kingdom',
        'France',
        'Spain',
        'Italy',
        'Netherlands',
        'Belgium',
        'Czech Republic',
        'Slovakia',
        'Other'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            ...data,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
        };

        post(route('admin.locations.store'));
    };

    const handleGeocodeAddress = () => {
        // This would integrate with a geocoding service
        // For now, just show a placeholder
        alert('Geocoding integration coming soon! This will automatically fill latitude/longitude based on the address.');
    };

    return (
        <AppLayout>
            <Head title="Admin - Create Location" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <a
                            href={route('admin.locations.index')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold">Create Location</h1>
                            <p className="text-gray-600">Add a new location to the system</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tenant *</label>
                                <select
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id.toString()}>
                                            {tenant.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.tenant_id && <div className="text-red-500 text-sm mt-1">{errors.tenant_id}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Sector</label>
                                <select
                                    value={data.sector_id}
                                    onChange={(e) => setData('sector_id', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">Select Sector (Optional)</option>
                                    {sectors.map((sector) => (
                                        <option key={sector.id} value={sector.id.toString()}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.sector_id && <div className="text-red-500 text-sm mt-1">{errors.sector_id}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Location Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Main Office, Warehouse #1"
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Location Type *</label>
                                <select
                                    value={data.location_type}
                                    onChange={(e) => setData('location_type', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {locationTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {errors.location_type && <div className="text-red-500 text-sm mt-1">{errors.location_type}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium">
                                        Active Location
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Inactive locations won't be available for assignment to workers or jobs
                                </p>
                                {errors.is_active && <div className="text-red-500 text-sm mt-1">{errors.is_active}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Address Information</h2>
                            <button
                                type="button"
                                onClick={handleGeocodeAddress}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                                <MapPinIcon className="h-4 w-4" />
                                Auto-locate on map
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Street Address *</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g., 123 Main Street, Suite 456"
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">City *</label>
                                <input
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="e.g., Warsaw"
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">State/Province</label>
                                <input
                                    type="text"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    placeholder="e.g., Mazowieckie"
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.state && <div className="text-red-500 text-sm mt-1">{errors.state}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    placeholder="e.g., 00-001"
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.postal_code && <div className="text-red-500 text-sm mt-1">{errors.postal_code}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Country *</label>
                                <select
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select Country</option>
                                    {countries.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && <div className="text-red-500 text-sm mt-1">{errors.country}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">GPS Coordinates</h2>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                            </button>
                        </div>
                        
                        {showAdvanced && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            placeholder="e.g., 52.2297700"
                                            className="w-full border rounded px-3 py-2"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
                                        {errors.latitude && <div className="text-red-500 text-sm mt-1">{errors.latitude}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            placeholder="e.g., 21.0122300"
                                            className="w-full border rounded px-3 py-2"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
                                        {errors.longitude && <div className="text-red-500 text-sm mt-1">{errors.longitude}</div>}
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">GPS Coordinates Help</h4>
                                    <p className="text-sm text-blue-800">
                                        GPS coordinates are optional but recommended for accurate location tracking and mapping. 
                                        You can find coordinates using Google Maps or use the "Auto-locate on map" button above.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <a
                            href={route('admin.locations.index')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Location'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}