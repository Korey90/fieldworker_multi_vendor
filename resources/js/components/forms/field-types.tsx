import React from 'react';
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
import { FormField } from '@/types';

interface FieldTypeProps {
    field: FormField;
    value?: any;
    onChange?: (value: any) => void;
    disabled?: boolean;
    error?: string;
}

// Text Input Field
export const TextFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    value = '', 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-2">
            <Label htmlFor={fieldId}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={fieldId}
                type={field.type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className={error ? 'border-red-500' : ''}
            />
            {field.description && (
                <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

// Textarea Field
export const TextareaFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    value = '', 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-2">
            <Label htmlFor={fieldId}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <textarea
                id={fieldId}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : ''}`}
                rows={4}
            />
            {field.description && (
                <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

// Select Field
export const SelectFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    value = '', 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-2">
            <Label htmlFor={fieldId}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
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
};

// Radio Field
export const RadioFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    value = '', 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-3">
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
                            onChange={(e) => onChange?.(e.target.value)}
                            disabled={disabled}
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
};

// Checkbox Field
export const CheckboxFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    value = [], 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-3">
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
                                    const currentValues = Array.isArray(value) ? value : [];
                                    const newValues = checked
                                        ? [...currentValues, option]
                                        : currentValues.filter(v => v !== option);
                                    onChange?.(newValues);
                                }}
                                disabled={disabled}
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
};

// File Field
export const FileFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-2">
            <Label htmlFor={fieldId}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={fieldId}
                type="file"
                onChange={(e) => onChange?.(e.target.files?.[0])}
                disabled={disabled}
                className={error ? 'border-red-500' : ''}
                accept={field.validation?.accept}
            />
            {field.description && (
                <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

// Signature Field
export const SignatureFieldType: React.FC<FieldTypeProps> = ({ 
    field, 
    value, 
    onChange, 
    disabled = false, 
    error 
}) => {
    const fieldId = `field-${field.name}`;
    
    return (
        <div className="space-y-2">
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
                        {disabled ? 
                            'Signature field (read-only)' : 
                            'Click here to add your signature'
                        }
                    </p>
                    {!disabled && (
                        <button
                            type="button"
                            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={disabled}
                            onClick={() => {
                                // In a real app, this would open a signature pad
                                const signature = prompt('Enter signature (placeholder):');
                                if (signature) {
                                    onChange?.(signature);
                                }
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
};

// Field Type Factory
export const renderFieldType = (field: FormField, props: Omit<FieldTypeProps, 'field'>) => {
    switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
        case 'date':
        case 'datetime-local':
            return <TextFieldType field={field} {...props} />;
        case 'textarea':
            return <TextareaFieldType field={field} {...props} />;
        case 'select':
            return <SelectFieldType field={field} {...props} />;
        case 'radio':
            return <RadioFieldType field={field} {...props} />;
        case 'checkbox':
            return <CheckboxFieldType field={field} {...props} />;
        case 'file':
            return <FileFieldType field={field} {...props} />;
        case 'signature':
            return <SignatureFieldType field={field} {...props} />;
        default:
            return (
                <div className="p-4 border border-red-300 bg-red-50 rounded">
                    <p className="text-red-600">Unsupported field type: {field.type}</p>
                </div>
            );
    }
};

// Field Type Definitions for Builder
export const FIELD_TYPES = [
    {
        type: 'text',
        label: 'Text Input',
        icon: '📝',
        description: 'Single line text input',
        defaultProps: {
            label: 'Text Field',
            placeholder: 'Enter text...',
            required: false
        }
    },
    {
        type: 'textarea',
        label: 'Textarea',
        icon: '📄',
        description: 'Multi-line text input',
        defaultProps: {
            label: 'Textarea Field',
            placeholder: 'Enter text...',
            required: false
        }
    },
    {
        type: 'email',
        label: 'Email',
        icon: '📧',
        description: 'Email address input',
        defaultProps: {
            label: 'Email Field',
            placeholder: 'Enter email...',
            required: false
        }
    },
    {
        type: 'number',
        label: 'Number',
        icon: '🔢',
        description: 'Numeric input',
        defaultProps: {
            label: 'Number Field',
            placeholder: 'Enter number...',
            required: false
        }
    },
    {
        type: 'date',
        label: 'Date',
        icon: '📅',
        description: 'Date picker',
        defaultProps: {
            label: 'Date Field',
            required: false
        }
    },
    {
        type: 'datetime-local',
        label: 'Date & Time',
        icon: '🕐',
        description: 'Date and time picker',
        defaultProps: {
            label: 'Date & Time Field',
            required: false
        }
    },
    {
        type: 'select',
        label: 'Select',
        icon: '📋',
        description: 'Dropdown selection',
        defaultProps: {
            label: 'Select Field',
            placeholder: 'Choose an option...',
            required: false,
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    },
    {
        type: 'radio',
        label: 'Radio Buttons',
        icon: '🔘',
        description: 'Single choice from multiple options',
        defaultProps: {
            label: 'Radio Field',
            required: false,
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    },
    {
        type: 'checkbox',
        label: 'Checkboxes',
        icon: '☑️',
        description: 'Multiple choice selection',
        defaultProps: {
            label: 'Checkbox Field',
            required: false,
            options: ['Option 1', 'Option 2', 'Option 3']
        }
    },
    {
        type: 'file',
        label: 'File Upload',
        icon: '📎',
        description: 'File upload input',
        defaultProps: {
            label: 'File Field',
            required: false
        }
    },
    {
        type: 'signature',
        label: 'Signature',
        icon: '✍️',
        description: 'Digital signature pad',
        defaultProps: {
            label: 'Signature Field',
            required: false
        }
    }
] as const;