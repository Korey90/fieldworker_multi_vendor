import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, HardHat, Shield } from 'lucide-react';

interface Location {
    id: string;
    name: string;
    address: string;
}

interface Skill {
    id: string;
    name: string;
    description: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
}

interface Props {
    locations: Location[];
    skills: Skill[];
    roles: Role[];
}

interface FormData {
    email: string;
    name: string;
    phone: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    employee_number: string;
    location_id: string;
    hire_date: string;
    hourly_rate: string;
    status: string;
    role_ids: string[];
    skill_ids: string[];
    skill_levels: string[];
}

const WorkersCreate: React.FC<Props> = ({ locations, skills, roles }) => {
    const [selectedSkills, setSelectedSkills] = useState<Array<{id: string, level: string}>>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        email: '',
        name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        first_name: '',
        last_name: '',
        employee_number: '',
        location_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        hourly_rate: '',
        status: 'active',
        role_ids: [],
        skill_ids: [],
        skill_levels: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare skill data
        const skillIds = selectedSkills.map(skill => skill.id);
        const skillLevels = selectedSkills.map(skill => skill.level);
        
        // Update form data with additional fields
        setData(prev => ({
            ...prev,
            role_ids: selectedRoles,
            skill_ids: skillIds,
            skill_levels: skillLevels,
        }));
        
        post(route('tenant.workers.store'));
    };

    const handleSkillToggle = (skillId: string, checked: boolean) => {
        if (checked) {
            setSelectedSkills(prev => [...prev, { id: skillId, level: 'beginner' }]);
        } else {
            setSelectedSkills(prev => prev.filter(skill => skill.id !== skillId));
        }
    };

    const handleSkillLevelChange = (skillId: string, level: string) => {
        setSelectedSkills(prev => 
            prev.map(skill => 
                skill.id === skillId ? { ...skill, level } : skill
            )
        );
    };

    const handleRoleToggle = (roleId: string, checked: boolean) => {
        if (checked) {
            setSelectedRoles(prev => [...prev, roleId]);
        } else {
            setSelectedRoles(prev => prev.filter(id => id !== roleId));
        }
    };

    return (
        <AppLayout>
            <Head title="Dodaj nowego pracownika" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('tenant.workers.index'))}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Powrót
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Dodaj nowego pracownika</h1>
                        <p className="mt-2 text-gray-600">
                            Wypełnij formularz aby dodać nowego pracownika do organizacji
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Dane użytkownika
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Adres email *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="pl-10"
                                                placeholder="email@example.com"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div>
                                        <Label htmlFor="name">Nazwa użytkownika *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nazwa użytkownika w systemie"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Telefon</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="pl-10"
                                                placeholder="+48 123 456 789"
                                            />
                                        </div>
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Aktywny</SelectItem>
                                                <SelectItem value="inactive">Nieaktywny</SelectItem>
                                                <SelectItem value="suspended">Zawieszony</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Hasło *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimum 8 znaków"
                                            required
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">Potwierdź hasło *</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Powtórz hasło"
                                            required
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Worker Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HardHat className="h-5 w-5" />
                                    Dane pracownika
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">Imię *</Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            placeholder="Imię pracownika"
                                            required
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="last_name">Nazwisko *</Label>
                                        <Input
                                            id="last_name"
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            placeholder="Nazwisko pracownika"
                                            required
                                        />
                                        <InputError message={errors.last_name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="employee_number">Numer pracownika</Label>
                                        <Input
                                            id="employee_number"
                                            type="text"
                                            value={data.employee_number}
                                            onChange={(e) => setData('employee_number', e.target.value)}
                                            placeholder="np. EMP001"
                                        />
                                        <InputError message={errors.employee_number} />
                                    </div>

                                    <div>
                                        <Label htmlFor="location_id">Lokalizacja</Label>
                                        <Select value={data.location_id} onValueChange={(value) => setData('location_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Wybierz lokalizację" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locations.map((location) => (
                                                    <SelectItem key={location.id} value={location.id}>
                                                        {location.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.location_id} />
                                    </div>

                                    <div>
                                        <Label htmlFor="hire_date">Data zatrudnienia</Label>
                                        <Input
                                            id="hire_date"
                                            type="date"
                                            value={data.hire_date}
                                            onChange={(e) => setData('hire_date', e.target.value)}
                                        />
                                        <InputError message={errors.hire_date} />
                                    </div>

                                    <div>
                                        <Label htmlFor="hourly_rate">Stawka godzinowa (PLN)</Label>
                                        <Input
                                            id="hourly_rate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.hourly_rate}
                                            onChange={(e) => setData('hourly_rate', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.hourly_rate} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Roles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Role w systemie
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={selectedRoles.includes(role.id)}
                                                onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={`role-${role.id}`} className="font-medium">
                                                    {role.name}
                                                </Label>
                                                {role.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.role_ids} />
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HardHat className="h-5 w-5" />
                                    Umiejętności
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {skills.map((skill) => {
                                        const selectedSkill = selectedSkills.find(s => s.id === skill.id);
                                        const isSelected = !!selectedSkill;
                                        
                                        return (
                                            <div key={skill.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-start space-x-3 flex-1">
                                                        <Checkbox
                                                            id={`skill-${skill.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleSkillToggle(skill.id, checked as boolean)}
                                                        />
                                                        <div className="flex-1">
                                                            <Label htmlFor={`skill-${skill.id}`} className="font-medium">
                                                                {skill.name}
                                                            </Label>
                                                            {skill.description && (
                                                                <p className="text-sm text-gray-500 mt-1">{skill.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {isSelected && (
                                                        <div className="ml-4 min-w-[140px]">
                                                            <Label className="text-sm">Poziom</Label>
                                                            <Select 
                                                                value={selectedSkill.level} 
                                                                onValueChange={(value) => handleSkillLevelChange(skill.id, value)}
                                                            >
                                                                <SelectTrigger className="h-8 text-sm">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="beginner">Początkujący</SelectItem>
                                                                    <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                                                                    <SelectItem value="advanced">Zaawansowany</SelectItem>
                                                                    <SelectItem value="expert">Ekspert</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.skill_ids} />
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('tenant.workers.index'))}
                                disabled={processing}
                            >
                                Anuluj
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Zapisywanie...' : 'Zapisz pracownika'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default WorkersCreate;