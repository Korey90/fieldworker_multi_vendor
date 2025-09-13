import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowLeft, 
    Save,
    MapPin,
    Calendar,
    Users,
    Briefcase,
    AlertCircle,
    X,
    Search
} from 'lucide-react';
import { type BreadcrumbItem, type Location, type User } from '@/types';

interface JobCreateProps {
    locations: Location[];
    users: User[];
}

interface JobFormData {
    title: string;
    description: string;
    location_id: string;
    assigned_user_ids: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    scheduled_at: string;
    data: Record<string, any>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Jobs', href: '/admin/jobs' },
    { title: 'Create Job', href: '/admin/jobs/create' },
];

export default function JobCreate({ locations, users }: JobCreateProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const totalSteps = 3;

    const { data, setData, post, processing, errors, reset } = useForm<JobFormData>({
        title: '',
        description: '',
        location_id: '',
        assigned_user_ids: [],
        status: 'pending',
        scheduled_at: '',
        data: {},
    });

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleWorkerSelection = (user: User) => {
        const userId = user.id.toString();
        if (!data.assigned_user_ids.includes(userId)) {
            setData('assigned_user_ids', [...data.assigned_user_ids, userId]);
        }
        setSearchQuery('');
        setShowDropdown(false);
    };

    const removeWorker = (userId: string) => {
        setData('assigned_user_ids', data.assigned_user_ids.filter(id => id !== userId));
    };

    const filteredUsers = users.filter(user => 
        !data.assigned_user_ids.includes(user.id.toString()) &&
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isStepValid = (step: number) => {
        switch (step) {
            case 1:
                return data.title.trim() !== '' && data.description.trim() !== '';
            case 2:
                return data.location_id !== '';
            case 3:
                return true; // Optional step
            default:
                return false;
        }
    };

    const statuses = [
        { value: 'pending', label: 'Oczekuje' },
        { value: 'in_progress', label: 'W trakcie' },
        { value: 'completed', label: 'Ukończone' },
        { value: 'cancelled', label: 'Anulowane' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Job" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/jobs">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Jobs
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
                            <p className="text-muted-foreground">
                                Set up a new field work assignment
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium">
                                Step {currentStep} of {totalSteps}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {Math.round((currentStep / totalSteps) * 100)}% Complete
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-4 text-xs">
                            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                                Basic Info
                            </span>
                            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                                Location & Schedule
                            </span>
                            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                                Assignment & Review
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Form */}
                <div className="space-y-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Briefcase className="h-5 w-5" />
                                    <span>Basic Job Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <Label htmlFor="title">Job Title *</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter job title (e.g., Install Security System)"
                                            className="mt-1"
                                            required
                                        />
                                        {errors.title && (
                                            <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.title}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Job Description *</Label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Provide detailed description of the work to be performed..."
                                            rows={4}
                                            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        />
                                        {errors.description && (
                                            <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.description}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Initial Status</Label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as any)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {statuses.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.status && (
                                            <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.status}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Location & Schedule */}
                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Location & Schedule</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="location_id">Work Location *</Label>
                                        <select
                                            id="location_id"
                                            value={data.location_id}
                                            onChange={(e) => setData('location_id', e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            required
                                        >
                                            <option value="">Select location...</option>
                                            {locations.map((location) => (
                                                <option key={location.id} value={location.id}>
                                                    {location.name} - {location.address}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.location_id && (
                                            <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.location_id}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
                                        <Input
                                            id="scheduled_at"
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={(e) => setData('scheduled_at', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.scheduled_at && (
                                            <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.scheduled_at}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location Preview */}
                                {data.location_id && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <h4 className="font-medium mb-2">Selected Location:</h4>
                                        {(() => {
                                            const selectedLocation = locations.find(l => l.id.toString() === data.location_id);
                                            return selectedLocation ? (
                                                <div className="text-sm text-muted-foreground">
                                                    <p className="font-medium">{selectedLocation.name}</p>
                                                    <p>{selectedLocation.address}</p>
                                                    <p>{selectedLocation.city}, {selectedLocation.postal_code}</p>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Assignment & Review */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="h-5 w-5" />
                                        <span>Worker Assignment (Optional)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label>Assign Workers</Label>
                                        
                                        {/* Selected Workers Display */}
                                        {data.assigned_user_ids.length > 0 && (
                                            <div className="mt-2 mb-4">
                                                <p className="text-sm font-medium mb-2">Selected Workers ({data.assigned_user_ids.length}):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.assigned_user_ids.map((userId) => {
                                                        const user = users.find(u => u.id.toString() === userId);
                                                        return user ? (
                                                            <div key={userId} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm border border-blue-200">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{user.name}</p>
                                                                        <p className="text-xs text-blue-600">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeWorker(userId)}
                                                                    className="ml-1 hover:bg-blue-200 rounded-full p-1 transition-colors"
                                                                    title="Remove worker"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Autocomplete Search */}
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search workers by name or email..."
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setShowDropdown(e.target.value.length > 0);
                                                    }}
                                                    onFocus={() => setShowDropdown(searchQuery.length > 0)}
                                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                                    className="pl-10"
                                                />
                                            </div>

                                            {/* Dropdown Results */}
                                            {showDropdown && searchQuery.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
                                                    {filteredUsers.length > 0 ? (
                                                        filteredUsers.slice(0, 10).map((user) => (
                                                            <button
                                                                key={user.id}
                                                                type="button"
                                                                onClick={() => handleWorkerSelection(user)}
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-sm">{user.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-sm text-muted-foreground">
                                                            No workers found matching "{searchQuery}"
                                                        </div>
                                                    )}
                                                    {filteredUsers.length > 10 && (
                                                        <div className="px-4 py-2 text-xs text-muted-foreground bg-gray-50 border-t">
                                                            Showing first 10 results. Type more to narrow down.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {errors.assigned_user_ids && (
                                            <div className="mt-2 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.assigned_user_ids}</span>
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Search and select multiple workers. You can also assign workers later.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">Title</Label>
                                            <p className="text-sm text-muted-foreground">{data.title || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Status</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {statuses.find(s => s.value === data.status)?.label || data.status}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Location</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {data.location_id 
                                                    ? locations.find(l => l.id.toString() === data.location_id)?.name || 'Unknown'
                                                    : 'Not specified'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Scheduled</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {data.scheduled_at 
                                                    ? new Date(data.scheduled_at).toLocaleString('pl-PL')
                                                    : 'Not scheduled'
                                                }
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-sm font-medium">Description</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {data.description || 'Not specified'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-sm font-medium">Assigned Workers</Label>
                                            {data.assigned_user_ids.length > 0 ? (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {data.assigned_user_ids.map((userId) => {
                                                        const user = users.find(u => u.id.toString() === userId);
                                                        return user ? (
                                                            <div key={userId} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                                                <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span>{user.name}</span>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No workers assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            Previous
                        </Button>
                        
                        <div className="flex space-x-2">
                            {currentStep < totalSteps ? (
                                <Button 
                                    type="button" 
                                    onClick={nextStep}
                                    disabled={!isStepValid(currentStep)}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button 
                                    type="button" 
                                    onClick={() => {
                                        post('/admin/jobs', {
                                            onSuccess: () => {
                                                reset();
                                            },
                                        });
                                    }}
                                    disabled={processing || !isStepValid(1) || !isStepValid(2)}
                                >
                                    {processing ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Create Job
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}