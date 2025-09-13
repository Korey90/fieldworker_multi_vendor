import { Head, router } from '@inertiajs/react';
import { PlusIcon, SearchIcon, WandIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { Form, Tenant } from '@/types';

interface AdminFormsIndexProps {
    forms: {
        data: (Form & {
            tenant: Tenant;
            responses_count: number;
        })[];
        meta: any;
        links: any;
    };
    types: string[];
    tenants: Tenant[];
    filters: {
        search?: string;
        type?: string;
        tenant_id?: string;
        sort?: string;
        direction?: string;
    };
}

export default function AdminFormsIndex({ forms, types, tenants, filters }: AdminFormsIndexProps) {

    const handleSearch = (search: string) => {
        router.get(route('admin.forms.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('admin.forms.index'), {
            ...filters,
            [key]: value,
        }, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        const direction = filters.sort === sort && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.forms.index'), {
            ...filters,
            sort,
            direction,
        }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Admin - Forms Management" />
            
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Forms Management</h1>
                    <p className="text-gray-600">Manage forms across all tenants</p>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Search</label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search forms..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => handleFilter('type', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Types</option>
                                {types.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tenant</label>
                            <select
                                value={filters.tenant_id || ''}
                                onChange={(e) => handleFilter('tenant_id', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Tenants</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id.toString()}>{tenant.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <a
                                href={route('admin.forms.create')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Create Form
                            </a>
                            <a
                                href={route('admin.forms.builder')}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                            >
                                <WandIcon className="h-4 w-4" />
                                Form Builder
                            </a>
                        </div>
                    </div>
                </div>

                {/* Table */}
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
                                <th className="text-left p-4">Type</th>
                                <th className="text-left p-4">Tenant</th>
                                <th 
                                    className="text-left p-4 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('responses_count')}
                                >
                                    Responses
                                    {filters.sort === 'responses_count' && (
                                        <span className="ml-2">{filters.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </th>
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
                            {forms.data.map((form) => (
                                <tr key={form.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium">{form.name}</div>
                                            <div className="text-sm text-gray-500">ID: {form.id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                            {form.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <div className="font-medium">{form.tenant.name}</div>
                                            <div className="text-gray-500">ID: {form.tenant.id}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-medium">{form.responses_count}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-600">
                                            {new Date(form.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={route('admin.forms.show', form.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                View
                                            </a>
                                            <a
                                                href={route('admin.forms.preview', form.id)}
                                                className="text-green-600 hover:text-green-800 text-sm"
                                            >
                                                Preview
                                            </a>
                                            <a
                                                href={route('admin.forms.edit', form.id)}
                                                className="text-gray-600 hover:text-gray-800 text-sm"
                                            >
                                                Edit
                                            </a>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure?')) {
                                                        router.delete(route('admin.forms.destroy', form.id));
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {forms.data.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No forms found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {forms.meta && forms.meta.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2">
                            {forms.links.map((link: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-2 text-sm rounded ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'bg-white border hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}