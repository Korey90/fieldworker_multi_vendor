import React, { useState } from 'react';
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
    MapPin,
    DollarSign,
    Calendar,
    Plus,
    X,
    Award
} from 'lucide-react';

// TypeScript interfaces
interface Skill {
    id: string;
    name: string;
    category?: string;
}

interface WorkerCreateProps {
    skills: Skill[];
}

interface WorkerFormData {
    name: string;
    email: string;
    phone: string;
    employee_id: string;
    hire_date: string;
    hourly_rate: string;
    skills: Array<{
        skill_id: string;
        level: number;
    }>;
}

export default function WorkerCreate({ skills }: WorkerCreateProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Workers', href: '/admin/workers' },
        { title: 'Add New Worker', href: '' },
    ];

    const { data, setData, post, processing, errors } = useForm<WorkerFormData>({
        name: '',
        email: '',
        phone: '',
        employee_id: '',
        hire_date: '',
        hourly_rate: '',
        skills: [],
    });

    const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; skill_name: string; level: number }>>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update skills data before submitting
        setData('skills', selectedSkills.map(skill => ({
            skill_id: skill.skill_id,
            level: skill.level
        })));

        post('/admin/workers', {
            onSuccess: () => {
                // Redirect will be handled by Inertia
            },
        });
    };

    const addSkill = (skillId: string) => {
        const skill = skills.find(s => s.id === skillId);
        if (skill && !selectedSkills.find(s => s.skill_id === skillId)) {
            setSelectedSkills([...selectedSkills, {
                skill_id: skillId,
                skill_name: skill.name,
                level: 1
            }]);
        }
    };

    const removeSkill = (skillId: string) => {
        setSelectedSkills(selectedSkills.filter(s => s.skill_id !== skillId));
    };

    const updateSkillLevel = (skillId: string, level: number) => {
        setSelectedSkills(selectedSkills.map(skill => 
            skill.skill_id === skillId ? { ...skill, level } : skill
        ));
    };

    const getSkillLevelText = (level: number) => {
        switch (level) {
            case 1: return 'Beginner';
            case 2: return 'Intermediate';
            case 3: return 'Advanced';
            case 4: return 'Expert';
            case 5: return 'Master';
            default: return 'Unknown';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Worker" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Workers
                        </Button>
                        <h1 className="text-3xl font-bold">Add New Worker</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Personal Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
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
                            </CardContent>
                        </Card>

                        {/* Employment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5" />
                                    <span>Employment Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="hire_date">Hire Date *</Label>
                                    <Input
                                        id="hire_date"
                                        type="date"
                                        value={data.hire_date}
                                        onChange={(e) => setData('hire_date', e.target.value)}
                                        className={errors.hire_date ? 'border-red-500' : ''}
                                    />
                                    {errors.hire_date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.hire_date}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                                    <Input
                                        id="hourly_rate"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.hourly_rate}
                                        onChange={(e) => setData('hourly_rate', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.hourly_rate ? 'border-red-500' : ''}
                                    />
                                    {errors.hourly_rate && (
                                        <p className="text-sm text-red-600 mt-1">{errors.hourly_rate}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Skills Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Award className="h-5 w-5" />
                                <span>Skills & Competencies</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Add Skill */}
                            <div>
                                <Label>Add Skills</Label>
                                <Select onValueChange={addSkill}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a skill to add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {skills
                                            .filter(skill => !selectedSkills.find(s => s.skill_id === skill.id))
                                            .map((skill) => (
                                                <SelectItem key={skill.id} value={skill.id}>
                                                    {skill.name}
                                                    {skill.category && (
                                                        <span className="text-muted-foreground"> ({skill.category})</span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Skills */}
                            <div>
                                <Label>Selected Skills ({selectedSkills.length})</Label>
                                <div className="space-y-2 mt-2">
                                    {selectedSkills.map((skill) => (
                                        <div key={skill.skill_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                            <span className="font-medium">{skill.skill_name}</span>
                                            <div className="flex items-center space-x-2">
                                                <Select 
                                                    value={skill.level.toString()} 
                                                    onValueChange={(value) => updateSkillLevel(skill.skill_id, parseInt(value))}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5].map((level) => (
                                                            <SelectItem key={level} value={level.toString()}>
                                                                {getSkillLevelText(level)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeSkill(skill.skill_id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedSkills.length === 0 && (
                                        <p className="text-muted-foreground text-sm">No skills selected yet. Use the dropdown above to add skills.</p>
                                    )}
                                </div>
                            </div>

                            {errors.skills && (
                                <p className="text-sm text-red-600">{errors.skills}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-end space-x-4">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-32"
                                >
                                    {processing ? 'Creating...' : 'Create Worker'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
