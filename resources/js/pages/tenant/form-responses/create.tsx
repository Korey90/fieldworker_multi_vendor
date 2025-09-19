import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import FormFiller from '@/components/FormFiller';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Form, FormResponse } from '@/types';

interface Props {
    form: Form;
    response?: FormResponse;
}

export default function Create({ form, response }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = !!response;

    const handleSubmit = async (formData: Record<string, any>, isSubmitted: boolean = false) => {
        setIsSaving(true);
        
        try {
            const data = {
                response_data: formData,
                is_submitted: isSubmitted,
            };

            if (isEditing) {
                router.put(route('tenant.form-responses.update', [form.id, response.id]), data, {
                    onSuccess: () => {
                        if (isSubmitted) {
                            router.visit(route('tenant.form-responses.show', [form.id, response.id]));
                        } else {
                            router.visit(route('tenant.form-responses.index', form.id));
                        }
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save response. Please try again.');
                    }
                });
            } else {
                router.post(route('tenant.form-responses.store', form.id), data, {
                    onSuccess: () => {
                        router.visit(route('tenant.form-responses.index', form.id));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save response. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save response. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = (formData: Record<string, any>) => {
        handleSubmit(formData, false);
    };

    const handleSubmitFinal = (formData: Record<string, any>) => {
        if (confirm('Are you sure you want to submit this form? You won\'t be able to edit it after submission.')) {
            handleSubmit(formData, true);
        }
    };

    return (
        <AppLayout>
            <Head title={`${isEditing ? 'Edit' : 'Fill'} Form - ${form.name}`} />
            
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
                            <h1 className="text-2xl font-bold">
                                {isEditing ? 'Edit Response' : 'Fill Form'}
                            </h1>
                            <p className="text-gray-600">{form.name}</p>
                        </div>
                    </div>
                </div>

                {/* Form Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">i</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">
                                {isEditing ? 'Editing Draft Response' : 'How to fill this form'}
                            </h3>
                            <div className="mt-1 text-sm text-blue-700">
                                {isEditing ? (
                                    <p>You can modify your responses and save as draft or submit the final version.</p>
                                ) : (
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Fill out all required fields marked with *</li>
                                        <li>You can save as draft and continue later</li>
                                        <li>Once submitted, you cannot edit the response</li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg border p-6">
                    <FormFiller
                        form={form}
                        initialData={response?.response_data}
                        onSaveDraft={handleSaveDraft}
                        onSubmit={handleSubmitFinal}
                        disabled={isSaving}
                    />
                </div>

                {/* Status Information */}
                {isEditing && response && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Response Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Created:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(response.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Last Updated:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(response.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    response.is_submitted 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {response.is_submitted ? 'Submitted' : 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}