import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import FormPreview from '@/components/FormPreview';
import { Form } from '@/types';

interface Props {
    form: Form;
}

export default function Preview({ form }: Props) {
    const handleFormSubmit = (data: Record<string, any>) => {
        // For preview mode, we could show a modal or alert
        alert('This is preview mode. Form submission is disabled.');
        console.log('Form data:', data);
    };

    return (
        <AppLayout>
            <Head title={`Preview: ${form.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.forms.show', form.id)}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Form
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Eye className="h-6 w-6 mr-2 text-blue-600" />
                                Form Preview
                            </h1>
                            <p className="text-gray-600">Preview how the form will appear to users</p>
                        </div>
                    </div>
                </div>

                {/* Form Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Eye className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Preview Mode
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    This is how the form "{form.name}" will appear to users. 
                                    Form submissions are disabled in preview mode.
                                </p>
                                <div className="mt-2 flex space-x-4 text-xs">
                                    <span><strong>Form ID:</strong> {form.id}</span>
                                    <span><strong>Type:</strong> {form.type}</span>
                                    {form.tenant && (
                                        <span><strong>Tenant:</strong> {form.tenant.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Preview */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <FormPreview 
                        form={form}
                        onSubmit={handleFormSubmit}
                        showSubmitButton={true}
                        readonly={false}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                    <Link
                        href={route('admin.forms.show', form.id)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Form Details
                    </Link>
                    
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.forms.edit', form.id)}
                        >
                            <Button variant="outline">
                                Edit Form
                            </Button>
                        </Link>
                        
                        <Button
                            onClick={() => window.print()}
                            variant="outline"
                        >
                            Print Preview
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}