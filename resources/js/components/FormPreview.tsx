import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Form, FormSchema, FormSection, FormField } from '@/types';

interface FormPreviewProps {
    form: Form;
    onSubmit?: (data: Record<string, any>) => void;
    showSubmitButton?: boolean;
    readonly?: boolean;
}

export default function FormPreview({ 
    form, 
    onSubmit, 
    showSubmitButton = true, 
    readonly = false 
}: FormPreviewProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (fieldName: string, value: any) => {
        if (readonly) return;
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
        
        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (form.schema && form.schema.sections) {
            form.schema.sections.forEach((section: FormSection) => {
                section.fields.forEach((field: FormField) => {
                    if (field.required && !formData[field.name]) {
                        newErrors[field.name] = `${field.label} is required`;
                    }
                });
            });
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (readonly) return;
        
        if (validateForm()) {
            onSubmit?.(formData);
        }
    };

    const renderField = (field: FormField) => {
        const value = formData[field.name] || '';
        const error = errors[field.name];
        const fieldId = `field-${field.name}`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            type={field.type}
                            value={value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={readonly}
                            className={error ? 'border-red-500' : ''}
                        />
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <textarea
                            id={fieldId}
                            value={value}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={readonly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : ''}`}
                            rows={4}
                        />
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            case 'select':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Select
                            value={value}
                            onValueChange={(value) => handleInputChange(field.name, value)}
                            disabled={readonly}
                        >
                            <SelectTrigger className={error ? 'border-red-500' : ''}>
                                <SelectValue placeholder={field.placeholder || "Select an option"} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option, index) => (
                                    <SelectItem key={index} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.name} className="space-y-3">
                        <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className={`space-y-2 ${error ? 'border border-red-500 rounded-md p-2' : ''}`}>
                            {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id={`${fieldId}-${index}`}
                                        name={field.name}
                                        value={option}
                                        checked={value === option}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        disabled={readonly}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </div>
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.name} className="space-y-3">
                        <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className={`space-y-2 ${error ? 'border border-red-500 rounded-md p-2' : ''}`}>
                            {field.options?.map((option, index) => {
                                const isChecked = Array.isArray(value) ? value.includes(option) : false;
                                return (
                                    <div key={index} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${fieldId}-${index}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                if (readonly) return;
                                                const currentValues = Array.isArray(value) ? value : [];
                                                const newValues = checked
                                                    ? [...currentValues, option]
                                                    : currentValues.filter(v => v !== option);
                                                handleInputChange(field.name, newValues);
                                            }}
                                            disabled={readonly}
                                        />
                                        <Label htmlFor={`${fieldId}-${index}`}>{option}</Label>
                                    </div>
                                );
                            })}
                        </div>
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            case 'file':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            type="file"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field.name, e.target.files?.[0])}
                            disabled={readonly}
                            className={error ? 'border-red-500' : ''}
                            accept={field.validation?.accept}
                        />
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            case 'signature':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                            <div className="space-y-2">
                                <div className="mx-auto w-12 h-12 text-gray-400">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {readonly ? 
                                        'Signature field (preview mode)' : 
                                        'Click here to add your signature'
                                    }
                                </p>
                                {!readonly && (
                                    <button
                                        type="button"
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                        disabled={readonly}
                                        onClick={() => {
                                            alert('Signature pad would open here in the real application');
                                            handleInputChange(field.name, 'signature_placeholder.png');
                                        }}
                                    >
                                        Open Signature Pad
                                    </button>
                                )}
                                {value && (
                                    <div className="mt-2 p-2 bg-white rounded border">
                                        <p className="text-xs text-gray-500">
                                            Signature: {typeof value === 'string' ? value : 'Signature captured'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {field.description && (
                            <p className="text-sm text-gray-600">{field.description}</p>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                );

            default:
                return (
                    <div key={field.name} className="space-y-2">
                        <Label>Unsupported field type: {field.type}</Label>
                    </div>
                );
        }
    };

    if (!form.schema || !form.schema.sections) {
        return (
            <div className="text-center py-8 text-gray-500">
                No form schema available for preview
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {form.schema.sections.map((section: FormSection, sectionIndex: number) => (
                        <div key={sectionIndex} className="space-y-6">
                            {section.title && (
                                <div className="border-b border-gray-200 pb-2">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {section.title}
                                    </h2>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {section.fields.map(renderField)}
                            </div>
                        </div>
                    ))}

                    {showSubmitButton && !readonly && (
                        <div className="pt-6 border-t border-gray-200">
                            <Button type="submit" className="w-full sm:w-auto">
                                Submit Form
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}