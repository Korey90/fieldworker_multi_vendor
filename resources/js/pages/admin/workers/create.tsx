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
    DollarSign,
    Plus,
    X,
    Award,
    Save
} from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { PostalCodeInput } from '@/components/postalCodeInput';
import { countryRules, CountryRule } from "@/lib/countryRules"


// TypeScript interfaces
interface Skill {
    id: string;
    name: string;
    category?: string;
}

interface Tenant {
    id: string;
    name: string;
}

interface WorkerCreateProps {
    skills: Skill[];
    tenants: Tenant[];
}

interface WorkerAddress {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country?: string;
    region?: string; //optional
}

interface WorkerFormData {
    employee_number: string;
    first_name: string;
    last_name: string;
    dob: string | null;
    insurance_number: string | null;
    phone: string;
    email: string;
    hire_date: string;
    hourly_rate: string;
    status: string;
    skills: Array<{
        skill_id: string;
        level: number;
    }>;
    address: WorkerAddress;
    data: Record<string, any>;
    tenant_id: string;
}

export default function WorkerCreate({ skills, tenants }: WorkerCreateProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Workers', href: '/admin/workers' },
        { title: 'Create', href: '' },
    ];

    const { data, setData, post, processing, errors } = useForm<WorkerFormData>({
        employee_number: '',
        tenant_id: '',
        first_name: '',
        last_name: '',
        dob: null,
        insurance_number: '',
        phone: '',
        email: '',
        hire_date: '',
        hourly_rate: '',
        status: 'active',
        data: {},
        skills: [],
        address: {
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            postal_code: '',
            country: '',
            region: '',
        },
    });

    const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; skill_name: string; level: number }>>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update skills data before submitting
        setData('skills', selectedSkills.map(skill => ({
            skill_id: skill.skill_id,
            level: skill.level
        })));

        // Submit after a brief delay to ensure skills are updated
        setTimeout(() => {
            post('/admin/workers');
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
            <Head title="Create Worker" />
            
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
                            <h1 className="text-2xl font-bold text-gray-900">Create Worker</h1>
                            <p className="text-sm text-gray-500">Add a new worker with their information and skills</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" form="worker-create-form" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Worker'}
                        </Button>
                    </div>
                </div>

                <form id="worker-create-form" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Tenant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Tenant Selection */}
                                <div>
                                    <Label htmlFor="tenant_id">Tenant *</Label>
                                    <Select value={data.tenant_id} onValueChange={(value) => setData('tenant_id', value)}>
                                        <SelectTrigger className={errors.tenant_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select tenant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tenants.map((tenant) => (
                                                <SelectItem key={tenant.id} value={tenant.id}>
                                                    {tenant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.tenant_id && (
                                        <p className="text-sm text-red-600 mt-1">{errors.tenant_id}</p>
                                    )}
                                </div>
                            </CardContent>

                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Full name */}
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <div className="flex">
                                            <Input
                                                id="first_name"
                                                type="text"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                placeholder="First name"
                                                className={`flex-1 rounded-r-none ${errors.first_name ? 'border-red-500' : ''}`}
                                            />                                            
                                            <Input
                                                id="last_name"
                                                type="text"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                placeholder="Last name"
                                                className={`flex-1 rounded-l-none border-l-0 ${errors.last_name ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            {errors.first_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
                                            )}
                                            {errors.last_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                      <Label htmlFor="dob">Date of Birth</Label>
                                      <DatePicker
                                        value={data.dob ?? undefined}
                                        onChange={(val) => setData("dob", val)}
                                      />
                                      {errors.dob && (
                                        <p className="text-sm text-red-600 mt-1">{errors.dob}</p>
                                      )}
                                    </div>

                                    {/* Insurance Number */}
                                    <div>
                                        <Label htmlFor="insurance_number">Insurance Number</Label>
                                        <Input
                                            id="insurance_number"
                                            type="text"
                                            value={data.insurance_number || ''}
                                            onChange={(e) => setData('insurance_number', e.target.value)}
                                            placeholder="Enter insurance number"
                                            className={errors.insurance_number ? 'border-red-500' : ''}
                                        />
                                        {errors.insurance_number && (
                                            <p className="text-sm text-red-600 mt-1">{errors.insurance_number}</p>
                                        )}
                                    </div>

                                    {/* Employee Number */}
                                    <div>
                                        <Label htmlFor="employee_number">Employee Number *</Label>
                                        <Input
                                            id="employee_number"
                                            type="text"
                                            value={data.employee_number}
                                            onChange={(e) => setData('employee_number', e.target.value)}
                                            placeholder="Enter employee number"
                                            className={errors.employee_number ? 'border-red-500' : ''}
                                        />
                                        {errors.employee_number && (
                                            <p className="text-sm text-red-600 mt-1">{errors.employee_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Email Address */}
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

                                    {/* Phone Number */}
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
                                {/* hire date + hourly rate + status */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Hire Date */}
                                    <div>
                                      <Label htmlFor="hire_date">Hire Date</Label>
                                      <DatePicker
                                        value={data.hire_date}
                                        onChange={(val) => setData("hire_date", val)}
                                      />
                                      {errors.hire_date && (
                                        <p className="text-sm text-red-600 mt-1">{errors.hire_date}</p>
                                      )}
                                    </div>

                                    {/* Hourly Rate */}
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

                                    {/* Status */}
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

                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Address Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Address Line 1 */}
                                    <div>
                                        <Label htmlFor="address_line_1">Address Line 1</Label>
                                        <Input
                                            id="address_line_1"
                                            type="text"
                                            value={data.address.address_line_1 || ''}
                                            onChange={(e) => setData('address', { ...data.address, address_line_1: e.target.value })}
                                            placeholder="Enter address line 1"
                                            className={errors['address.address_line_1'] ? 'border-red-500' : ''}
                                        />
                                        {errors['address.address_line_1'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['address.address_line_1']}</p>
                                        )}
                                    </div>
                                    {/* Address Line 2 */}
                                    <div>
                                        <Label htmlFor="address_line_2">Address Line 2</Label>
                                        <Input
                                            id="address_line_2"
                                            type="text"
                                            value={data.address.address_line_2 || ''}
                                            onChange={(e) => setData('address', { ...data.address, address_line_2: e.target.value })}
                                            placeholder="Enter address line 2"
                                            className={errors['address.address_line_2'] ? 'border-red-500' : ''}
                                        />
                                        {errors['address.address_line_2'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['address.address_line_2']}</p>
                                        )}
                                    </div>
                                    {/* City */}
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={data.address.city || ''}
                                            onChange={(e) => setData('address', { ...data.address, city: e.target.value })}
                                            placeholder="Enter city"
                                            className={errors['address.city'] ? 'border-red-500' : ''}
                                        />
                                        {errors['address.city'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['address.city']}</p>
                                        )}
                                    </div>
                                    {/* State/Province */}
                                    <div>
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            value={data.address.state || ''}
                                            onChange={(e) => setData('address', { ...data.address, state: e.target.value })}
                                            placeholder="Enter state or province"
                                            className={errors['address.state'] ? 'border-red-500' : ''}
                                        />
                                        {errors['address.state'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['address.state']}</p>
                                        )}
                                    </div>
                                    {/* Postal Code */}
                                    <div>
                                      <PostalCodeInput
                                        value={data.address.postal_code || ''}
                                        onChange={(val) => setData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, postal_code: val }
                                        }))}
                                        country={data.address.country || ''}
                                        onCountryChange={(val) => setData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, country: val }
                                        }))}
                                      />
                                    </div>

                                    {/* Country */}
                                    <div>
                                      <Label htmlFor="country">Country</Label>
                                      <Select
                                        value={data.address.country || ''}
                                        onValueChange={(val) => setData('address', { ...data.address, country: val })}
                                      >
                                        <SelectTrigger className={errors['address.country'] ? "border-red-500" : ""}>
                                          <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {countryRules.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                              {c.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Region */}
                                    <div>
                                        <Label htmlFor="region">Region</Label>
                                        <Input
                                            id="region"
                                            type="text"
                                            value={data.address.region || ''}
                                            onChange={(e) => setData('address', { ...data.address, region: e.target.value })}
                                            placeholder="Enter region"
                                            className={errors['address.region'] ? 'border-red-500' : ''}
                                        />
                                        {errors['address.region'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['address.region']}</p>
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
