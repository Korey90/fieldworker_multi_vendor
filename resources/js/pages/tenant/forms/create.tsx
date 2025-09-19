import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import FormBuilder from '@/components/forms/form-builder';
import FormPreview from '@/components/FormPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { FormSchema, Form, Tenant } from '@/types';

interface Props {
    form?: Form;
    tenant?: Tenant;
}

export default function Builder({ form, tenant }: Props) {
    const [formName, setFormName] = useState(form?.name || '');
    const [formType, setFormType] = useState(form?.type || '');
    const [tenantId, setTenantId] = useState(form?.tenant_id?.toString() || tenant?.id.toString() || '');
    const [schema, setSchema] = useState<FormSchema | undefined>(form?.schema);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (newSchema: FormSchema) => {
        if (!formName.trim() || !formType.trim()) {
            alert('Please enter form name and type');
            return;
        }

        setIsSaving(true);
        
        try {
            const data = {
                name: formName,
                type: formType,
                tenant_id: tenantId,
                schema: newSchema
            } as any;

            if (form?.id) {
                // Update existing form
                router.put(route('tenant.forms.update', form.id), data, {
                    onSuccess: () => {
                        router.visit(route('tenant.forms.show', form.id));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save form. Please try again.');
                    }
                });
            } else {
                // Create new form
                router.post(route('tenant.forms.store'), data, {
                    onSuccess: () => {
                        router.visit(route('tenant.forms.index'));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save form. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save form. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreview = (newSchema: FormSchema) => {
        setSchema(newSchema);
        setIsPreviewMode(true);
    };

    const handleSchemaChange = useCallback((newSchema: FormSchema) => {
        setSchema(newSchema);
    }, []);

    const mockForm = {
        id: form?.id || 'preview',
        name: formName || 'Form Preview',
        type: formType || 'preview',
        schema: schema || { sections: [] },
        tenant_id: form?.tenant_id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    if (isPreviewMode && schema) {
        return (
            <AppLayout>
                <Head title={`Preview: ${formName || 'Form Builder'}`} />
                
                <div className="p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Preview Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPreviewMode(false)}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Builder
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">Form Preview</h1>
                                    <p className="text-gray-600">Preview how your form will look to users</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSave(schema)}
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : (form?.id ? 'Update Form' : 'Save Form')}
                            </Button>
                        </div>

                        {/* Preview */}
                        <FormPreview 
                            form={mockForm as Form}
                            onSubmit={(data) => {
                                alert('This is preview mode. Form submission is disabled.');
                                console.log('Preview form data:', data);
                            }}
                            showSubmitButton={true}
                            readonly={false}
                        />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title={form?.id ? `Edit Form: ${form.name}` : 'Form Builder'} />
            
            <div className="h-screen flex flex-col">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.visit(route('tenant.forms.index'))}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Forms
                            </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                            {form?.id ? 'Editing existing form' : 'Creating new form'}
                        </div>
                    </div>
                </div>

                {/* Form Builder */}
                <div className="flex-1">
                    <FormBuilder
                        initialSchema={schema || form?.schema}
                        onSave={handleSave}
                        onPreview={handlePreview}
                        onChange={handleSchemaChange}
                        formName={formName}
                        formType={formType}
                        tenantId={tenantId}
                        onFormNameChange={setFormName}
                        onFormTypeChange={setFormType}
                        onTenantChange={setTenantId}
                    />
                </div>
            </div>
        </AppLayout>
    );
}