import { Head, useForm } from '@inertiajs/react';
import { ArrowLeftIcon, SaveIcon, MapPinIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { Location, Tenant, Sector } from '@/types';

interface AdminLocationEditProps {
    location: Location & {
        tenant: Tenant;
        sector?: Sector;
    };
    tenants: Tenant[];
    sectors: Sector[];
}

export default function AdminLocationEdit({ location, tenants, sectors }: AdminLocationEditProps) {
    const [showGeocodeHelp, setShowGeocodeHelp] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: location.name || '',
        location_type: location.location_type || 'office',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        postal_code: location.postal_code || '',
        country: location.country || '',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        tenant_id: location.tenant_id || '',
        sector_id: location.sector_id || '',
        is_active: location.is_active ?? true,
        data: location.data ? JSON.stringify(location.data, null, 2) : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            latitude: data.latitude ? parseFloat(data.latitude as string) : null,
            longitude: data.longitude ? parseFloat(data.longitude as string) : null,
            data: data.data ? JSON.parse(data.data) : null,
        };

        put(route('admin.locations.update', location.id), {
            onSuccess: () => {
                // Redirect to show page after successful update
            }
        });
    };

    const geocodeAddress = async () => {
        if (!data.address || !data.city) {
            alert('Please enter at least an address and city first.');
            return;
        }

        const fullAddress = `${data.address}, ${data.city}${data.state ? ', ' + data.state : ''}${data.country ? ', ' + data.country : ''}`;
        
        // This is a placeholder for geocoding functionality
        // In a real implementation, you would use a service like Google Maps Geocoding API
        alert(`Geocoding functionality will be implemented here for: ${fullAddress}`);
        setShowGeocodeHelp(true);
    };

    const locationTypes = [
        'office',
        'warehouse',
        'site',
        'remote',
        'client_location',
        'other'
    ];

    return (
        <AppLayout>
            <Head title={`Admin - Edit Location: ${location.name}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <a
                            href={route('admin.locations.show', location.id)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Location</h1>
                            <p className="text-gray-600">Update location information and settings</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter location name"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location Type *
                                        </label>
                                        <select
                                            value={data.location_type}
                                            onChange={(e) => setData('location_type', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            {locationTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type.replace('_', ' ').toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.location_type && (
                                            <p className="text-red-600 text-sm mt-1">{errors.location_type}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tenant *
                                        </label>
                                        <select
                                            value={data.tenant_id}
                                            onChange={(e) => setData('tenant_id', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Tenant</option>
                                            {tenants.map((tenant) => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.tenant_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.tenant_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sector (Optional)
                                        </label>
                                        <select
                                            value={data.sector_id}
                                            onChange={(e) => setData('sector_id', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">No Sector</option>
                                            {sectors.map((sector) => (
                                                <option key={sector.id} value={sector.id}>
                                                    {sector.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.sector_id && (
                                            <p className="text-red-600 text-sm mt-1">{errors.sector_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Location is active
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold mb-4">Address Information</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter street address"
                                            required
                                        />
                                        {errors.address && (
                                            <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter city"
                                                required
                                            />
                                            {errors.city && (
                                                <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State/Province
                                            </label>
                                            <input
                                                type="text"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter state"
                                            />
                                            {errors.state && (
                                                <p className="text-red-600 text-sm mt-1">{errors.state}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter postal code"
                                            />
                                            {errors.postal_code && (
                                                <p className="text-red-600 text-sm mt-1">{errors.postal_code}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter country"
                                            required
                                        />
                                        {errors.country && (
                                            <p className="text-red-600 text-sm mt-1">{errors.country}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* GPS Coordinates */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">GPS Coordinates</h2>
                                    <button
                                        type="button"
                                        onClick={geocodeAddress}
                                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        <MapPinIcon className="h-4 w-4" />
                                        Auto-locate
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 40.7128"
                                        />
                                        {errors.latitude && (
                                            <p className="text-red-600 text-sm mt-1">{errors.latitude}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., -74.0060"
                                        />
                                        {errors.longitude && (
                                            <p className="text-red-600 text-sm mt-1">{errors.longitude}</p>
                                        )}
                                    </div>
                                </div>

                                {showGeocodeHelp && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Tip:</strong> You can also find coordinates by searching for your address on 
                                            Google Maps, right-clicking on the location, and copying the coordinates.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Additional Data */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    Store additional location data as JSON (optional)
                                </p>
                                
                                <textarea
                                    value={data.data}
                                    onChange={(e) => setData('data', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    rows={6}
                                    placeholder='{"contact_phone": "+1234567890", "manager": "John Doe", "hours": "9-5"}'
                                />
                                {errors.data && (
                                    <p className="text-red-600 text-sm mt-1">{errors.data}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Must be valid JSON format
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Save Actions */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-semibold mb-4">Save Changes</h3>
                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <SaveIcon className="h-4 w-4" />
                                        {processing ? 'Updating...' : 'Update Location'}
                                    </button>
                                    
                                    <a
                                        href={route('admin.locations.show', location.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </a>
                                </div>
                            </div>

                            {/* Current Values Preview */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-semibold mb-4">Current Location</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Name:</span>
                                        <p className="font-medium">{location.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Type:</span>
                                        <p className="font-medium">{location.location_type}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                            location.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {location.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Created:</span>
                                        <p className="font-medium">
                                            {new Date(location.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Help Tips */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold mb-4">Tips</h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Use descriptive names for easy identification</li>
                                    <li>• GPS coordinates help with mobile tracking</li>
                                    <li>• Additional data can store custom information</li>
                                    <li>• Inactive locations won't appear in worker apps</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}