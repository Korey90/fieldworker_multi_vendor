import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Download,
    User,
    Calendar,
    CheckCircle
} from 'lucide-react';
import { Form, FormResponse } from '@/types';

interface Props {
    form: Form;
    response: FormResponse;
}

export default function Show({ form, response }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this response?')) {
            router.delete(route('tenant.form-responses.destroy', [form.id, response.id]), {
                onSuccess: () => {
                    router.visit(route('tenant.form-responses.index', form.id));
                }
            });
        }
    };

    const renderFieldValue = (field: any, value: any) => {
        if (!value && value !== 0 && value !== false) {
            return <span className="text-gray-400 italic">No response</span>;
        }

        switch (field.type) {
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        {value ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-700">Yes</span>
                            </>
                        ) : (
                            <>
                                <div className="h-4 w-4 border border-gray-300 rounded"></div>
                                <span className="text-gray-500">No</span>
                            </>
                        )}
                    </div>
                );
            case 'select':
                return <span className="font-medium">{value}</span>;
            case 'textarea':
                return (
                    <div className="bg-gray-50 p-3 rounded border">
                        <pre className="whitespace-pre-wrap text-sm">{value}</pre>
                    </div>
                );
            case 'signature':
                if (typeof value === 'string' && value.startsWith('data:image')) {
                    return (
                        <div className="border rounded p-2 bg-gray-50">
                            <img 
                                src={value} 
                                alt="Signature" 
                                className="max-w-xs max-h-24 object-contain"
                            />
                        </div>
                    );
                }
                return <span className="text-gray-500 italic">Signature provided</span>;
            case 'date':
                return <span className="font-medium">{new Date(value).toLocaleDateString()}</span>;
            case 'time':
                return <span className="font-medium">{value}</span>;
            case 'number':
                return <span className="font-medium">{value}</span>;
            default:
                return <span>{value}</span>;
        }
    };

    const getStatusBadge = () => {
        if (response.is_submitted) {
            return <Badge variant="default">Submitted</Badge>;
        }
        return <Badge variant="secondary">Draft</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Response Details - ${form.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('tenant.form-responses.index', form.id))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Responses
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Response Details</h1>
                            <p className="text-gray-600">{form.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!response.is_submitted && (
                            <Button
                                variant="outline"
                                asChild
                            >
                                <Link href={route('tenant.form-responses.edit', [form.id, response.id])}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Response Info */}
                <div className="bg-white p-6 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Respondent</p>
                                <p className="font-medium">{response.user?.name}</p>
                                <p className="text-sm text-gray-500">{response.user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Created</p>
                                <p className="font-medium">
                                    {new Date(response.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(response.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <div className="mt-1">
                                {getStatusBadge()}
                            </div>
                        </div>
                        {response.submitted_at && (
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Submitted</p>
                                    <p className="font-medium">
                                        {new Date(response.submitted_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(response.submitted_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                    {form.schema?.sections?.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="bg-white p-6 rounded-lg border">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-2">
                                {section.title}
                            </h2>
                            <div className="space-y-6">
                                {section.fields?.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                {field.label}
                                            </label>
                                            {field.required && (
                                                <span className="text-red-500 text-sm">*</span>
                                            )}
                                        </div>
                                        <div className="pl-0">
                                            {renderFieldValue(field, response.response_data[field.name])}
                                        </div>
                                        {field.type === 'select' && field.options && (
                                            <div className="text-xs text-gray-500">
                                                Options: {field.options.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-2">
                            Notes (optional)
                        </h2>
                        <div className="spac1e-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    { response.response_data?.notes || 'No notes provided'}
                                </div>                        
                            </div>
                        </div>
                    </div>
                    
                </div>



                {/* Raw Data (for debugging) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Raw Response Data (Debug)</h3>
                        <pre className="text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(response.response_data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}