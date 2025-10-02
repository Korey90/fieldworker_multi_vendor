import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Edit, 
    Trash2, 
    ArrowLeft,
    MapPin,
    Calendar,
    Clock,
    Users,
    FileText,
    Briefcase,
    User,
    Award,
    Activity,
    Plus,
    Mail,
    Phone,
    Eye
} from 'lucide-react';
import { type BreadcrumbItem, type Job, type Worker, type Form, type User as UserType } from '@/types';

interface JobShowProps {
    job: Job;
    workers: Worker[];
    forms: Form[];
}

interface Location {
    id: number;
    name: string;
}

export default function JobShow({ job, workers, forms }: JobShowProps) {
    const [activeTab, setActiveTab] = useState('overview');

    console.log('Job:', job, 'Workers:', workers);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Jobs', href: '/admin/jobs' },
        { title: job.title, href: `/admin/jobs/${job.id}` },
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteJob = () => {
        if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            router.delete(`/admin/jobs/${job.id}`, {
                onSuccess: () => {
                    router.visit('/admin/jobs');
                }
            });
        }
    };

    const statusLabels: Record<string, string> = {
        pending: 'Oczekuje',
        in_progress: 'W trakcie',
        completed: 'Ukończone',
        cancelled: 'Anulowane',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Job: ${job.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                            <Link href="/admin/jobs">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Jobs
                                </Button>
                            </Link>
                            <Badge className={getStatusColor(job.status)}>
                                {statusLabels[job.status] || job.status}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">{job.title}</h1>
                        <p className="text-muted-foreground text-lg">{job.description}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/admin/jobs/${job.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Job
                            </Button>
                        </Link>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDeleteJob}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center space-x-3 p-4">
                            <MapPin className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">
                                    {job.location?.name || 'Not specified'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center space-x-3 p-4">
                            <Calendar className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Scheduled</p>
                                <p className="text-sm text-muted-foreground">
                                    {job.scheduled_at ? formatDate(job.scheduled_at) : 'Not scheduled'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center space-x-3 p-4">
                            <Users className="h-8 w-8 text-purple-500" />
                            <div>
                                <p className="text-sm font-medium">Assigned Workers</p>
                                <p className="text-sm text-muted-foreground">
                                    {job.assignments?.length || 0} worker(s)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center space-x-3 p-4">
                            <Clock className="h-8 w-8 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(job.created_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="workers" onClick={() => setActiveTab('workers')}>
                            <Users className="h-4 w-4 mr-2" />
                            Workers ({job.assignments?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="documents" onClick={() => setActiveTab('documents')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Documents ({forms?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="timeline" onClick={() => setActiveTab('timeline')}>
                            <Activity className="h-4 w-4 mr-2" />
                            Timeline
                        </TabsTrigger>
                        <TabsTrigger value="details" onClick={() => setActiveTab('details')}>
                            Details
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Tenant</label>
                                        <p className="text-sm text-muted-foreground font-mono">{job.tenant?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Title</label>
                                        <p className="text-sm text-muted-foreground">{job.title}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <p className="text-sm text-muted-foreground">{job.description}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <div className="mt-1">
                                            <Badge className={getStatusColor(job.status)}>
                                                {statusLabels[job.status] || job.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Location Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {job.location ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium">Location Name</label>
                                                <p className="text-sm text-muted-foreground">{job.location.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Address</label>
                                                <p className="text-sm text-muted-foreground">{job.location.address}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">City</label>
                                                <p className="text-sm text-muted-foreground">
                                                    {job.location.city}, {job.location.postal_code}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No location specified</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Workers Tab */}
                    <TabsContent value="workers" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Assigned Workers</h3>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Worker
                            </Button>
                        </div>

                        {job.assignments && job.assignments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {job.assignments.map((assignment) => (
                                    <Card key={assignment.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">
                                                        {assignment.worker ? `${assignment.worker.first_name} ${assignment.worker.last_name}` : 'Unknown Worker'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {assignment.role}
                                                    </p>
                                                    <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                                                        {assignment.worker?.email && (
                                                            <div className="flex items-center space-x-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span>{assignment.worker.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge 
                                                        variant="outline" 
                                                        className="mt-2"
                                                    >
                                                        {assignment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No workers assigned</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Assign workers to this job to get started.
                                    </p>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign First Worker
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Documents & Forms</h3>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Document
                            </Button>
                        </div>

                        {forms && forms.length > 0 ? (
                            <div className="space-y-4">
                                {forms.map((form) => (
                                    <Card key={form.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">
                                                        {form.name || 'Unnamed Form'}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Type: {form.type}
                                                    </p>
                                                </div>
                                                {form.responses && form.responses.length > 0 ? (
                                                    <Button variant="outline" size="sm">
                                                        {form.responses.length} {form.responses.length === 1 ? "response" : "responses"}
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm">
                                                        No responses
                                                    </Button>
                                                )}
                                            </div>
                                            <div>
                                                {form.responses && form.responses.length > 0 ? (

                                                    form.responses.map((response: any) => (
                                                        <div key={response.id} className="mt-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                Submitted {response.is_submitted && response.submitted_at ?  'at ' + formatDate(response.submitted_at) : 'as draft'} by: {response.worker ? `${response.worker.first_name} ${response.worker.last_name}` : 'Unknown'}

                                                                <Link
                                                                    href={route('admin.form-responses.show', response.id)}
                                                                    className="text-blue-500 hover:underline ml-2"
                                                                >
                                                                    <Eye className="h-4 w-4 inline" />
                                                                </Link>
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : null}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No documents</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Add forms or documents to track job progress.
                                    </p>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Document
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-6">
                        <h3 className="text-lg font-semibold">Job Timeline</h3>
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                        <div>
                                            <p className="text-sm font-medium">Job Created</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(job.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {job.scheduled_at && (
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                                            <div>
                                                <p className="text-sm font-medium">Scheduled</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(job.scheduled_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {job.completed_at && (
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                            <div>
                                                <p className="text-sm font-medium">Completed</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(job.completed_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <h3 className="text-lg font-semibold">Technical Details</h3>
                        <Card>
                            <CardContent className="p-6">
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium">Job ID</dt>
                                        <dd className="text-sm text-muted-foreground font-mono">{job.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Tenant ID</dt>
                                        <dd className="text-sm text-muted-foreground">{job.tenant_id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Created At</dt>
                                        <dd className="text-sm text-muted-foreground">{formatDate(job.created_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium">Updated At</dt>
                                        <dd className="text-sm text-muted-foreground">{formatDate(job.updated_at)}</dd>
                                    </div>
                                    {job.data && Object.keys(job.data).length > 0 && (
                                        <div className="md:col-span-2">
                                            <dt className="text-sm font-medium mb-2">Additional Data</dt>
                                            <dd className="text-sm text-muted-foreground">
                                                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                                                    {JSON.stringify(job.data, null, 2)}
                                                </pre>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}