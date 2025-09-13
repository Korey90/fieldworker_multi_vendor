import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Certification, Tenant } from '@/types';
import { SearchIcon, PlusIcon, FilterIcon, GridIcon, ListIcon, EyeIcon, SquarePenIcon, TrashIcon, ClockIcon } from 'lucide-react';

interface CertificationsIndexProps {
    certifications: {
        data: Certification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    tenants: Tenant[];
    authorities: string[];
    validityPeriods: number[];
    filters: {
        search?: string;
        tenant_id?: number;
        authority?: string;
        is_active?: boolean;
        validity_period?: number;
    };
}

export default function CertificationsIndex({ 
    certifications, 
    tenants, 
    authorities, 
    validityPeriods, 
    filters 
}: CertificationsIndexProps) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilter = (key: string, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        // Remove empty filters
        Object.keys(newFilters).forEach(filterKey => {
            const typedKey = filterKey as keyof typeof newFilters;
            if (newFilters[typedKey] === '' || newFilters[typedKey] === null || newFilters[typedKey] === undefined) {
                delete newFilters[typedKey];
            }
        });

        router.get(route('admin.certifications.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', localFilters.search);
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('admin.certifications.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (certification: Certification) => {
        if (confirm(`Are you sure you want to delete "${certification.name}"?`)) {
            router.delete(route('admin.certifications.destroy', certification.id));
        }
    };

    const formatValidityPeriod = (months: number) => {
        if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
            return `${years} year${years !== 1 ? 's' : ''}`;
        }
        return `${years}y ${remainingMonths}m`;
    };

    const renderCertificationCard = (certification: Certification) => (
        <Card key={certification.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{certification.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Badge variant="secondary">{certification.authority}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {formatValidityPeriod(certification.validity_period_months)}
                        </Badge>
                    </div>
                    {certification.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{certification.description}</p>
                    )}
                    {certification.tenant && (
                        <p className="text-sm text-blue-600 mb-2">🏢 {certification.tenant.name}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <Link
                        href={route('admin.certifications.show', certification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View details"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.certifications.edit', certification.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                    >
                        <SquarePenIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(certification)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👥 {certification.workers_count || 0} workers</span>
                    <span>📅 {new Date(certification.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant={certification.is_active ? "default" : "destructive"}>
                    {certification.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </div>
        </Card>
    );

    const renderCertificationRow = (certification: Certification) => (
        <tr key={certification.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium">{certification.name}</div>
                    {certification.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                            {certification.description}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <Badge variant="secondary">{certification.authority}</Badge>
            </td>
            <td className="px-6 py-4">
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <ClockIcon className="h-3 w-3" />
                    {formatValidityPeriod(certification.validity_period_months)}
                </Badge>
            </td>
            <td className="px-6 py-4">
                {certification.tenant && (
                    <span className="text-sm text-blue-600">{certification.tenant.name}</span>
                )}
            </td>
            <td className="px-6 py-4 text-center">
                {certification.workers_count || 0}
            </td>
            <td className="px-6 py-4">
                <Badge variant={certification.is_active ? "default" : "destructive"}>
                    {certification.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.certifications.show', certification.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View details"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.certifications.edit', certification.id)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                    >
                        <SquarePenIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(certification)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <AppLayout>
            <Head title="Admin - Certifications Management" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Certifications Management</h1>
                            <p className="text-gray-600">Manage certifications and their validity periods</p>
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
                            </div>
                            
                            <Link href={route('admin.certifications.create')}>
                                <Button className="flex items-center gap-2">
                                    <PlusIcon className="h-4 w-4" />
                                    Add New Certification
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Search certifications..."
                                    value={localFilters.search || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                />
                                <Button type="submit" variant="outline" size="sm">
                                    <SearchIcon className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>

                        <div>
                            <select
                                value={localFilters.tenant_id || ''}
                                onChange={(e) => handleFilter('tenant_id', e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Tenants</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={localFilters.authority || ''}
                                onChange={(e) => handleFilter('authority', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Authorities</option>
                                {authorities.map((authority) => (
                                    <option key={authority} value={authority}>
                                        {authority}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={localFilters.validity_period || ''}
                                onChange={(e) => handleFilter('validity_period', e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Periods</option>
                                {validityPeriods.map((period) => (
                                    <option key={period} value={period}>
                                        {formatValidityPeriod(period)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={localFilters.is_active !== undefined ? localFilters.is_active.toString() : ''}
                                onChange={(e) => handleFilter('is_active', e.target.value === 'true')}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="outline" onClick={clearFilters}>
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{certifications.total}</div>
                        <div className="text-sm text-gray-600">Total Certifications</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-green-600">{authorities.length}</div>
                        <div className="text-sm text-gray-600">Authorities</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-purple-600">{tenants.length}</div>
                        <div className="text-sm text-gray-600">Tenants</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                            {certifications.data.filter(c => c.is_active).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Certifications</div>
                    </Card>
                </div>

                {/* Content */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {certifications.data.map(renderCertificationCard)}
                    </div>
                ) : (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Certification
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Authority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Validity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tenant
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Workers
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {certifications.data.map(renderCertificationRow)}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {certifications.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {((certifications.current_page - 1) * certifications.per_page) + 1} to{' '}
                            {Math.min(certifications.current_page * certifications.per_page, certifications.total)} of{' '}
                            {certifications.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            {certifications.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(route('admin.certifications.index'), 
                                        { ...filters, page: certifications.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                            )}
                            {certifications.current_page < certifications.last_page && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(route('admin.certifications.index'), 
                                        { ...filters, page: certifications.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* No results */}
                {certifications.data.length === 0 && (
                    <Card className="p-8 text-center">
                        <div className="text-gray-500 mb-4">
                            <div className="text-4xl mb-2">🏆</div>
                            <h3 className="text-lg font-medium mb-2">No certifications found</h3>
                            <p>Try adjusting your filters or create a new certification.</p>
                        </div>
                        <Link href={route('admin.certifications.create')}>
                            <Button>Add First Certification</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}