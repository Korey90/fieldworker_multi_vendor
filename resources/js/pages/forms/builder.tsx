import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import FormBuilder from '@/components/forms/form-builder';
import FormPreview from '@/components/FormPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { FormSchema, Form, Tenant } from '@/types';

interface Props {
    form?: Form;
    tenants?: Tenant[];
}

export default function Builder({ form, tenants = [] }: Props) {
    const [formName, setFormName] = useState(form?.name || '');
    const [formType, setFormType] = useState(form?.type || '');
    const [tenantId, setTenantId] = useState(form?.tenant_id?.toString() || '');
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
                router.put(route('admin.forms.update', form.id), data, {
                    onSuccess: () => {
                        router.visit(route('admin.forms.show', form.id));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save form. Please try again.');
                    }
                });
            } else {
                // Create new form
                router.post(route('admin.forms.store'), data, {
                    onSuccess: () => {
                        router.visit(route('admin.forms.index'));
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
                                onClick={() => router.visit(route('admin.forms.index'))}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Forms
                            </Button>
                            <div className="flex items-center space-x-4">
                                <div>
                                    <Label htmlFor="form-name">Form Name</Label>
                                    <Input
                                        id="form-name"
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Enter form name"
                                        className="w-48"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="form-type">Form Type</Label>
                                    <Input
                                        id="form-type"
                                        type="text"
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value)}
                                        placeholder="e.g., inspection, survey"
                                        className="w-48"
                                    />
                                </div>
                                {tenants.length > 0 && (
                                    <div>
                                        <Label htmlFor="tenant-id">Tenant</Label>
                                        <select
                                            id="tenant-id"
                                            value={tenantId}
                                            onChange={(e) => setTenantId(e.target.value)}
                                            className="w-48 border rounded px-3 py-2"
                                        >
                                            <option value="">Select Tenant</option>
                                            {tenants.map((tenant) => (
                                                <option key={tenant.id} value={tenant.id}>
                                                    {tenant.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            {form?.id ? 'Editing existing form' : 'Creating new form'}
                        </div>
                    </div>
                </div>

                {/* Form Builder */}
                <div className="flex-1">
                    <FormBuilder
                        initialSchema={form?.schema}
                        onSave={handleSave}
                        onPreview={handlePreview}
                    />
                </div>
            </div>
        </AppLayout>
    );
}