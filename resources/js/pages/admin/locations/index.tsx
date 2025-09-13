import { Head, router } from '@inertiajs/react';
import { PlusIcon, SearchIcon, MapIcon, GridIcon, ListIcon, FilterIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import LocationMap from '@/components/LocationMap';
import type { Location, Tenant, Sector } from '@/types';

interface AdminLocationsIndexProps {
    locations: {
        data: (Location & {
            tenant: Tenant;
            sector?: Sector;
        })[];
        meta: any;
        links: any;
    };
    tenants: Tenant[];
    sectors: Sector[];
    locationTypes: string[];
    filters: {
        search?: string;
        tenant_id?: string;
        sector_id?: string;
        location_type?: string;
        is_active?: boolean;
        sort?: string;
        direction?: string;
    };
}

export default function AdminLocationsIndex({ 
    locations, 
    tenants, 
    sectors, 
    locationTypes, 
    filters 
}: AdminLocationsIndexProps) {
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (search: string) => {
        router.get(route('admin.locations.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | boolean) => {
        router.get(route('admin.locations.index'), {
            ...filters,
            [key]: value,
        }, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        const direction = filters.sort === sort && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.locations.index'), {
            ...filters,
            sort,
            direction,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        router.get(route('admin.locations.index'));
    };

    // Helper function to safely format coordinates
    const formatCoordinate = (coord: number | string | null | undefined): string => {
        if (coord === null || coord === undefined) return '0.000000';
        const num = typeof coord === 'string' ? parseFloat(coord) : coord;
        return isNaN(num) ? '0.000000' : num.toFixed(6);
    };

    const renderLocationCard = (location: Location & { tenant: Tenant; sector?: Sector }) => (
        <div
            key={location.id}
            className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.visit(route('admin.locations.show', location.id))}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.location_type}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                    location.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {location.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
                <p>📍 {location.address}</p>
                <p>🏙️ {location.city}{location.state && `, ${location.state}`} {location.postal_code}</p>
                <p>🌍 {location.country}</p>
                <p>🏢 {location.tenant.name}</p>
                {location.sector && <p>🏭 {location.sector.name}</p>}
            </div>
            
            {(location.latitude && location.longitude) && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                        📍 {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <AppLayout>
            <Head title="Admin - Locations Management" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Locations Management</h1>
                            <p className="text-gray-600">Manage locations across all tenants</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                >
                                    <ListIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                >
                                    <GridIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                >
                                    <MapIcon className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <a
                                href={route('admin.locations.create')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Create Location
                            </a>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search locations..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded ${
                                showFilters ? 'bg-blue-50 border-blue-300' : ''
                            }`}
                        >
                            <FilterIcon className="h-4 w-4" />
                            Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tenant</label>
                                <select
                                    value={filters.tenant_id || ''}
                                    onChange={(e) => handleFilter('tenant_id', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">All Tenants</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id.toString()}>
                                            {tenant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Sector</label>
                                <select
                                    value={filters.sector_id || ''}
                                    onChange={(e) => handleFilter('sector_id', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">All Sectors</option>
                                    {sectors.map((sector) => (
                                        <option key={sector.id} value={sector.id.toString()}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    value={filters.location_type || ''}
                                    onChange={(e) => handleFilter('location_type', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">All Types</option>
                                    {locationTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={filters.is_active !== undefined ? filters.is_active.toString() : ''}
                                    onChange={(e) => handleFilter('is_active', e.target.value === 'true')}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            <div className="md:col-span-4 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content based on view mode */}
                {viewMode === 'map' ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <LocationMap 
                                locations={locations.data}
                                height="600px"
                                onLocationClick={(location) => {
                                    router.visit(route('admin.locations.show', location.id));
                                }}
                                showPopups={true}
                            />
                        </div>
                        
                        {/* Map Stats */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{locations.data.length}</div>
                                    <div className="text-sm text-gray-600">Total Locations</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {locations.data.filter(loc => loc.is_active).length}
                                    </div>
                                    <div className="text-sm text-gray-600">Active</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {locations.data.filter(loc => loc.latitude && loc.longitude).length}
                                    </div>
                                    <div className="text-sm text-gray-600">With Coordinates</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {new Set(locations.data.map(loc => loc.tenant.id)).size}
                                    </div>
                                    <div className="text-sm text-gray-600">Tenants</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {locations.data.map(renderLocationCard)}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th 
                                        className="text-left p-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        Name
                                        {filters.sort === 'name' && (
                                            <span className="ml-2">{filters.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th className="text-left p-4">Address</th>
                                    <th 
                                        className="text-left p-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('city')}
                                    >
                                        City
                                        {filters.sort === 'city' && (
                                            <span className="ml-2">{filters.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th 
                                        className="text-left p-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('location_type')}
                                    >
                                        Type
                                        {filters.sort === 'location_type' && (
                                            <span className="ml-2">{filters.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th className="text-left p-4">Tenant</th>
                                    <th className="text-left p-4">Status</th>
                                    <th 
                                        className="text-left p-4 cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Created
                                        {filters.sort === 'created_at' && (
                                            <span className="ml-2">{filters.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.data.map((location) => (
                                    <tr 
                                        key={location.id} 
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => router.visit(route('admin.locations.show', location.id))}
                                    >
                                        <td className="p-4 font-medium">{location.name}</td>
                                        <td className="p-4 text-gray-600">
                                            {location.address.length > 50 
                                                ? `${location.address.slice(0, 50)}...` 
                                                : location.address
                                            }
                                        </td>
                                        <td className="p-4">{location.city}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                {location.location_type}
                                            </span>
                                        </td>
                                        <td className="p-4">{location.tenant.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                location.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {location.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {new Date(location.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <a
                                                    href={route('admin.locations.edit', location.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Edit
                                                </a>
                                                <span className="text-gray-300">|</span>
                                                <a
                                                    href={route('admin.locations.show', location.id)}
                                                    className="text-green-600 hover:text-green-800"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {locations.meta && locations.meta.total > locations.meta.per_page && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {locations.meta.from || 0} to {locations.meta.to || 0} of {locations.meta.total} results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {locations.links?.map((link: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 text-sm rounded ${
                                                    link.active 
                                                        ? 'bg-blue-600 text-white' 
                                                        : link.url 
                                                            ? 'bg-white border hover:bg-gray-50' 
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}