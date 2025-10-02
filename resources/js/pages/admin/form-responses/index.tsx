import { Head, router } from '@inertiajs/react';
import { PlusIcon, FilterIcon, SearchIcon, DownloadIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { FormResponse, Form, Tenant, Worker } from '@/types';

interface AdminFormResponsesIndexProps {
    responses: {
        data: (FormResponse & {
            form: Form & { tenant: Tenant };
            worker: Worker;
        })[];
        meta: any;
        links: any;
    };
    forms: (Form & { tenant: Tenant })[];
    tenants: Tenant[];
    workers: Worker[];
    filters: {
        search?: string;
        form_id?: string;
        tenant_id?: string;
        worker_id?: string;
        status?: string;
        sort?: string;
        direction?: string;
    };
}

export default function AdminFormResponsesIndex({ 
    responses, 
    forms, 
    tenants, 
    workers, 
    filters 
}: AdminFormResponsesIndexProps) {
    const handleSearch = (search: string) => {
        router.get(route('admin.form-responses.index'), {
            ...filters,
            search,
        }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('admin.form-responses.index'), {
            ...filters,
            [key]: value,
        }, { preserveState: true });
    };

    const handleSort = (sort: string) => {
        const direction = filters.sort === sort && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.form-responses.index'), {
            ...filters,
            sort,
            direction,
        }, { preserveState: true });
    };

    const exportResponses = () => {
        const params = new URLSearchParams(filters as any);
        params.append('export', 'csv');
        window.open(`${route('admin.form-responses.index')}?${params.toString()}`);
    };

    return (
        <AppLayout>
            <Head title="Admin - Form Responses Management" />
            
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Form Responses Management</h1>
                    <p className="text-gray-600">Manage form responses across all tenants</p>
                </div>

                {/* Filters */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Search</label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search responses..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Form</label>
                            <select
                                value={filters.form_id || ''}
                                onChange={(e) => handleFilter('form_id', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Forms</option>
                                {forms.map((form) => (
                                    <option key={form.id} value={form.id.toString()}>
                                        {form.name} ({form.tenant?.name || 'No Tenant'})
                                    </option>
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

                        <div>
                            <label className="block text-sm font-medium mb-1">Worker</label>
                            <select
                                value={filters.worker_id || ''}
                                onChange={(e) => handleFilter('worker_id', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Workers</option>
                                {workers.map((worker) => (
                                    <option key={worker.id} value={worker.id.toString()}>{worker.first_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilter('status', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="submitted">Submitted</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={exportResponses}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                Export
                            </button>
                            <a
                                href={route('admin.form-responses.create-new')}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                New Response
                            </a>
                            <a
                                href={route('admin.form-responses.create')}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Create (Legacy)
                            </a>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4">ID</th>
                                <th className="text-left p-4">Form</th>
                                <th className="text-left p-4">Worker</th>
                                <th className="text-left p-4">Tenant</th>
                                <th 
                                    className="text-left p-4 cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('is_submitted')}
                                >
                                    Status
                                    {filters.sort === 'is_submitted' && (
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
                            {responses.data && responses.data.length > 0 ? (
                                responses.data.map((response) => (
                                <tr key={response.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <span className="font-mono text-sm">#{response.id}</span>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium">{response.form.name}</div>
                                            <div className="text-sm text-gray-500">{response.form.type}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium">{response.worker.first_name}</div>
                                            <div className="text-sm text-gray-500">{response.worker.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <div className="font-medium">{response.form.tenant?.name || 'No Tenant'}</div>
                                            <div className="text-gray-500">ID: {response.form.tenant?.id || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            response.is_submitted 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {response.is_submitted ? 'Submitted' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-600">
                                            {new Date(response.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={route('admin.form-responses.show', response.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                View
                                            </a>
                                            <a
                                                href={route('admin.form-responses.edit', response.id)}
                                                className="text-gray-600 hover:text-gray-800 text-sm"
                                            >
                                                Edit
                                            </a>
                                            {!response.is_submitted && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Submit this response?')) {
                                                            router.post(route('admin.form-responses.submit', response.id));
                                                        }
                                                    }}
                                                    className="text-green-600 hover:text-green-800 text-sm"
                                                >
                                                    Submit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure?')) {
                                                        router.delete(route('admin.form-responses.destroy', response.id));
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        No form responses found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Remove the duplicate no data message since it's now in the table */}
                </div>

                {/* Pagination */}
                {responses.meta && responses.meta.last_page > 1 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2">
                            {responses.links.map((link: any, index: number) => (
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