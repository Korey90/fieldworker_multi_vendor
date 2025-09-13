import { Head, router } from '@inertiajs/react';
import { 
    ArrowLeftIcon, 
    EditIcon, 
    MapPinIcon, 
    UsersIcon, 
    PackageIcon, 
    BriefcaseIcon,
    PhoneIcon,
    MailIcon,
    BuildingIcon,
    CalendarIcon,
    ActivityIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import LocationMap from '@/components/LocationMap';
import type { Location, Tenant, Sector, Worker, Asset, Job } from '@/types';

interface AdminLocationShowProps {
    location: Location & {
        tenant: Tenant;
        sector?: Sector;
        workers?: (Worker & { user: any })[];
        assets?: Asset[];
        jobs?: (Job & { user: any })[];
    };
    recentJobs: (Job & { 
        user: any; 
    })[];
    stats: {
        total_workers: number;
        active_workers: number;
        total_assets: number;
        active_jobs: number;
        completed_jobs: number;
    };
}

export default function AdminLocationShow({ location, recentJobs, stats }: AdminLocationShowProps) {
    // Helper function to safely format coordinates
    const formatCoordinate = (coord: number | string | null | undefined): string => {
        if (coord === null || coord === undefined) return '0.000000';
        const num = typeof coord === 'string' ? parseFloat(coord) : coord;
        return isNaN(num) ? '0.000000' : num.toFixed(6);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
            router.delete(route('admin.locations.destroy', location.id), {
                onSuccess: () => {
                    router.visit(route('admin.locations.index'));
                }
            });
        }
    };

    const StatCard = ({ icon: Icon, title, value, description, color = "blue" }: {
        icon: any;
        title: string;
        value: string | number;
        description?: string;
        color?: string;
    }) => (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
                    <p className="text-sm text-gray-600">{title}</p>
                    {description && <p className="text-xs text-gray-500">{description}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title={`Admin - Location: ${location.name}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <a
                                href={route('admin.locations.index')}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </a>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold">{location.name}</h1>
                                    <span className={`px-3 py-1 text-sm rounded-full ${
                                        location.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {location.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600">{location.location_type} • {location.tenant.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <a
                                href={route('admin.locations.edit', location.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                <EditIcon className="h-4 w-4" />
                                Edit Location
                            </a>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard 
                        icon={UsersIcon} 
                        title="Total Workers" 
                        value={stats.total_workers}
                        description={`${stats.active_workers} active`}
                        color="blue"
                    />
                    <StatCard 
                        icon={UsersIcon} 
                        title="Active Workers" 
                        value={stats.active_workers}
                        color="green"
                    />
                    <StatCard 
                        icon={PackageIcon} 
                        title="Assets" 
                        value={stats.total_assets}
                        color="purple"
                    />
                    <StatCard 
                        icon={BriefcaseIcon} 
                        title="Active Jobs" 
                        value={stats.active_jobs}
                        color="orange"
                    />
                    <StatCard 
                        icon={ActivityIcon} 
                        title="Completed Jobs" 
                        value={stats.completed_jobs}
                        color="green"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Location Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-4">Location Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <BuildingIcon className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Type</p>
                                                <p className="font-medium">{location.location_type}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <UsersIcon className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Tenant</p>
                                                <p className="font-medium">{location.tenant.name}</p>
                                            </div>
                                        </div>
                                        
                                        {location.sector && (
                                            <div className="flex items-center gap-3">
                                                <BuildingIcon className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Sector</p>
                                                    <p className="font-medium">{location.sector.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Created</p>
                                                <p className="font-medium">
                                                    {new Date(location.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Address</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <MapPinIcon className="h-4 w-4 text-gray-400 mt-1" />
                                            <div>
                                                <p className="font-medium">{location.address}</p>
                                                <p className="text-sm text-gray-600">
                                                    {location.city}
                                                    {location.state && `, ${location.state}`}
                                                    {location.postal_code && ` ${location.postal_code}`}
                                                </p>
                                                <p className="text-sm text-gray-600">{location.country}</p>
                                                
                                                {(location.latitude && location.longitude) && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        📍 {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Jobs */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Recent Jobs</h2>
                                <a
                                    href={route('admin.locations.jobs', location.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View All Jobs
                                </a>
                            </div>
                            
                            {recentJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {recentJobs.map((job) => (
                                        <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>Created by: {job.user?.name || 'Unknown'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {job.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No recent jobs for this location</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <a
                                    href={route('admin.locations.workers', location.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <UsersIcon className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">View Workers</p>
                                        <p className="text-sm text-gray-600">{stats.total_workers} workers</p>
                                    </div>
                                </a>
                                
                                <a
                                    href={route('admin.locations.assets', location.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <PackageIcon className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">View Assets</p>
                                        <p className="text-sm text-gray-600">{stats.total_assets} assets</p>
                                    </div>
                                </a>
                                
                                <a
                                    href={route('admin.locations.jobs', location.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <BriefcaseIcon className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">View Jobs</p>
                                        <p className="text-sm text-gray-600">{stats.active_jobs} active jobs</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Map Preview */}
                        {(location.latitude && location.longitude) && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-semibold mb-4">Location on Map</h3>
                                <LocationMap 
                                    locations={[location]}
                                    height="300px"
                                    showPopups={false}
                                />
                                <div className="mt-3 text-center">
                                    <p className="text-xs text-gray-500">
                                        📍 {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Additional Data */}
                        {location.data && Object.keys(location.data).length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="font-semibold mb-4">Additional Information</h3>
                                <div className="space-y-2">
                                    {Object.entries(location.data).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {key.replace('_', ' ')}:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}