import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeftIcon, PlusIcon, TrashIcon, WandIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

interface TenantFormCreateProps {
    formTypes: Record<string, string>;
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

export default function TenantFormCreate({ formTypes }: TenantFormCreateProps) {
    const [sections, setSections] = useState<SimpleFormSection[]>([
        { title: 'General Information', fields: [] }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
    });

    const fieldTypes = [
        { value: 'text', label: 'Text' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'number', label: 'Number' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'date', label: 'Date' },
        { value: 'datetime', label: 'Date & Time' },
        { value: 'select', label: 'Select' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio' },
        { value: 'file', label: 'File Upload' },
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
            schema: { sections }
        };

        post(route('tenant.forms.store'), submitData as any);
    };

    return (
        <AppLayout>
            <Head title="Create Form" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4">
                        <a
                            href={route('tenant.forms.index')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold">Create Form</h1>
                            <p className="text-gray-600">Create a new form for your team</p>
                        </div>
                    </div>
                </div>
                                    {/* Builder Option */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-blue-900">Use Visual Form Builder</h3>
                                <p className="text-sm text-blue-700">Build your form using drag & drop interface</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.visit(route('tenant.forms.builder'))}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <WandIcon className="h-4 w-4" />
                                Open Builder
                            </button>
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
                                    placeholder="Enter form name"
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Form Type *</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Select form type</option>
                                    {Object.entries(formTypes).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
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
                                        {sections.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSection(sectionIndex)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
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

                                                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
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
                            href={route('tenant.forms.index')}
                            className="px-6 py-3 border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Form'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}