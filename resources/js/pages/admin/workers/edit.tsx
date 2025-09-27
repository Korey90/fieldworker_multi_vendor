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
    Plus,
    X,
    Award,
    Save,
    CalendarIcon
} from 'lucide-react';
import {Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from '@/components/date-picker';
import { PostalCodeInput } from '@/components/postalCodeInput';
import { countryRules } from '@/components/postalCodeInput';

// TypeScript interfaces
interface Skill {
    id: string;
    name: string;
    category?: string;
}

interface Certification {
    id: string;
    name: string;
    authority: string;
    validity_period_months: number;
}

interface WorkerCertification {
    id: string;
    name: string;
    authority: string;
    validity_period_months: number;
    pivot: {
        issued_at: string | null;
        expires_at: string | null;
    };
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
    tenant_id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    dob: string | null;
    insurance_number: string | null;
    phone: string | null;
    email: string;
    hire_date: string | null;
    hourly_rate: number | null;
    status: string;
    data: Record<string, any>;
    created_at: string;
    updated_at: string;
    skills: WorkerSkill[];
    tenant: { id: string; name: string; };
    address: WorkerAddress;
    certifications: WorkerCertification[];
}

interface WorkerAddress {
    address_line_1: string | null;
    address_line_2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    region: string; //optional
}

interface WorkerEditProps {
    worker: Worker;
    skills: Skill[];
    certifications: Certification[];
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
    tenant_id?: string;
    certifications: Array<{
        certification_id: string;
        issued_at: string | null;
        expires_at: string | null;
    }>;
}

export default function WorkerEdit({ worker, skills, certifications }: WorkerEditProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Workers', href: '/admin/workers' },
        { title: worker.first_name, href: `/admin/workers/${worker.id}` },
        { title: 'Edit', href: '' },
    ];

    const { data, setData, put, processing, errors } = useForm<WorkerFormData>({
        employee_number: worker.employee_number,
        tenant_id: worker.tenant_id || '',
        first_name: worker.first_name,
        last_name: worker.last_name,
        dob: worker.dob ? worker.dob.split('T')[0] : null, // Convert to YYYY-MM-DD format
        insurance_number: worker.insurance_number || '',
        phone: worker.phone || '',
        email: worker.email,
        hire_date: worker.hire_date ? worker.hire_date.split('T')[0] : '', // Convert to YYYY-MM-DD format
        hourly_rate: worker.hourly_rate ? worker.hourly_rate.toString() : '',
        status: worker.status,
        data: worker.data || {},
        skills: worker.skills.map(skill => ({
            skill_id: skill.id,
            level: skill.pivot.level
        })),
        address: {...worker.address},
        certifications: worker.certifications.map(cert => ({
            certification_id: cert.id,
            issued_at: cert.pivot.issued_at ? cert.pivot.issued_at.split('T')[0] : null,
            expires_at: cert.pivot.expires_at ? cert.pivot.expires_at.split('T')[0] : null,
        })),
    });


    const [selectedSkills, setSelectedSkills] = useState<Array<{ skill_id: string; skill_name: string; level: number }>>(
        worker.skills.map(skill => ({
            skill_id: skill.id,
            skill_name: skill.name,
            level: skill.pivot.level
        }))
    );

    const [selectedCertifications, setSelectedCertifications] = useState<Array<{ 
        certification_id: string; 
        certification_name: string; 
        authority: string;
        validity_period_months: number;
        issued_at: string | null; 
        expires_at: string | null; 
    }>>(
        worker.certifications.map(cert => ({
            certification_id: cert.id,
            certification_name: cert.name,
            authority: cert.authority,
            validity_period_months: cert.validity_period_months,
            issued_at: cert.pivot.issued_at ? cert.pivot.issued_at.split('T')[0] : null,
            expires_at: cert.pivot.expires_at ? cert.pivot.expires_at.split('T')[0] : null,
        }))
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update skills data before submitting
        setData('skills', selectedSkills.map(skill => ({
            skill_id: skill.skill_id,
            level: skill.level
        })));

        // Update certifications data before submitting
        setData('certifications', selectedCertifications.map(cert => ({
            certification_id: cert.certification_id,
            issued_at: cert.issued_at,
            expires_at: cert.expires_at
        })));

        // Submit after a brief delay to ensure data is updated
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

    // Certification management functions
    const addCertification = () => {
        const availableCertifications = certifications.filter(
            cert => !selectedCertifications.some(selected => selected.certification_id === cert.id)
        );
        
        if (availableCertifications.length > 0) {
            const cert = availableCertifications[0];
            setSelectedCertifications([...selectedCertifications, {
                certification_id: cert.id,
                certification_name: cert.name,
                authority: cert.authority,
                validity_period_months: cert.validity_period_months,
                issued_at: null,
                expires_at: null
            }]);
        }
    };

    const removeCertification = (index: number) => {
        setSelectedCertifications(selectedCertifications.filter((_, i) => i !== index));
    };

    const updateCertification = (index: number, field: 'certification_id' | 'issued_at' | 'expires_at', value: string) => {
        const updated = [...selectedCertifications];
        if (field === 'certification_id') {
            const cert = certifications.find(c => c.id === value);
            if (cert) {
                updated[index] = {
                    ...updated[index],
                    certification_id: value,
                    certification_name: cert.name,
                    authority: cert.authority,
                    validity_period_months: cert.validity_period_months,
                };
            }
        } else {
            updated[index] = {
                ...updated[index],
                [field]: value || null
            };
        }
        setSelectedCertifications(updated);
    };

    const getAvailableCertifications = (currentCertificationId?: string) => {
        return certifications.filter(cert => 
            cert.id === currentCertificationId || 
            !selectedCertifications.some(selected => selected.certification_id === cert.id)
        );
    };

    const getCertificationStatus = (expiresAt: string | null) => {
        if (!expiresAt) return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
        
        const expiry = new Date(expiresAt);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        if (expiry < now) return { status: 'expired', color: 'bg-red-100 text-red-800' };
        if (expiry <= thirtyDaysFromNow) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'valid', color: 'bg-green-100 text-green-800' };
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Edit ${worker.first_name}`} />
            
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                                {/* Tenant ID */}
                                <div>
                                    <Label htmlFor="tenant_id">Tenant ID</Label>
                                    <Input
                                        id="tenant_id"
                                        type="text"
                                        value={data.tenant_id || ''}
                                        onChange={(e) => setData('tenant_id', e.target.value)}
                                        placeholder="Enter tenant ID"
                                        className={errors.tenant_id ? 'border-red-500' : ''}
                                        readOnly
                                    />
                                    {errors.tenant_id && (
                                        <p className="text-sm text-red-600 mt-1">{errors.tenant_id}</p>
                                    )}
                                    <p className='text-sm text-gray-600 p-1'>{worker.tenant.name}</p>
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

                                {/* Created At & Updated At */}
                                <div className="flex space-x-6 text-sm text-gray-500">
                                  <p>
                                    <b>Created At:</b>{" "}
                                    {new Date(worker.created_at).toLocaleDateString("pl-PL")}
                                  </p>
                                  <p>
                                    <b>Updated At:</b>{" "}
                                    {new Date(worker.updated_at).toLocaleDateString("pl-PL")}
                                  </p>
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
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, address_line_1: e.target.value }
                                            }))}
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
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, address_line_2: e.target.value }
                                            }))}
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
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, city: e.target.value }
                                            }))}
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
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, state: e.target.value }
                                            }))}
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
                                        onValueChange={(val: string) => setData(prev => ({
                                            ...prev,
                                            address: { ...prev.address, country: val }
                                        }))}
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
                                            onChange={(e) => setData(prev => ({
                                                ...prev,
                                                address: { ...prev.address, region: e.target.value }
                                            }))}
                                            placeholder="Enter region"
                                            className={errors['address.region'] ? 'border-red-500' : ''}
                                        />
                                        {errors['address.region'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['address.region']}</p>
                                        )}
                                    </div>

                                </div>

                            </CardContent>  

                            {/* JSON Data Section */}
                            <CardHeader>    
                                <CardTitle className="flex items-center">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Json Data
                                </CardTitle>
                                <CardContent>
                                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                                      {JSON.stringify(typeof data.data === "string" ? JSON.parse(data.data) : data.data, null, 2)}
                                    </pre>
                                </CardContent>

                            </CardHeader>
                        </Card>
                    </div>

                    {/* Skills Section */}
                    <div className="lg:col-span-2">
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


                        <CardHeader>    
                            <CardTitle className="flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Certificates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600">
                                    Manage worker certifications, licenses and safety training
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCertification}
                                    disabled={selectedCertifications.length >= certifications.length}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Certificate
                                </Button>
                            </div>

                            {selectedCertifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                    <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="font-medium">No certificates added</p>
                                    <p className="text-sm">Click "Add Certificate" to start managing certifications</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedCertifications.map((selectedCert, index) => {
                                        const statusInfo = getCertificationStatus(selectedCert.expires_at);
                                        return (
                                            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="text-sm font-medium">Certificate {index + 1}</Label>
                                                        <Badge className={statusInfo.color}>
                                                            {statusInfo.status}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeCertification(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Certification Type</Label>
                                                        <Select 
                                                            value={selectedCert.certification_id} 
                                                            onValueChange={(value) => updateCertification(index, 'certification_id', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select certification" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {getAvailableCertifications(selectedCert.certification_id).map((cert) => (
                                                                    <SelectItem key={cert.id} value={cert.id}>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{cert.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{cert.authority}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="text-sm">
                                                        <Label className="text-xs text-gray-500">Authority</Label>
                                                        <p className="text-sm font-medium mt-1">{selectedCert.authority}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Valid for {selectedCert.validity_period_months} months
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Issue Date</Label>
                                                        <DatePicker
                                                            value={selectedCert.issued_at || undefined}
                                                            onChange={(val) => updateCertification(index, 'issued_at', val || '')}
                                                            placeholder="Select issue date"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-xs text-gray-500">Expiry Date</Label>
                                                        <DatePicker
                                                            value={selectedCert.expires_at || undefined}
                                                            onChange={(val) => updateCertification(index, 'expires_at', val || '')}
                                                            placeholder="Select expiry date"
                                                        />
                                                        {selectedCert.issued_at && selectedCert.validity_period_months && (
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                Auto-expires: {new Date(new Date(selectedCert.issued_at).setMonth(
                                                                    new Date(selectedCert.issued_at).getMonth() + selectedCert.validity_period_months
                                                                )).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {selectedCert.expires_at && (
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Status:</span>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge className={statusInfo.color}>
                                                                    {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
                                                                </Badge>
                                                                {statusInfo.status === 'expiring' && (
                                                                    <span className="text-xs text-yellow-600">
                                                                        Expires in {Math.ceil((new Date(selectedCert.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.certifications && (
                                <p className="text-sm text-red-600">{errors.certifications}</p>
                            )}
                        </CardContent>                    
                    </Card>
                    </div>
                </div>
            </form>
            </div>
        </AppLayout>
    );
}
