import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Trash2, 
    Edit3, 
    Eye, 
    Copy,
    GripVertical,
    Settings,
    Save,
    X
} from 'lucide-react';
import { FIELD_TYPES, renderFieldType } from '@/components/forms/field-types';
import { FormField, FormSection, FormSchema } from '@/types';

interface FormBuilderProps {
    initialSchema?: FormSchema;
    onSave?: (schema: FormSchema) => void;
    onPreview?: (schema: FormSchema) => void;
    onChange?: (schema: FormSchema) => void;
    // Form metadata props
    formName?: string;
    formType?: string;
    tenantId?: string;
    onFormNameChange?: (name: string) => void;
    onFormTypeChange?: (type: string) => void;
    onTenantChange?: (tenantId: string) => void;
}

interface BuilderField extends FormField {
    id: string;
}

interface BuilderSection extends Omit<FormSection, 'fields'> {
    id: string;
    fields: BuilderField[];
}

export default function FormBuilder({ 
    initialSchema, 
    onSave, 
    onPreview, 
    onChange,
    formName = '',
    formType = '',
    tenantId = '',
    onFormNameChange,
    onFormTypeChange,
    onTenantChange
}: FormBuilderProps) {
    const [sections, setSections] = useState<BuilderSection[]>(() => {
        if (initialSchema?.sections) {
            return initialSchema.sections.map((section, index) => ({
                ...section,
                id: `section-${index}`,
                fields: section.fields.map((field, fieldIndex) => ({
                    ...field,
                    id: `field-${index}-${fieldIndex}`
                }))
            }));
        }
        return [{
            id: 'section-0',
            title: 'General Information',
            fields: []
        }];
    });

    // Notify parent about changes with a simple debounced effect
    useEffect(() => {
        if (onChange) {
            const timeoutId = setTimeout(() => {
                const schema: FormSchema = {
                    sections: sections.map(section => ({
                        title: section.title,
                        fields: section.fields.map(field => {
                            const { id, ...fieldWithoutId } = field;
                            return fieldWithoutId;
                        })
                    }))
                };
                onChange(schema);
            }, 100); // 100ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [sections, onChange]);

    const [selectedItem, setSelectedItem] = useState<{ type: 'section' | 'field'; id: string } | null>(null);
    const [draggedField, setDraggedField] = useState<string | null>(null);
    const [draggedExistingField, setDraggedExistingField] = useState<{ fieldId: string; sectionId: string } | null>(null);

    // Add new section
    const addSection = () => {
        const newSection: BuilderSection = {
            id: `section-${Date.now()}`,
            title: 'New Section',
            fields: []
        };
        setSections([...sections, newSection]);
    };

    // Remove section
    const removeSection = (sectionId: string) => {
        setSections(sections.filter(section => section.id !== sectionId));
    };

    // Update section
    const updateSection = (sectionId: string, updates: Partial<BuilderSection>) => {
        setSections(sections.map(section => 
            section.id === sectionId ? { ...section, ...updates } : section
        ));
    };

    // Add field to section
    const addFieldToSection = (sectionId: string, fieldType: string) => {
        const fieldTypeConfig = FIELD_TYPES.find(ft => ft.type === fieldType);
        if (!fieldTypeConfig) return;

        const newField: BuilderField = {
            id: `field-${Date.now()}`,
            name: `field_${Date.now()}`,
            type: fieldType as any,
            ...(fieldTypeConfig.defaultProps as any)
        };

        setSections(sections.map(section => 
            section.id === sectionId 
                ? { ...section, fields: [...section.fields, newField] }
                : section
        ));
    };

    // Remove field
    const removeField = (sectionId: string, fieldId: string) => {
        setSections(sections.map(section => 
            section.id === sectionId 
                ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
                : section
        ));
    };

    // Update field
    const updateField = (sectionId: string, fieldId: string, updates: Partial<BuilderField>) => {
        setSections(sections.map(section => 
            section.id === sectionId 
                ? { 
                    ...section, 
                    fields: section.fields.map(field => 
                        field.id === fieldId ? { ...field, ...updates } : field
                    )
                }
                : section
        ));
    };

    // Duplicate field
    const duplicateField = (sectionId: string, fieldId: string) => {
        const section = sections.find(s => s.id === sectionId);
        const field = section?.fields.find(f => f.id === fieldId);
        if (!field) return;

        const duplicatedField: BuilderField = {
            ...field,
            id: `field-${Date.now()}`,
            name: `${field.name}_copy`,
            label: `${field.label} (Copy)`
        };

        setSections(sections.map(section => 
            section.id === sectionId 
                ? { ...section, fields: [...section.fields, duplicatedField] }
                : section
        ));
    };

    // Reorder fields within a section
    const reorderFields = (sectionId: string, fromIndex: number, toIndex: number) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                const newFields = [...section.fields];
                const [removed] = newFields.splice(fromIndex, 1);
                newFields.splice(toIndex, 0, removed);
                return { ...section, fields: newFields };
            }
            return section;
        }));
    };

    // Move field between sections
    const moveFieldBetweenSections = (fieldId: string, fromSectionId: string, toSectionId: string, toIndex?: number) => {
        const fromSection = sections.find(s => s.id === fromSectionId);
        const field = fromSection?.fields.find(f => f.id === fieldId);
        if (!field) return;

        setSections(sections.map(section => {
            if (section.id === fromSectionId) {
                // Remove field from source section
                return { ...section, fields: section.fields.filter(f => f.id !== fieldId) };
            } else if (section.id === toSectionId) {
                // Add field to target section
                const newFields = [...section.fields];
                if (toIndex !== undefined) {
                    newFields.splice(toIndex, 0, field);
                } else {
                    newFields.push(field);
                }
                return { ...section, fields: newFields };
            }
            return section;
        }));
    };

    // Generate schema for export
    const generateSchema = (): FormSchema => {
        return {
            sections: sections.map(section => ({
                title: section.title,
                fields: section.fields.map(({ id, ...field }) => field)
            }))
        };
    };

    // Handle save
    const handleSave = () => {
        const schema = generateSchema();
        onSave?.(schema);
    };

    // Handle preview
    const handlePreview = () => {
        const schema = generateSchema();
        onPreview?.(schema);
    };

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, fieldType: string) => {
        setDraggedField(fieldType);
        setDraggedExistingField(null);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleExistingFieldDragStart = (e: React.DragEvent, fieldId: string, sectionId: string) => {
        setDraggedExistingField({ fieldId, sectionId });
        setDraggedField(null);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedExistingField ? 'move' : 'copy';
    };

    const handleDrop = (e: React.DragEvent, sectionId: string, dropIndex?: number) => {
        e.preventDefault();
        
        if (draggedField) {
            // Dropping new field from palette
            addFieldToSection(sectionId, draggedField);
            setDraggedField(null);
        } else if (draggedExistingField) {
            // Moving existing field
            const { fieldId, sectionId: sourceSectionId } = draggedExistingField;
            
            if (sourceSectionId === sectionId) {
                // Reordering within same section
                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    const currentIndex = section.fields.findIndex(f => f.id === fieldId);
                    const targetIndex = dropIndex !== undefined ? dropIndex : section.fields.length;
                    if (currentIndex !== targetIndex && currentIndex !== -1) {
                        reorderFields(sectionId, currentIndex, targetIndex);
                    }
                }
            } else {
                // Moving between sections
                moveFieldBetweenSections(fieldId, sourceSectionId, sectionId, dropIndex);
            }
            
            setDraggedExistingField(null);
        }
    };

    const handleFieldDragOver = (e: React.DragEvent, targetFieldId: string, sectionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedExistingField) {
            const section = sections.find(s => s.id === sectionId);
            if (section) {
                const targetIndex = section.fields.findIndex(f => f.id === targetFieldId);
                // Show drop indicator
                e.dataTransfer.dropEffect = 'move';
            }
        }
    };

    const handleFieldDrop = (e: React.DragEvent, targetFieldId: string, sectionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedExistingField) {
            const section = sections.find(s => s.id === sectionId);
            if (section) {
                const targetIndex = section.fields.findIndex(f => f.id === targetFieldId);
                handleDrop(e, sectionId, targetIndex);
            }
        }
    };

    const getSelectedField = () => {
        if (!selectedItem || selectedItem.type !== 'field') return null;
        
        for (const section of sections) {
            const field = section.fields.find(f => f.id === selectedItem.id);
            if (field) return { field, sectionId: section.id };
        }
        return null;
    };

    const getSelectedSection = () => {
        if (!selectedItem || selectedItem.type !== 'section') return null;
        return sections.find(s => s.id === selectedItem.id);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Field Palette */}
            <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Field Types</h3>
                <div className="space-y-2">
                    {FIELD_TYPES.map((fieldType) => (
                        <div
                            key={fieldType.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, fieldType.type)}
                            className="p-3 border border-gray-200 rounded cursor-move hover:bg-gray-50 hover:border-blue-300 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{fieldType.icon}</span>
                                <div>
                                    <div className="font-medium text-sm">{fieldType.label}</div>
                                    <div className="text-xs text-gray-500">{fieldType.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center space-x-3">
                            <h2 className="text-xl font-semibold">Form Builder</h2>
                            <Badge variant="outline">{sections.length} sections</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={addSection}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Section
                            </Button>
                            <Button variant="outline" onClick={handlePreview}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Form
                            </Button>
                        </div>
                    </div>

                    
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Form Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>

                            {/* Form metadata inputs */}
                            <div className="flex items-center space-x-4">
                                <div>
                                    <Label htmlFor="form-name">Form Name</Label>
                                    <Input
                                        id="form-name"
                                        type="text"
                                        value={formName}
                                        onChange={(e) => onFormNameChange?.(e.target.value)}
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
                                        onChange={(e) => onFormTypeChange?.(e.target.value)}
                                        placeholder="e.g., inspection, survey"
                                        className="w-48"
                                    />
                                </div>
                     
                                <div>
                                    <Label htmlFor="tenant-id">Tenant</Label>
                                    <Input
                                        id="tenant-id"
                                        value={tenantId}
                                        className="w-48"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </CardContent>

                    </Card>


                    {/* Sections */}
                    <div className="space-y-6">
                        {sections.map((section) => (
                            <Card 
                                key={section.id}
                                className={`${selectedItem?.type === 'section' && selectedItem.id === section.id ? 'ring-2 ring-blue-500' : ''}`}
                                onClick={() => setSelectedItem({ type: 'section', id: section.id })}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{section.title}</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedItem({ type: 'section', id: section.id });
                                                }}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSection(section.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, section.id)}
                                        className={`min-h-[100px] ${
                                            section.fields.length === 0 
                                                ? 'border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500' 
                                                : 'space-y-4'
                                        }`}
                                    >
                                        {section.fields.length === 0 ? (
                                            <p>Drag fields here from the sidebar</p>
                                        ) : (
                                            <>
                                                {section.fields.map((field) => (
                                                    <div
                                                        key={field.id}
                                                        draggable
                                                        onDragStart={(e) => handleExistingFieldDragStart(e, field.id, section.id)}
                                                        onDragOver={(e) => handleFieldDragOver(e, field.id, section.id)}
                                                        onDrop={(e) => handleFieldDrop(e, field.id, section.id)}
                                                        className={`p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                                                            selectedItem?.type === 'field' && selectedItem.id === field.id 
                                                                ? 'ring-2 ring-blue-500 bg-blue-50' 
                                                                : ''
                                                        } ${
                                                            draggedExistingField?.fieldId === field.id 
                                                                ? 'opacity-50' 
                                                                : ''
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedItem({ type: 'field', id: field.id });
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <div 
                                                                    className="cursor-grab active:cursor-grabbing"
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                >
                                                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                                <span className="font-medium">{field.label}</span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {field.type}
                                                                </Badge>
                                                                {field.required && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Required
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        duplicateField(section.id, field.id);
                                                                    }}
                                                                >
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeField(section.id, field.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Field Preview */}
                                                        <div className="opacity-75 pointer-events-none">
                                                            {renderFieldType(field, { disabled: true })}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Drop zone for new fields at the end */}
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, section.id)}
                                                    className={`min-h-[50px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm hover:border-blue-300 hover:text-blue-500 transition-colors ${
                                                        draggedField ? 'border-blue-300 bg-blue-50' : ''
                                                    }`}
                                                >
                                                    {draggedField ? 'Drop here to add field' : 'Drop new fields here'}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Properties</h3>
                    {selectedItem && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItem(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {!selectedItem ? (
                    <div className="text-center text-gray-500 py-8">
                        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Select a section or field to edit properties</p>
                    </div>
                ) : selectedItem.type === 'section' ? (
                    // Section Properties
                    (() => {
                        const section = getSelectedSection();
                        if (!section) return null;

                        return (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="section-title">Section Title</Label>
                                    <Input
                                        id="section-title"
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                        placeholder="Enter section title"
                                    />
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    // Field Properties
                    (() => {
                        const selectedField = getSelectedField();
                        if (!selectedField) return null;

                        const { field, sectionId } = selectedField;

                        return (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="field-label">Field Label</Label>
                                    <Input
                                        id="field-label"
                                        value={field.label}
                                        onChange={(e) => updateField(sectionId, field.id, { label: e.target.value })}
                                        placeholder="Enter field label"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="field-name">Field Name</Label>
                                    <Input
                                        id="field-name"
                                        value={field.name}
                                        onChange={(e) => updateField(sectionId, field.id, { name: e.target.value })}
                                        placeholder="Enter field name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="field-placeholder">Placeholder</Label>
                                    <Input
                                        id="field-placeholder"
                                        value={field.placeholder || ''}
                                        onChange={(e) => updateField(sectionId, field.id, { placeholder: e.target.value })}
                                        placeholder="Enter placeholder text"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="field-description">Description</Label>
                                    <Input
                                        id="field-description"
                                        value={field.description || ''}
                                        onChange={(e) => updateField(sectionId, field.id, { description: e.target.value })}
                                        placeholder="Enter field description"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="field-required"
                                        checked={field.required}
                                        onChange={(e) => updateField(sectionId, field.id, { required: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Label htmlFor="field-required">Required field</Label>
                                </div>

                                {/* Options for select, radio, checkbox fields */}
                                {['select', 'radio', 'checkbox'].includes(field.type) && (
                                    <div>
                                        <Label>Options</Label>
                                        <div className="space-y-2">
                                            {field.options?.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...(field.options || [])];
                                                            newOptions[index] = e.target.value;
                                                            updateField(sectionId, field.id, { options: newOptions });
                                                        }}
                                                        placeholder={`Option ${index + 1}`}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newOptions = field.options?.filter((_, i) => i !== index);
                                                            updateField(sectionId, field.id, { options: newOptions });
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                                    updateField(sectionId, field.id, { options: newOptions });
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
}