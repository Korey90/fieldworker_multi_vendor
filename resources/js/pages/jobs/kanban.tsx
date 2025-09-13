import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowLeft,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    MapPin,
    Calendar,
    Users,
    Clock,
    Briefcase
} from 'lucide-react';
import { type BreadcrumbItem, type Job } from '@/types';

interface JobKanbanProps {
    jobsByStatus: Record<string, Job[]>;
    statuses: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Jobs', href: '/admin/jobs' },
    { title: 'Kanban Board', href: '/admin/jobs/kanban' },
];

export default function JobKanban({ jobsByStatus, statuses }: JobKanbanProps) {
    const [draggedJob, setDraggedJob] = useState<Job | null>(null);

    const handleDragStart = (e: React.DragEvent, job: Job) => {
        setDraggedJob(job);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        
        if (draggedJob && draggedJob.status !== newStatus) {
            try {
                await router.put(`/admin/jobs/${draggedJob.id}`, {
                    status: newStatus,
                }, {
                    preserveState: true,
                    only: ['jobsByStatus']
                });
            } catch (error) {
                console.error('Error updating job status:', error);
            }
        }
        
        setDraggedJob(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
            case 'in_progress':
                return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
            case 'completed':
                return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
            case 'cancelled':
                return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
            default:
                return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20';
        }
    };

    const getJobCardColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'border-yellow-200 hover:border-yellow-300';
            case 'in_progress':
                return 'border-blue-200 hover:border-blue-300';
            case 'completed':
                return 'border-green-200 hover:border-green-300';
            case 'cancelled':
                return 'border-red-200 hover:border-red-300';
            default:
                return 'border-gray-200 hover:border-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusOrder = ['pending', 'in_progress', 'completed', 'cancelled'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jobs Kanban Board" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/jobs">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Jobs List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Jobs Kanban Board</h1>
                            <p className="text-muted-foreground">
                                Drag and drop jobs between columns to update their status
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/admin/jobs">
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Table View
                            </Button>
                        </Link>
                        <Link href="/admin/jobs/calendar">
                            <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar
                            </Button>
                        </Link>
                        <Link href="/admin/jobs/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Job
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-hidden">
                    <div className="flex space-x-6 h-full overflow-x-auto pb-6">
                        {statusOrder.map((status) => {
                            const jobs = jobsByStatus[status] || [];
                            return (
                                <div
                                    key={status}
                                    className={`flex-shrink-0 w-80 flex flex-col ${getStatusColor(status)} rounded-lg border-2 border-dashed transition-colors ${
                                        draggedJob && draggedJob.status !== status ? 'border-opacity-50' : ''
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, status)}
                                >
                                    {/* Column Header */}
                                    <div className="p-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">
                                                {statuses[status] || status}
                                            </h3>
                                            <Badge variant="secondary" className="text-sm">
                                                {jobs.length}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Jobs List */}
                                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                                        {jobs.length > 0 ? (
                                            jobs.map((job) => (
                                                <Card
                                                    key={job.id}
                                                    className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${getJobCardColor(job.status)} ${
                                                        draggedJob?.id === job.id ? 'opacity-50' : ''
                                                    }`}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, job)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="space-y-3">
                                                            {/* Job Title */}
                                                            <h4 className="font-medium line-clamp-2 text-sm">
                                                                {job.title}
                                                            </h4>

                                                            {/* Job Description */}
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {job.description}
                                                            </p>

                                                            {/* Job Details */}
                                                            <div className="space-y-2">
                                                                {/* Location */}
                                                                {job.location && (
                                                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                                        <MapPin className="h-3 w-3" />
                                                                        <span className="truncate">{job.location.name}</span>
                                                                    </div>
                                                                )}

                                                                {/* Scheduled Date */}
                                                                {job.scheduled_at && (
                                                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>{formatDate(job.scheduled_at)}</span>
                                                                    </div>
                                                                )}

                                                                {/* Assigned Workers */}
                                                                {job.assignments && job.assignments.length > 0 && (
                                                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                                        <Users className="h-3 w-3" />
                                                                        <span>{job.assignments.length} worker(s)</span>
                                                                    </div>
                                                                )}

                                                                {/* Creation Date */}
                                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>Created {formatDate(job.created_at)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex justify-between items-center pt-2 border-t">
                                                                <div className="text-xs text-muted-foreground font-mono">
                                                                    #{job.id.substring(0, 8)}
                                                                </div>
                                                                <div className="flex space-x-1">
                                                                    <Link href={`/admin/jobs/${job.id}`}>
                                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                            <Eye className="h-3 w-3" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Link href={`/admin/jobs/${job.id}/edit`}>
                                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    No jobs in this status
                                                </p>
                                                {status === 'pending' && (
                                                    <Link href="/admin/jobs/create" className="mt-2">
                                                        <Button size="sm" variant="outline">
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add Job
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center text-sm text-muted-foreground">
                    💡 Tip: Drag jobs between columns to change their status. Click on a job card to view details.
                </div>
            </div>
        </AppLayout>
    );
}