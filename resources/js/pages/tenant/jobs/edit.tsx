import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import InputError from '@/components/input-error';

interface Location {
    id: string;
    name: string;
    address: string;
}

interface Sector {
    id: string;
    name: string;
    description: string;
}

interface Job {
    id: string;
    title: string;
    description: string;
    location_id: string;
    sector_id: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduled_start?: string;
    estimated_hours?: number;
    required_skills?: string[];
    safety_requirements?: string;
}

interface Props {
    job: Job;
    locations: Location[];
    sectors: Sector[];
}

interface FormData {
    title: string;
    description: string;
    location_id: string;
    sector_id: string;
    priority: 'low' | 'medium' | 'high' | 'urgent' | '';
    scheduled_start: string;
    estimated_hours: string;
    required_skills: string[];
    safety_requirements: string;
}

const EditJob: React.FC<Props> = ({ job, locations, sectors }) => {
    const { data, setData, patch, processing, errors } = useForm<FormData>({
        title: job.title || '',
        description: job.description || '',
        location_id: job.location_id || '',
        sector_id: job.sector_id || '',
        priority: job.priority || '',
        scheduled_start: job.scheduled_start ? job.scheduled_start.slice(0, 16) : '',
        estimated_hours: job.estimated_hours?.toString() || '',
        required_skills: job.required_skills || [],
        safety_requirements: job.safety_requirements || '',
    });

    const [newSkill, setNewSkill] = React.useState('');

    const addSkill = () => {
        if (newSkill.trim() && !data.required_skills.includes(newSkill.trim())) {
            setData('required_skills', [...data.required_skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setData('required_skills', data.required_skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('tenant.jobs.update', job.id));
    };

    const priorityOptions = [
        { value: 'low', label: 'Niski', color: 'text-gray-600' },
        { value: 'medium', label: 'Średni', color: 'text-blue-600' },
        { value: 'high', label: 'Wysoki', color: 'text-orange-600' },
        { value: 'urgent', label: 'Pilny', color: 'text-red-600' },
    ];

    return (
        <AppLayout>
            <Head title={`Edytuj pracę: ${job.title}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={route('tenant.jobs.show', job.id)}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Powrót
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Edytuj pracę</h1>
                        </div>
                        <p className="text-gray-600">
                            Modyfikuj szczegóły zlecenia pracy
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Podstawowe informacje</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Tytuł pracy *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="np. Remont instalacji elektrycznej"
                                            className="mt-1"
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Opis pracy *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Szczegółowy opis zadań do wykonania..."
                                            rows={4}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="priority">Priorytet *</Label>
                                            <Select value={data.priority} onValueChange={(value) => setData('priority', value as any)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Wybierz priorytet" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorityOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <span className={option.color}>{option.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.priority} />
                                        </div>

                                        <div>
                                            <Label htmlFor="estimated_hours">Szacowany czas (godziny) *</Label>
                                            <Input
                                                id="estimated_hours"
                                                type="number"
                                                step="0.5"
                                                min="0.5"
                                                max="24"
                                                value={data.estimated_hours}
                                                onChange={(e) => setData('estimated_hours', e.target.value)}
                                                placeholder="8.0"
                                                className="mt-1"
                                            />
                                            <InputError message={errors.estimated_hours} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location and Sector */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lokalizacja i sektor</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="location_id">Lokalizacja *</Label>
                                            <Select value={data.location_id} onValueChange={(value) => setData('location_id', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Wybierz lokalizację" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((location) => (
                                                        <SelectItem key={location.id} value={location.id}>
                                                            <div>
                                                                <div className="font-medium">{location.name}</div>
                                                                <div className="text-sm text-gray-500">{location.address}</div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.location_id} />
                                        </div>

                                        <div>
                                            <Label htmlFor="sector_id">Sektor *</Label>
                                            <Select value={data.sector_id} onValueChange={(value) => setData('sector_id', value)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Wybierz sektor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectors.map((sector) => (
                                                        <SelectItem key={sector.id} value={sector.id}>
                                                            <div>
                                                                <div className="font-medium">{sector.name}</div>
                                                                {sector.description && (
                                                                    <div className="text-sm text-gray-500">{sector.description}</div>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.sector_id} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Scheduling */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Planowanie</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="scheduled_start">Planowana data rozpoczęcia *</Label>
                                        <Input
                                            id="scheduled_start"
                                            type="datetime-local"
                                            value={data.scheduled_start}
                                            onChange={(e) => setData('scheduled_start', e.target.value)}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.scheduled_start} />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Data musi być w przyszłości
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Skills and Requirements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Umiejętności i wymagania</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Wymagane umiejętności</Label>
                                        <div className="mt-2">
                                            <div className="flex gap-2 mb-3">
                                                <Input
                                                    value={newSkill}
                                                    onChange={(e) => setNewSkill(e.target.value)}
                                                    placeholder="np. Spawanie, Obsługa dźwigu..."
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                />
                                                <Button type="button" onClick={addSkill} variant="outline" size="sm">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            
                                            {data.required_skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {data.required_skills.map((skill, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            <span>{skill}</span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeSkill(skill)}
                                                                className="h-4 w-4 p-0 hover:bg-blue-200"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <InputError message={errors.required_skills} />
                                    </div>

                                    <div>
                                        <Label htmlFor="safety_requirements">Wymagania bezpieczeństwa</Label>
                                        <Textarea
                                            id="safety_requirements"
                                            value={data.safety_requirements}
                                            onChange={(e) => setData('safety_requirements', e.target.value)}
                                            placeholder="Szczegółowe wymagania dotyczące bezpieczeństwa pracy..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.safety_requirements} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex justify-end gap-4">
                                <Link href={route('tenant.jobs.show', job.id)}>
                                    <Button variant="outline" type="button">
                                        Anuluj
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default EditJob;