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
    const [tenantId, setTenantId] = useState(() => {
        if (form?.tenant_id) return form.tenant_id.toString();
        if (tenant?.id) return tenant.id.toString();
        return '';
    });
    const [schema, setSchema] = useState<FormSchema | undefined>(form?.schema);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track changes
    const initialFormData = JSON.stringify({
        name: form?.name || '',
        type: form?.type || '',
        schema: form?.schema
    });

    const currentFormData = JSON.stringify({
        name: formName,
        type: formType,
        schema: schema
    });

    React.useEffect(() => {
        setHasUnsavedChanges(initialFormData !== currentFormData);
    }, [initialFormData, currentFormData]);

    const handleNavigation = (url: string) => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                router.visit(url);
            }
        } else {
            router.visit(url);
        }
    };

    const handleSave = async (newSchema: FormSchema) => {
        // Reset errors
        setErrors({});
        
        // Validation
        const validationErrors: Record<string, string> = {};
        
        if (!formName.trim()) {
            validationErrors.name = 'Form name is required';
        }
        
        if (!formType.trim()) {
            validationErrors.type = 'Form type is required';
        }
        
        if (!tenantId.trim()) {
            validationErrors.tenant_id = 'Tenant ID is required';
        }
        
        if (!newSchema || !newSchema.sections || newSchema.sections.length === 0) {
            validationErrors.schema = 'Form must have at least one section';
        }
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('Please fix the validation errors before saving');
            return;
        }

        setIsSaving(true);
        
        try {
            const data = {
                name: formName.trim(),
                type: formType.trim(),
                tenant_id: tenantId,
                schema: newSchema
            } as any;

            if (form?.id) {
                // Update existing form
                router.put(route('tenant.forms.update', form.id), data, {
                    onSuccess: () => {
                        // Stay on edit page after successful update
                        setSchema(newSchema);
                        setHasUnsavedChanges(false);
                        alert('Form updated successfully!');
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        setErrors(errors as Record<string, string>);
                        alert('Failed to save form. Please check the errors and try again.');
                    }
                });
            } else {
                // Create new form
                router.post(route('tenant.forms.store'), data, {
                    onSuccess: (page: any) => {
                        // Redirect to forms index after creation
                        router.visit(route('tenant.forms.index'));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        setErrors(errors as Record<string, string>);
                        alert('Failed to create form. Please check the errors and try again.');
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

    const mockForm: Form = {
        id: form?.id || 'preview',
        name: formName || 'Form Preview',
        type: formType || 'preview',
        schema: schema || { sections: [] },
        tenant_id: tenantId || '0',
        created_at: form?.created_at || new Date().toISOString(),
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
                                    {hasUnsavedChanges && <span className="ml-1 text-orange-500">*</span>}
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
                            form={mockForm}
                            onSubmit={(data) => {
                                alert('This is preview mode. Form submission is disabled.');
                                console.log('Preview form data:', data);
                            }}
                            showSubmitButton={true}
                            readonly={false}
                        />
                        
                        {/* Error Display */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-red-800 font-semibold mb-2">Validation Errors:</h3>
                                <ul className="text-red-700 text-sm space-y-1">
                                    {Object.entries(errors).map(([field, error]) => (
                                        <li key={field}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
                                onClick={() => handleNavigation(route('tenant.forms.index'))}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Forms
                                {hasUnsavedChanges && <span className="ml-1 text-orange-500">*</span>}
                            </Button>
                            {form?.id && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleNavigation(route('tenant.forms.show', form.id))}
                                >
                                    View Form
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center space-x-4">
                            <span>
                                {form?.id ? 'Editing existing form' : 'Creating new form'}
                            </span>
                            {form?.updated_at && (
                                <span>
                                    Last updated: {new Date(form.updated_at).toLocaleDateString()}
                                </span>
                            )}
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