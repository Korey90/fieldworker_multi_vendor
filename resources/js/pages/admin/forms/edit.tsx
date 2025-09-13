import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeftIcon, PlusIcon, TrashIcon, WandIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { Form, Tenant } from '@/types';

interface AdminFormEditProps {
    form: Form;
    tenants: Tenant[];
}

interface SimpleFormField {
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
}

interface SimpleFormSection {
    title: string;
    fields: SimpleFormField[];
}

export default function AdminFormEdit({ form, tenants }: AdminFormEditProps) {
    const [sections, setSections] = useState<SimpleFormSection[]>(
        form.schema?.sections || [{ title: 'General Information', fields: [] }]
    );

    const { data, setData, put, processing, errors } = useForm({
        name: form.name,
        type: form.type,
        tenant_id: form.tenant_id.toString(),
    });

    const fieldTypes = [
        { value: 'text', label: 'Text' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'number', label: 'Number' },
        { value: 'email', label: 'Email' },
        { value: 'date', label: 'Date' },
        { value: 'datetime-local', label: 'Date & Time' },
        { value: 'select', label: 'Select' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio' },
        { value: 'file', label: 'File' },
        { value: 'signature', label: 'Signature' }
    ];

    const addSection = () => {
        setSections([...sections, { title: 'New Section', fields: [] }]);
    };

    const removeSection = (sectionIndex: number) => {
        setSections(sections.filter((_, index) => index !== sectionIndex));
    };

    const updateSection = (sectionIndex: number, title: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].title = title;
        setSections(newSections);
    };

    const addField = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields.push({
            name: `field_${Date.now()}`,
            type: 'text',
            label: 'New Field',
            required: false
        });
        setSections(newSections);
    };

    const removeField = (sectionIndex: number, fieldIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields.splice(fieldIndex, 1);
        setSections(newSections);
    };

    const updateField = (sectionIndex: number, fieldIndex: number, field: Partial<SimpleFormField>) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields[fieldIndex] = {
            ...newSections[sectionIndex].fields[fieldIndex],
            ...field
        };
        setSections(newSections);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            name: data.name,
            type: data.type,
            tenant_id: data.tenant_id,
            schema: { sections }
        };

        put(route('admin.forms.update', form.id), submitData as any);
    };

    return (
        <AppLayout>
            <Head title={`Admin - Edit Form: ${form.name}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <a
                            href={route('admin.forms.show', form.id)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Form: {form.name}</h1>
                            <p className="text-gray-600">Update form settings and schema</p>
                        </div>
                    </div>
                    
                    {/* Builder Option */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-blue-900">Use Visual Form Builder</h3>
                                <p className="text-sm text-blue-700">Edit this form using drag & drop interface</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.visit(route('admin.forms.builder'), {
                                    data: { form_id: form.id }
                                })}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <WandIcon className="h-4 w-4" />
                                Edit in Builder
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Form Name *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Type *</label>
                                <input
                                    type="text"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    placeholder="e.g., inspection, survey, checklist"
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Tenant *</label>
                                <select
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id.toString()}>
                                            {tenant.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.tenant_id && <div className="text-red-500 text-sm mt-1">{errors.tenant_id}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Form Builder */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Form Builder</h2>
                            <button
                                type="button"
                                onClick={addSection}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Section
                            </button>
                        </div>

                        <div className="space-y-6">
                            {sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <input
                                            type="text"
                                            placeholder="Section Title"
                                            value={section.title}
                                            onChange={(e) => updateSection(sectionIndex, e.target.value)}
                                            className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSection(sectionIndex)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {section.fields.map((field, fieldIndex) => (
                                            <div key={fieldIndex} className="bg-gray-50 rounded p-3">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Field Name</label>
                                                        <input
                                                            type="text"
                                                            value={field.name}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { name: e.target.value })}
                                                            className="w-full text-sm border rounded px-2 py-1"
                                                            placeholder="field_name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Label</label>
                                                        <input
                                                            type="text"
                                                            value={field.label}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { label: e.target.value })}
                                                            className="w-full text-sm border rounded px-2 py-1"
                                                            placeholder="Field Label"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1">Type</label>
                                                        <select
                                                            value={field.type}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { type: e.target.value })}
                                                            className="w-full text-sm border rounded px-2 py-1"
                                                        >
                                                            {fieldTypes.map((type) => (
                                                                <option key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, { required: e.target.checked })}
                                                                className="mr-1"
                                                            />
                                                            <span className="text-xs">Required</span>
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeField(sectionIndex, fieldIndex)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {(field.type === 'select' || field.type === 'radio') && (
                                                    <div className="mt-3">
                                                        <label className="block text-xs font-medium mb-1">Options (one per line)</label>
                                                        <textarea
                                                            value={field.options?.join('\n') || ''}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { 
                                                                options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                                            })}
                                                            className="w-full text-sm border rounded px-2 py-1"
                                                            rows={3}
                                                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => addField(sectionIndex)}
                                                className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                                Add Field
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4">
                        <a
                            href={route('admin.forms.show', form.id)}
                            className="px-6 py-3 border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Form'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}