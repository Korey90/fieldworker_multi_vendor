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
    AlertCircle,
    Trash2
} from 'lucide-react';
import { type BreadcrumbItem, type Job, type Location, type User } from '@/types';

interface JobEditProps {
    job: Job;
    locations: Location[];
    users: User[];
}

interface JobFormData {
    title: string;
    description: string;
    location_id: string;
    assigned_user_id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    scheduled_at: string;
    completed_at: string;
    data: Record<string, any>;
}

export default function JobEdit({ job, locations, users }: JobEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Jobs', href: '/admin/jobs' },
        { title: job.title, href: `/admin/jobs/${job.id}` },
        { title: 'Edit', href: `/admin/jobs/${job.id}/edit` },
    ];

    const { data, setData, put, processing, errors, delete: destroy } = useForm<JobFormData>({
        title: job.title || '',
        description: job.description || '',
        location_id: job.location_id?.toString() || '',
        assigned_user_id: job.assigned_user_id?.toString() || '',
        status: job.status || 'pending',
        scheduled_at: job.scheduled_at ? job.scheduled_at.substring(0, 16) : '',
        completed_at: job.completed_at ? job.completed_at.substring(0, 16) : '',
        data: job.data || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/jobs/${job.id}`, {
            onSuccess: () => {
                // Redirect handled by controller
            },
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            destroy(`/admin/jobs/${job.id}`, {
                onSuccess: () => {
                    // Redirect handled by controller
                }
            });
        }
    };

    const statuses = [
        { value: 'pending', label: 'Oczekuje' },
        { value: 'in_progress', label: 'W trakcie' },
        { value: 'completed', label: 'Ukończone' },
        { value: 'cancelled', label: 'Anulowane' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'in_progress':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
            case 'completed':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'cancelled':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Job: ${job.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={`/admin/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Job
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
                            <p className="text-muted-foreground">
                                Update job details and settings
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Job
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
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
                                        placeholder="Enter job title"
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
                                        placeholder="Provide detailed description of the work"
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
                                    <Label htmlFor="status">Status</Label>
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

                    {/* Location & Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Location & Schedule</CardTitle>
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
                                    <Label htmlFor="assigned_user_id">Assigned Worker</Label>
                                    <select
                                        id="assigned_user_id"
                                        value={data.assigned_user_id}
                                        onChange={(e) => setData('assigned_user_id', e.target.value)}
                                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">No assignment...</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assigned_user_id && (
                                        <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.assigned_user_id}</span>
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

                                {data.status === 'completed' && (
                                    <div>
                                        <Label htmlFor="completed_at">Completion Date & Time</Label>
                                        <Input
                                            id="completed_at"
                                            type="datetime-local"
                                            value={data.completed_at}
                                            onChange={(e) => setData('completed_at', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.completed_at && (
                                            <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.completed_at}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Assignment Info */}
                    {job.assignments && job.assignments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Assignments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {job.assignments.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div>
                                                <p className="font-medium">{assignment.worker?.user?.name}</p>
                                                <p className="text-sm text-muted-foreground">{assignment.role}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    assignment.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : assignment.status === 'started'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {assignment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                        <Link href={`/admin/jobs/${job.id}`}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        
                        <Button 
                            type="submit" 
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}