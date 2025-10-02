import { Head, router } from '@inertiajs/react';
import { ArrowLeftIcon, EditIcon, TrashIcon, SendIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { FormResponse, Form, Tenant, User, Job, Worker } from '@/types';

interface AdminFormResponseShowProps {
    response: FormResponse & {
        form: Form & { tenant: Tenant };
        worker?: Worker;
        job?: Job;
    };
}

export default function AdminFormResponseShow({ response }: AdminFormResponseShowProps) {
    const handleSubmit = () => {
        if (confirm('Submit this response? This action cannot be undone.')) {
            router.post(route('admin.form-responses.submit', response.id));
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
            router.delete(route('admin.form-responses.destroy', response.id));
        }
    };

    const renderFieldValue = (field: any, value: any) => {
        if (!value && value !== 0 && value !== false) {
            return <span className="text-gray-400 italic">No answer</span>;
        }

        switch (field.type) {
            case 'select':
            case 'radio':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{value}</span>;
            
            case 'checkbox':
                return (
                    <span className={`px-2 py-1 rounded text-sm ${
                        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {value ? 'Yes' : 'No'}
                    </span>
                );
            
            case 'date':
                return <span>{new Date(value).toLocaleDateString()}</span>;
            
            case 'datetime-local':
                return <span>{new Date(value).toLocaleString()}</span>;
            
            case 'file':
                return value ? (
                    <a href={value} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                        Download File
                    </a>
                ) : null;
            
            case 'signature':
                return value ? (
                    <img src={value} alt="Signature" className="max-w-xs border rounded" />
                ) : null;
            
            case 'textarea':
                return <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded border">{value}</div>;
            
            default:
                return <span>{value}</span>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Admin - Response #${response.id}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <a
                                href={route('admin.form-responses.index')}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </a>
                            <div>
                                <h1 className="text-2xl font-bold">Response #{response.id}</h1>
                                <p className="text-gray-600">
                                    Form: {response.form.name} • Worker: {response.worker ? `${response.worker.first_name} ${response.worker.last_name}` : 'No worker assigned'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <a
                                href={route('admin.form-responses.edit', response.id)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                            >
                                <EditIcon className="h-4 w-4" />
                                Edit
                            </a>
                            {!response.is_submitted && (
                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                                >
                                    <SendIcon className="h-4 w-4" />
                                    Submit
                                </button>
                            )}
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

                {/* Status Banner */}
                <div className={`mb-6 p-4 rounded-lg border ${
                    response.is_submitted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-semibold ${
                                response.is_submitted ? 'text-green-800' : 'text-orange-800'
                            }`}>
                                {response.is_submitted ? 'Submitted Response' : 'Draft Response'}
                            </h3>
                            <p className={`text-sm ${
                                response.is_submitted ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {response.is_submitted 
                                    ? `Submitted on ${new Date(response.submitted_at || response.updated_at).toLocaleString()}`
                                    : 'This response is still a draft and can be edited'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Response Data */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold">Response Data</h2>
                            </div>
                            <div className="p-6">
                                {response.form.schema?.sections ? (
                                    <div className="space-y-8">
                                        {response.form.schema.sections.map((section: any, sectionIndex: number) => (
                                            <div key={sectionIndex}>
                                                <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                                                    {section.title}
                                                </h3>
                                                <div className="space-y-4">
                                                    {section.fields.map((field: any, fieldIndex: number) => (
                                                        <div key={fieldIndex} className="border-l-4 border-blue-200 pl-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <label className="font-medium text-gray-700">
                                                                    {field.label}
                                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                                </label>
                                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                    {field.type}
                                                                </span>
                                                            </div>
                                                            <div className="text-gray-900">
                                                                {renderFieldValue(field, response.response_data[field.name])}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500">No schema defined for this form</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Response Details */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold">Response Details</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Response ID</label>
                                    <div className="text-gray-900 font-mono">{response.id}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        response.is_submitted 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        {response.is_submitted ? 'Submitted' : 'Draft'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                    <div className="text-gray-900">{new Date(response.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                                    <div className="text-gray-900">{new Date(response.updated_at).toLocaleString()}</div>
                                </div>
                                {response.submitted_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                                        <div className="text-gray-900">{new Date(response.submitted_at).toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Info */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold">Form Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                                    <div className="text-gray-900">{response.form.name}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                        {response.form.type}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                                    <div className="text-gray-900">{response.form.tenant?.name || 'No Tenant'}</div>
                                </div>
                                <div>
                                    <a
                                        href={route('admin.forms.show', response.form.id)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        View Form Details →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-semibold">User Information</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Worker Name</label>
                                    <div className="text-gray-900">{response.worker ? `${response.worker.first_name} ${response.worker.last_name}` : 'No worker assigned'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Worker Email</label>
                                    <div className="text-gray-900">{response.worker?.email || 'No email provided'}</div>
                                </div>
                                {response.job && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Job</label>
                                        <div className="text-gray-900">{response.job.title}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}