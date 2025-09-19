import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  Save,
  Eye,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Calendar,
  Clock,
  ChevronDown,
  Circle,
  Square,
  Paperclip
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'datetime' | 'select' | 'radio' | 'checkbox' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormData {
  name: string;
  type: string;
  schema: any[];
}

interface Form {
  id: string;
  name: string;
  type: string;
  schema: FormField[];
  created_at: string;
  updated_at: string;
}

interface Props {
  form: Form;
  formTypes: Record<string, string>;
}

export default function Edit({ form, formTypes }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: form.name || '',
    type: form.type || '',
    schema: (form.schema || []) as any[],
  });

  const [draggedField, setDraggedField] = useState<number | null>(null);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'textarea', label: 'Text Area', icon: AlignLeft },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'phone', label: 'Phone', icon: Phone },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'datetime', label: 'Date & Time', icon: Clock },
    { type: 'select', label: 'Dropdown', icon: ChevronDown },
    { type: 'radio', label: 'Radio Buttons', icon: Circle },
    { type: 'checkbox', label: 'Checkboxes', icon: Square },
    { type: 'file', label: 'File Upload', icon: Paperclip },
  ];

  const addField = (type: FormField['type']) => {
    const newField: any = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `New ${type} field`,
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
    };

    setData('schema', [...data.schema, newField]);
  };

  const updateField = (index: number, updates: Partial<any>) => {
    const updatedSchema = [...data.schema];
    updatedSchema[index] = { ...updatedSchema[index], ...updates };
    setData('schema', updatedSchema);
  };

  const removeField = (index: number) => {
    const updatedSchema = data.schema.filter((_, i) => i !== index);
    setData('schema', updatedSchema);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const updatedSchema = [...data.schema];
    const [movedField] = updatedSchema.splice(fromIndex, 1);
    updatedSchema.splice(toIndex, 0, movedField);
    setData('schema', updatedSchema);
  };

  const handleDragStart = (index: number) => {
    setDraggedField(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedField !== null && draggedField !== dropIndex) {
      moveField(draggedField, dropIndex);
    }
    setDraggedField(null);
  };

  const updateFieldOptions = (fieldIndex: number, options: string[]) => {
    updateField(fieldIndex, { options });
  };

  const addOption = (fieldIndex: number) => {
    const field = data.schema[fieldIndex] as any;
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    updateFieldOptions(fieldIndex, newOptions);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = data.schema[fieldIndex] as any;
    const newOptions = field.options?.filter((_: any, i: number) => i !== optionIndex) || [];
    updateFieldOptions(fieldIndex, newOptions);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const field = data.schema[fieldIndex] as any;
    const newOptions = [...(field.options || [])];
    newOptions[optionIndex] = value;
    updateFieldOptions(fieldIndex, newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('tenant.forms.update', form.id));
  };

  const renderFieldIcon = (type: FormField['type']) => {
    const fieldType = fieldTypes.find(ft => ft.type === type);
    if (!fieldType) return <Type className="h-4 w-4" />;
    const Icon = fieldType.icon;
    return <Icon className="h-4 w-4" />;
  };

  console.log('Form schema:', data.schema);
  return (
    <AppLayout>
      <Head title={`Edit Form: ${form.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={route('tenant.forms.show', form.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Form</h1>
            <p className="text-muted-foreground">
              Update your form configuration
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
                <CardDescription>Basic information about your form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Form Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Safety Inspection Checklist"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <Alert className="border-red-500">
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Form Type *</Label>
                  <Select
                    value={data.type}
                    onValueChange={(value) => setData('type', value)}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(formTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <Alert className="border-red-500">
                      <AlertDescription>{errors.type}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>Drag and drop to reorder fields</CardDescription>
              </CardHeader>
              <CardContent>
                {data.schema.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No fields added yet. Add fields from the panel on the right.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.schema.map((field: any, index: number) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="border rounded-lg p-4 bg-background cursor-move hover:bg-muted/50"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              {renderFieldIcon(field.type)}
                              <Badge variant="outline">
                                {fieldTypes.find(ft => ft.type === field.type)?.label}
                              </Badge>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label>Field Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  placeholder="Enter field label"
                                />
                              </div>
                              
                              {!['select', 'radio', 'checkbox'].includes(field.type) && (
                                <div>
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={field.placeholder || ''}
                                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                    placeholder="Enter placeholder text"
                                  />
                                </div>
                              )}
                            </div>

                            {['select', 'radio', 'checkbox'].includes(field.type) && (
                              <div>
                                <Label>Options</Label>
                                <div className="space-y-2">
                                  {field.options?.map((option: any, optionIndex: number) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(index, optionIndex)}
                                        disabled={field.options!.length <= 1}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(index)}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Option
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`required-${index}`}
                                checked={field.required}
                                onCheckedChange={(checked: any) => updateField(index, { required: checked })}
                              />
                              <Label htmlFor={`required-${index}`}>Required field</Label>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center gap-4">
              <Button onClick={handleSubmit} disabled={processing}>
                <Save className="mr-2 h-4 w-4" />
                {processing ? 'Updating...' : 'Update Form'}
              </Button>
              <Link href={route('tenant.forms.show', form.id)}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>

          {/* Field Types Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Types</CardTitle>
                <CardDescription>Click to add fields to your form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {fieldTypes.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <Button
                        key={fieldType.type}
                        variant="outline"
                        className="justify-start h-auto p-3"
                        onClick={() => addField(fieldType.type as FormField['type'])}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{fieldType.label}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Form Preview */}
            {data.schema.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="font-semibold">{data.name || 'Untitled Form'}</h3>
                    <div className="space-y-3">
                      {data.schema.map((field: any) => (
                        <div key={field.id} className="space-y-1">
                          <Label>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea placeholder={field.placeholder} disabled />
                          ) : field.type === 'select' ? (
                            <Select disabled>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </Select>
                          ) : ['radio', 'checkbox'].includes(field.type) ? (
                            <div className="space-y-2">
                              {field.options?.map((option: any, i: number) => (
                                <div key={i} className="flex items-center space-x-2">
                                  <input
                                    type={field.type}
                                    disabled
                                    className="rounded border-gray-300"
                                  />
                                  <Label>{option}</Label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Input
                              type={field.type === 'datetime' ? 'datetime-local' : field.type}
                              placeholder={field.placeholder}
                              disabled
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}