import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tenant, Feature, TenantQuota, User, Job } from '@/types';
import { ArrowLeftIcon, UsersIcon, BriefcaseIcon, BuildingIcon, SettingsIcon, UserPlusIcon, PlayIcon, PauseIcon, CheckCircleIcon, UserIcon, MapPinIcon } from 'lucide-react';

interface TenantShowProps {
    tenant: Tenant & {
        sector_name: string;
    };
    stats: {
        total_users: number;
        active_users: number;
        total_workers: number;
        active_workers: number;
        total_jobs: number;
        active_jobs: number;
        completed_jobs: number;
    };
    quota?: TenantQuota;
    features: Feature[];
    recent_users: User[];
    recent_jobs: Array<{
        id: number;
        title: string;
        status: string;
        location: string;
        created_at: string;
    }>;
}

export default function TenantShow({ 
    tenant, 
    stats, 
    quota, 
    features, 
    recent_users, 
    recent_jobs 
}: TenantShowProps) {
    
    const handleStatusChange = (action: 'activate' | 'suspend') => {
        if (confirm(`Are you sure you want to ${action} this tenant?`)) {
            router.post(route(`admin.tenants.${action}`, tenant.id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getJobStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
            case 'in_progress': return <PlayIcon className="h-4 w-4 text-blue-600" />;
            case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
            case 'paused': return <PauseIcon className="h-4 w-4 text-orange-600" />;
            default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
        }
    };

    return (
        <AppLayout>
            <Head title={`Admin - ${tenant.name} Details`} />
            
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
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <BuildingIcon className="h-8 w-8 text-blue-600" />
                                {tenant.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge className={getStatusColor(tenant.status)}>
                                    {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                                </Badge>
                                <span className="text-gray-600">📏 {tenant.sector_name}</span>
                                <span className="text-gray-500 text-sm">
                                    Created {new Date(tenant.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {tenant.status === 'active' ? (
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleStatusChange('suspend')}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                    <PauseIcon className="h-4 w-4 mr-2" />
                                    Suspend
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleStatusChange('activate')}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                    <PlayIcon className="h-4 w-4 mr-2" />
                                    Activate
                                </Button>
                            )}
                            
                            <Link href={route('admin.tenants.edit', tenant.id)}>
                                <Button>
                                    <SettingsIcon className="h-4 w-4 mr-2" />
                                    Edit Tenant
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Statistics */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">📊 Statistics Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{stats.active_users}</div>
                                    <div className="text-sm text-gray-600">Active Users</div>
                                    <div className="text-xs text-gray-500">of {stats.total_users} total</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{stats.active_workers}</div>
                                    <div className="text-sm text-gray-600">Active Workers</div>
                                    <div className="text-xs text-gray-500">of {stats.total_workers} total</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{stats.active_jobs}</div>
                                    <div className="text-sm text-gray-600">Active Jobs</div>
                                    <div className="text-xs text-gray-500">of {stats.total_jobs} total</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{stats.completed_jobs}</div>
                                    <div className="text-sm text-gray-600">Completed Jobs</div>
                                    <div className="text-xs text-gray-500">lifetime</div>
                                </div>
                            </div>
                        </Card>

                        {/* Recent Users */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <UsersIcon className="h-5 w-5" />
                                    Recent Users
                                </h3>
                                <Link 
                                    href={route('admin.workers.index', { tenant_id: tenant.id })}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View all →
                                </Link>
                            </div>
                            
                            {recent_users.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_users.map((user) => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-gray-600">{user.email}</div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No users found</p>
                            )}
                        </Card>

                        {/* Recent Jobs */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <BriefcaseIcon className="h-5 w-5" />
                                    Recent Jobs
                                </h3>
                                <Link 
                                    href={route('admin.jobs.index', { tenant_id: tenant.id })}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    View all →
                                </Link>
                            </div>
                            
                            {recent_jobs.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_jobs.map((job) => (
                                        <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                {getJobStatusIcon(job.status)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{job.title}</div>
                                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                                    <MapPinIcon className="h-3 w-3" />
                                                    {job.location}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {job.created_at}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No jobs found</p>
                            )}
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Tenant Info */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">🏢 Tenant Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Name</label>
                                    <p className="text-gray-900">{tenant.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Sector</label>
                                    <p className="text-gray-900">{tenant.sector_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Status</label>
                                    <Badge className={getStatusColor(tenant.status)}>
                                        {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Created</label>
                                    <p className="text-gray-900">{new Date(tenant.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                    <p className="text-gray-900">{new Date(tenant.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Quota Information */}
                        {quota && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">📈 Quota Usage</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Users</span>
                                            <span>{stats.total_users} / {quota.quota_limit}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${Math.min((stats.total_users / quota.quota_limit) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <Link 
                                    href={route('admin.tenants.quotas', tenant.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm mt-3 inline-block"
                                >
                                    Manage quotas →
                                </Link>
                            </Card>
                        )}

                        {/* Features */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">⚡ Enabled Features</h3>
                            {features.length > 0 ? (
                                <div className="space-y-2">
                                    {features.map((feature) => (
                                        <div key={feature.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium">{feature.name}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No features enabled</p>
                            )}
                        </Card>

                        {/* Quick Actions */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
                            <div className="space-y-2">
                                <Link 
                                    href={route('admin.workers.create', { tenant_id: tenant.id })}
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full justify-start">
                                        <UserPlusIcon className="h-4 w-4 mr-2" />
                                        Add Worker
                                    </Button>
                                </Link>
                                <Link 
                                    href={route('admin.jobs.create', { tenant_id: tenant.id })}
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full justify-start">
                                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                                        Create Job
                                    </Button>
                                </Link>
                                <Link 
                                    href={route('admin.tenants.quotas', tenant.id)}
                                    className="w-full"
                                >
                                    <Button variant="outline" className="w-full justify-start">
                                        <SettingsIcon className="h-4 w-4 mr-2" />
                                        Manage Quotas
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}