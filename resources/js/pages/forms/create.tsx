import { Form } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Plus, 
    Trash2, 
    Save, 
    GripVertical,
    Settings,
    FileText,
    Calendar,
    CheckSquare,
    Type,
    Hash,
    Mail,
    Upload,
    Edit
} from 'lucide-react';

interface Props {
    form?: Form;
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

export default function FormBuilder({ form }: Props) {
    const isEditing = !!form;
    const [sections, setSections] = useState<SimpleFormSection[]>(
        form?.schema?.sections || [{ title: 'General Information', fields: [] }]
    );

    const { data, setData, post, put, processing, errors } = useForm({
        name: form?.name || '',
        type: form?.type || 'job',
    });

    const fieldTypes = [
        { value: 'text', label: 'Text', icon: Type },
        { value: 'textarea', label: 'Textarea', icon: FileText },
        { value: 'number', label: 'Number', icon: Hash },
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'date', label: 'Date', icon: Calendar },
        { value: 'datetime-local', label: 'Date & Time', icon: Calendar },
        { value: 'select', label: 'Select', icon: Settings },
        { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
        { value: 'radio', label: 'Radio', icon: Settings },
        { value: 'file', label: 'File Upload', icon: Upload },
        { value: 'signature', label: 'Signature', icon: Edit },
    ];

    const formTypes = [
        { value: 'job', label: 'Job Form' },
        { value: 'inspection', label: 'Inspection Form' },
        { value: 'maintenance', label: 'Maintenance Form' },
        { value: 'safety', label: 'Safety Form' },
        { value: 'customer_feedback', label: 'Customer Feedback' },
        { value: 'custom', label: 'Custom Form' },
    ];

    const addSection = () => {
        const newSections = [...sections, { title: 'New Section', fields: [] }];
        setSections(newSections);
    };

    const updateSection = (sectionIndex: number, title: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].title = title;
        setSections(newSections);
    };

    const deleteSection = (sectionIndex: number) => {
        const newSections = sections.filter((_, index) => index !== sectionIndex);
        setSections(newSections);
    };

    const addField = (sectionIndex: number) => {
        const newField: SimpleFormField = {
            name: `field_${Date.now()}`,
            type: 'text',
            label: 'New Field',
            required: false,
        };
        
        const newSections = [...sections];
        newSections[sectionIndex].fields.push(newField);
        setSections(newSections);
    };

    const updateField = (sectionIndex: number, fieldIndex: number, field: Partial<SimpleFormField>) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields[fieldIndex] = {
            ...newSections[sectionIndex].fields[fieldIndex],
            ...field,
        };
        setSections(newSections);
    };

    const deleteField = (sectionIndex: number, fieldIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].fields.splice(fieldIndex, 1);
        setSections(newSections);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            name: data.name,
            type: data.type,
            schema: { sections },
        };

        if (isEditing) {
            put(`/admin/forms/${form.id}`, submitData as any);
        } else {
            post('/admin/forms', submitData as any);
        }
    };

    const getFieldIcon = (type: string) => {
        const fieldType = fieldTypes.find(ft => ft.value === type);
        const Icon = fieldType?.icon || Type;
        return <Icon className="h-4 w-4" />;
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Forms', href: '/admin/forms' },
                { title: isEditing ? 'Edit Form' : 'Create Form', href: '#' },
            ]}
        >
            <Head title={isEditing ? `Edit Form: ${form.name}` : 'Create Form'} />
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {isEditing ? 'Edit Form' : 'Create Form'}
                        </h1>
                        <p className="text-gray-600">
                            Build dynamic forms with sections and fields
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/forms">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Form'}
                        </Button>
                    </div>
                </div>

                {/* Form Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Settings</CardTitle>
                        <CardDescription>
                            Configure basic form properties
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Form Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter form name..."
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Form Type</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => setData('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select form type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Builder */}
                <div className="space-y-6">
                    {sections.map((section, sectionIndex) => (
                        <Card key={sectionIndex}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                                        <Input
                                            value={section.title}
                                            onChange={(e) => updateSection(sectionIndex, e.target.value)}
                                            className="font-medium"
                                            placeholder="Section title..."
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => addField(sectionIndex)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Field
                                        </Button>
                                        {sections.length > 1 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deleteSection(sectionIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {section.fields.map((field, fieldIndex) => (
                                        <div 
                                            key={fieldIndex}
                                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                                    {getFieldIcon(field.type)}
                                                    <span className="text-sm font-medium">
                                                        {field.label || 'Untitled Field'}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => deleteField(sectionIndex, fieldIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Field Label</Label>
                                                    <Input
                                                        value={field.label}
                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, { label: e.target.value })}
                                                        placeholder="Field label..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Field Name</Label>
                                                    <Input
                                                        value={field.name}
                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, { name: e.target.value })}
                                                        placeholder="field_name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Field Type</Label>
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(value) => updateField(sectionIndex, fieldIndex, { type: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fieldTypes.map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Required</Label>
                                                    <div className="flex items-center space-x-2 h-10">
                                                        <input
                                                            type="checkbox"
                                                            id={`required-${sectionIndex}-${fieldIndex}`}
                                                            checked={field.required}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { required: e.target.checked })}
                                                            className="h-4 w-4"
                                                        />
                                                        <Label htmlFor={`required-${sectionIndex}-${fieldIndex}`}>
                                                            Required
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {(field.type === 'select' || field.type === 'radio') && (
                                                <div className="mt-4 space-y-2">
                                                    <Label>Options (one per line)</Label>
                                                    <textarea
                                                        value={field.options?.join('\n') || ''}
                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, { 
                                                            options: e.target.value.split('\n').filter((opt: string) => opt.trim()) 
                                                        })}
                                                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                        rows={3}
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {section.fields.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="mx-auto h-8 w-8 mb-2" />
                                            <p>No fields in this section yet.</p>
                                            <p className="text-sm">Click "Add Field" to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addSection}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}