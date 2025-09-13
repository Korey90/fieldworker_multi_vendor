import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft,
    User,
    Mail,
    Phone,
    DollarSign,
    Calendar,
    Plus,
    X,
    Award,
    Save
} from 'lucide-react';

// TypeScript interfaces
interface Skill {
    id: string;
    name: string;
    category?: string;
}

interface WorkerSkill {
    id: string;
    name: string;
    category: string;
    pivot: {
        level: number;
    };
}

interface Worker {
    id: string;
    employee_number: string;
    hire_date: string | null;
    hourly_rate: number | null;
    status: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
    };
    skills: WorkerSkill[];
}

interface WorkerEditProps {
    worker: Worker;
    skills: Skill[];
}

interface WorkerFormData {
    name: string;
    email: string;
    phone: string;
    employee_id: string;
    hire_date: string;
    hourly_rate: string;
    status: string;
    skills: Array<{
        skill_id: string;
        level: number;
    }>;
}

export default function WorkerEdit({ worker, skills }: WorkerEditProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Workers', href: '/admin/workers' },
        { title: worker.user.name, href: `/admin/workers/${worker.id}` },
        { title: 'Edit', href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm<WorkerFormData>({
        name: worker.user.name,
        email: worker.user.email,
        phone: worker.user.phone || '',
        employee_id: worker.employee_number,
        hire_date: worker.hire_date ? worker.hire_date.split('T')[0] : '', // Convert to YYYY-MM-DD format
        hourly_rate: worker.hourly_rate ? worker.hourly_rate.toString() : '',
        status: worker.status,
        skills: worker.skills.map(skill => ({
            skill_id: skill.id,
            level: skill.pivot.level
        })),
    });

    const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; skill_name: string; level: number }>>(
        worker.skills.map(skill => ({
            skill_id: skill.id,
            skill_name: skill.name,
            level: skill.pivot.level
        }))
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update skills data before submitting
        setData('skills', selectedSkills.map(skill => ({
            skill_id: skill.skill_id,
            level: skill.level
        })));

        // Submit after a brief delay to ensure skills are updated
        setTimeout(() => {
            put(`/admin/workers/${worker.id}`);
        }, 50);
    };

    const addSkill = () => {
        const availableSkills = skills.filter(
            skill => !selectedSkills.some(selected => selected.skill_id === skill.id)
        );
        
        if (availableSkills.length > 0) {
            setSelectedSkills([...selectedSkills, {
                skill_id: availableSkills[0].id,
                skill_name: availableSkills[0].name,
                level: 1
            }]);
        }
    };

    const removeSkill = (index: number) => {
        setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
    };

    const updateSkill = (index: number, field: 'skill_id' | 'level', value: string | number) => {
        const updated = [...selectedSkills];
        if (field === 'skill_id') {
            const skill = skills.find(s => s.id === value);
            updated[index] = {
                ...updated[index],
                skill_id: value as string,
                skill_name: skill?.name || ''
            };
        } else {
            updated[index] = {
                ...updated[index],
                level: value as number
            };
        }
        setSelectedSkills(updated);
    };

    const getAvailableSkills = (currentSkillId?: string) => {
        return skills.filter(skill => 
            skill.id === currentSkillId || 
            !selectedSkills.some(selected => selected.skill_id === skill.id)
        );
    };

    const getLevelBadgeColor = (level: number) => {
        switch (level) {
            case 1: return 'bg-gray-100 text-gray-800';
            case 2: return 'bg-blue-100 text-blue-800';
            case 3: return 'bg-green-100 text-green-800';
            case 4: return 'bg-yellow-100 text-yellow-800';
            case 5: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelText = (level: number) => {
        switch (level) {
            case 1: return 'Beginner';
            case 2: return 'Basic';
            case 3: return 'Intermediate';
            case 4: return 'Advanced';
            case 5: return 'Expert';
            default: return 'Unknown';
        }
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Edit ${worker.user.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Worker</h1>
                            <p className="text-sm text-gray-500">Update worker information and skills</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" form="worker-edit-form" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Worker'}
                        </Button>
                    </div>
                </div>

                <form id="worker-edit-form" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="employee_id">Employee ID *</Label>
                                        <Input
                                            id="employee_id"
                                            type="text"
                                            value={data.employee_id}
                                            onChange={(e) => setData('employee_id', e.target.value)}
                                            placeholder="Enter employee ID"
                                            className={errors.employee_id ? 'border-red-500' : ''}
                                        />
                                        {errors.employee_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.employee_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter email address"
                                                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="hire_date">Hire Date *</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="hire_date"
                                                type="date"
                                                value={data.hire_date}
                                                onChange={(e) => setData('hire_date', e.target.value)}
                                                className={`pl-10 ${errors.hire_date ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.hire_date && (
                                            <p className="text-sm text-red-600 mt-1">{errors.hire_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="hourly_rate">Hourly Rate</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="hourly_rate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.hourly_rate}
                                                onChange={(e) => setData('hourly_rate', e.target.value)}
                                                placeholder="0.00"
                                                className={`pl-10 ${errors.hourly_rate ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.hourly_rate && (
                                            <p className="text-sm text-red-600 mt-1">{errors.hourly_rate}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                                <SelectItem value="terminated">Terminated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Skills Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                    <Award className="w-5 h-5 mr-2" />
                                    Skills & Expertise
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addSkill}
                                    disabled={selectedSkills.length >= skills.length}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Skill
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedSkills.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No skills added yet</p>
                                    <p className="text-sm">Click "Add Skill" to get started</p>
                                </div>
                            ) : (
                                selectedSkills.map((selectedSkill, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Skill {index + 1}</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSkill(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        
                                        <div>
                                            <Label className="text-xs text-gray-500">Skill</Label>
                                            <Select 
                                                value={selectedSkill.skill_id} 
                                                onValueChange={(value) => updateSkill(index, 'skill_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select skill" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getAvailableSkills(selectedSkill.skill_id).map((skill) => (
                                                        <SelectItem key={skill.id} value={skill.id}>
                                                            {skill.name}
                                                            {skill.category && (
                                                                <span className="text-muted-foreground"> - {skill.category}</span>
                                                            )}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-xs text-gray-500">Proficiency Level</Label>
                                            <Select 
                                                value={selectedSkill.level.toString()} 
                                                onValueChange={(value) => updateSkill(index, 'level', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5].map((level) => (
                                                        <SelectItem key={level} value={level.toString()}>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge className={getLevelBadgeColor(level)}>
                                                                    Level {level}
                                                                </Badge>
                                                                <span>{getLevelText(level)}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))
                            )}
                            {errors.skills && (
                                <p className="text-sm text-red-600">{errors.skills}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </form>
            </div>
        </AppLayout>
    );
}
