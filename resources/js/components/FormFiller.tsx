import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Save, Send } from 'lucide-react';
import { Form, FormField } from '@/types';

interface FormFillerProps {
    form: Form;
    initialData?: Record<string, any>;
    onSaveDraft: (data: Record<string, any>) => void;
    onSubmit: (data: Record<string, any>) => void;
    disabled?: boolean;
}

export default function FormFiller({ 
    form, 
    initialData = {}, 
    onSaveDraft, 
    onSubmit, 
    disabled = false 
}: FormFillerProps) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const prevInitialDataRef = useRef<Record<string, any> | undefined>(undefined);

    useEffect(() => {
        // Only update if initialData prop actually changed (not formData state)
        if (JSON.stringify(prevInitialDataRef.current) !== JSON.stringify(initialData)) {
            setFormData(initialData);
            prevInitialDataRef.current = initialData;
        }
    }, [initialData]);

    const handleInputChange = (fieldName: string, value: any) => {
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
        
        form.schema?.sections?.forEach(section => {
            section.fields?.forEach(field => {
                if (field.required && (!formData[field.name] || formData[field.name] === '')) {
                    newErrors[field.name] = `${field.label} is required`;
                }
            });
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveDraft = () => {
        onSaveDraft(formData);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
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
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={disabled}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            id={fieldId}
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={disabled}
                            className={error ? 'border-red-500' : ''}
                            rows={4}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
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
                            onValueChange={(newValue) => handleInputChange(field.name, newValue)}
                            disabled={disabled}
                        >
                            <SelectTrigger className={error ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.filter(option => option && option.trim() !== '').map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={field.name} className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={fieldId}
                                checked={value === true}
                                onCheckedChange={(checked) => handleInputChange(field.name, checked)}
                                disabled={disabled}
                            />
                            <Label htmlFor={fieldId}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'date':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            type="date"
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            disabled={disabled}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'datetime-local':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            type="datetime-local"
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            disabled={disabled}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            case 'signature':
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                            <p className="text-gray-500 text-sm">
                                Signature functionality not implemented yet
                            </p>
                            <Input
                                id={fieldId}
                                type="text"
                                value={value}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                placeholder="Enter signature or initials"
                                disabled={disabled}
                                className={`mt-2 ${error ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );

            default:
                return (
                    <div key={field.name} className="space-y-2">
                        <Label htmlFor={fieldId}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id={fieldId}
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            disabled={disabled}
                            className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8">
            {form.schema?.sections?.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-6">
                    <div className="border-b pb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {section.title}
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {section.fields?.map(renderField)}
                    </div>
                </div>
            ))}

            {/* Additional optional notes */}
            <div className="space-y-2">
                <Label htmlFor="additional-notes">Additional Notes</Label>
                <Textarea
                    id="additional-notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter any additional notes here"
                    disabled={disabled}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 border-t pt-6">
                <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={disabled}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={disabled}
                >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Form
                </Button>
            </div>
        </div>
    );
}