import { Head, router } from '@inertiajs/react';
import { ArrowLeftIcon, EditIcon, CopyIcon, TrashIcon, EyeIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { Form, FormResponse, Tenant, Worker, Job } from '@/types';

interface AdminFormShowProps {
    form: Form & {
        tenant: Tenant;
        responses: (FormResponse & {
            worker: Worker;
            job?: Job;
        })[];
    };
    recentResponses: (FormResponse & {
        worker: Worker;
        job?: Job;
    })[];
    stats: {
        total_responses: number;
        submitted_responses: number;
        draft_responses: number;
        recent_responses: number;
    };
}

export default function AdminFormShow({ form, recentResponses, stats }: AdminFormShowProps) {
    const handleDuplicate = () => {
        router.post(route('admin.forms.duplicate', form.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            router.delete(route('admin.forms.destroy', form.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Admin - Form: ${form.name}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <a
                                href={route('admin.forms.index')}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </a>
                            <div>
                                <h1 className="text-2xl font-bold">{form.name}</h1>
                                <p className="text-gray-600">
                                    Tenant: {form.tenant.name} • Type: {form.type}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <a
                                href={route('admin.forms.preview', form.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                            >
                                <EyeIcon className="h-4 w-4" />
                                Preview
                            </a>
                            <a
                                href={route('admin.forms.edit', form.id)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                            >
                                <EditIcon className="h-4 w-4" />
                                Edit
                            </a>
                            <button
                                onClick={handleDuplicate}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <CopyIcon className="h-4 w-4" />
                                Duplicate
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-blue-600">{stats.total_responses}</div>
                        <div className="text-gray-600">Total Responses</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-green-600">{stats.submitted_responses}</div>
                        <div className="text-gray-600">Submitted</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-orange-600">{stats.draft_responses}</div>
                        <div className="text-gray-600">Drafts</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="text-2xl font-bold text-purple-600">{stats.recent_responses}</div>
                        <div className="text-gray-600">This Week</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Schema */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">Form Schema</h2>
                        </div>
                        <div className="p-6">
                            {form.schema?.sections ? (
                                <div className="space-y-6">
                                    {form.schema.sections.map((section: any, sectionIndex: number) => (
                                        <div key={sectionIndex} className="border rounded-lg p-4">
                                            <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                                            <div className="space-y-3">
                                                {section.fields.map((field: any, fieldIndex: number) => (
                                                    <div key={fieldIndex} className="bg-gray-50 rounded p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium">{field.label}</span>
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {field.type}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Name: {field.name}
                                                            {field.required && <span className="text-red-500 ml-2">*required</span>}
                                                        </div>
                                                        {field.options && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Options: {field.options.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500">No schema defined</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Responses */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Recent Responses</h2>
                            <a
                                href={route('admin.form-responses.index', { form_id: form.id })}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                View All
                            </a>
                        </div>
                        <div className="p-6">
                            {recentResponses.length > 0 ? (
                                <div className="space-y-4">
                                    {recentResponses.map((response) => (
                                        <div key={response.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium">{response.worker.first_name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        response.is_submitted 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {response.is_submitted ? 'Submitted' : 'Draft'}
                                                    </span>
                                                    <a
                                                        href={route('admin.form-responses.show', response.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        View
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {response.worker.email} • {new Date(response.created_at).toLocaleDateString()}
                                            </div>
                                            {response.job && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Job: {response.job.title}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500">No responses yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Details */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Form Details</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                                <div className="text-gray-900">{form.id}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="text-gray-900">{form.type}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                                <div className="text-gray-900">{form.tenant.name} (ID: {form.tenant.id})</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                <div className="text-gray-900">{new Date(form.created_at).toLocaleString()}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                                <div className="text-gray-900">{new Date(form.updated_at).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}