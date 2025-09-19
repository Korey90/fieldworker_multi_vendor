import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ArrowLeft, 
    Edit, 
    Calendar, 
    MapPin, 
    User, 
    Clock, 
    AlertTriangle,
    CheckCircle,
    Play,
    Pause,
    X,
    FileText,
    Paperclip
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduled_start?: string;
    created_at: string;
    estimated_hours?: number;
    safety_requirements?: string;
    location?: {
        id: string;
        name: string;
        address: string;
    };
    sector?: {
        id: string;
        name: string;
        description: string;
    };
    assignments?: Array<{
        id: string;
        role: string;
        status: string;
        assigned_at: string;
        worker: {
            id: string;
            employee_number: string;
            user: {
                name: string;
                email: string;
            };
        };
    }>;
    form_responses?: Array<{
        id: string;
        form: {
            name: string;
            type: string;
        };
        is_submitted: boolean;
        submitted_at?: string;
    }>;
    attachments?: Array<{
        id: string;
        filename: string;
        size: number;
        uploaded_at: string;
    }>;
}

interface Props {
    job: Job;
    can: {
        update: boolean;
        delete: boolean;
        assignWorkers: boolean;
        updateStatus: boolean;
    };
}

const ShowJob: React.FC<Props> = ({ job, can }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 border-gray-200',
            medium: 'bg-blue-100 text-blue-800 border-blue-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            urgent: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleStatusChange = (newStatus: string) => {
        router.patch(route('tenant.jobs.update-status', job.id), {
            status: newStatus,
        });
    };

    const handleDelete = () => {
        router.delete(route('tenant.jobs.destroy', job.id));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'in_progress':
                return <Play className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <X className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout>
            <Head title={`Praca: ${job.title}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <Link href={route('tenant.jobs.index')}>
                                    <Button variant="outline" size="sm">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Powrót
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge className={getStatusColor(job.status)}>
                                            {getStatusIcon(job.status)}
                                            <span className="ml-1">
                                                {job.status === 'pending' && 'Oczekująca'}
                                                {job.status === 'in_progress' && 'W toku'}
                                                {job.status === 'completed' && 'Ukończona'}
                                                {job.status === 'cancelled' && 'Anulowana'}
                                            </span>
                                        </Badge>
                                        <Badge className={getPriorityColor(job.priority)}>
                                            {job.priority === 'low' && 'Niski priorytet'}
                                            {job.priority === 'medium' && 'Średni priorytet'}
                                            {job.priority === 'high' && 'Wysoki priorytet'}
                                            {job.priority === 'urgent' && 'Pilny priorytet'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {can.updateStatus && job.status !== 'completed' && job.status !== 'cancelled' && (
                                    <>
                                        {job.status === 'pending' && (
                                            <Button 
                                                onClick={() => handleStatusChange('in_progress')}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                Rozpocznij
                                            </Button>
                                        )}
                                        {job.status === 'in_progress' && (
                                            <>
                                                <Button 
                                                    onClick={() => handleStatusChange('completed')}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Zakończ
                                                </Button>
                                                <Button 
                                                    onClick={() => handleStatusChange('pending')}
                                                    variant="outline"
                                                >
                                                    <Pause className="h-4 w-4 mr-2" />
                                                    Wstrzymaj
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}

                                {can.update && (
                                    <Link href={route('tenant.jobs.edit', job.id)}>
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edytuj
                                        </Button>
                                    </Link>
                                )}

                                {can.delete && (
                                    <Button 
                                        variant="destructive"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Usuń
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <div className="flex items-center justify-between">
                                    <span>Czy na pewno chcesz usunąć tę pracę? Ta akcja jest nieodwracalna.</span>
                                    <div className="flex gap-2 ml-4">
                                        <Button size="sm" variant="destructive" onClick={handleDelete}>
                                            Usuń
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                            Anuluj
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="details" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="details">Szczegóły</TabsTrigger>
                            <TabsTrigger value="workers">Pracownicy</TabsTrigger>
                            <TabsTrigger value="forms">Formularze</TabsTrigger>
                            <TabsTrigger value="attachments">Załączniki</TabsTrigger>
                        </TabsList>

                        {/* Details Tab */}
                        <TabsContent value="details" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Opis pracy</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                                        </CardContent>
                                    </Card>

                                    {job.safety_requirements && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                                    Wymagania bezpieczeństwa
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-700 whitespace-pre-wrap">{job.safety_requirements}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Sidebar Info */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Informacje podstawowe</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {job.location && (
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">{job.location.name}</div>
                                                        <div className="text-sm text-gray-500">{job.location.address}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {job.sector && (
                                                <div className="flex items-start gap-3">
                                                    <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center mt-0.5">
                                                        <div className="h-2 w-2 bg-blue-600 rounded"></div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{job.sector.name}</div>
                                                        {job.sector.description && (
                                                            <div className="text-sm text-gray-500">{job.sector.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {job.scheduled_start && (
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Planowany start</div>
                                                        <div className="text-sm text-gray-500">{formatDate(job.scheduled_start)}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {job.estimated_hours && (
                                                <div className="flex items-start gap-3">
                                                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium">Szacowany czas</div>
                                                        <div className="text-sm text-gray-500">{job.estimated_hours} godzin</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <div className="font-medium">Utworzona</div>
                                                    <div className="text-sm text-gray-500">{formatDate(job.created_at)}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Workers Tab */}
                        <TabsContent value="workers">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Przypisani pracownicy</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {job.assignments && job.assignments.length > 0 ? (
                                        <div className="space-y-4">
                                            {job.assignments.map((assignment) => (
                                                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{assignment.worker?.user.name || 'Nieznany pracownik'}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {assignment.worker?.employee_number || 'Nieznany numer'} • {assignment.role}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className={getStatusColor(assignment.status)}>
                                                            {assignment.status}
                                                        </Badge>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            Przypisano: {formatDate(assignment.assigned_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Brak przypisanych pracowników</p>
                                            {can.assignWorkers && (
                                                <Button className="mt-4">
                                                    Przypisz pracowników
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Forms Tab */}
                        <TabsContent value="forms">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Formularze</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {job.form_responses && job.form_responses.length > 0 ? (
                                        <div className="space-y-4">
                                            {job.form_responses.map((response) => (
                                                <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                                            <FileText className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{response.form.name}</div>
                                                            <div className="text-sm text-gray-500">{response.form.type}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className={response.is_submitted ? 
                                                            'bg-green-100 text-green-800 border-green-200' : 
                                                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        }>
                                                            {response.is_submitted ? 'Wysłano' : 'Oczekuje'}
                                                        </Badge>
                                                        {response.submitted_at && (
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                {formatDate(response.submitted_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Brak wypełnionych formularzy</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Attachments Tab */}
                        <TabsContent value="attachments">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Załączniki</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {job.attachments && job.attachments.length > 0 ? (
                                        <div className="space-y-4">
                                            {job.attachments.map((attachment) => (
                                                <div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <Paperclip className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{attachment.filename}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {formatFileSize(attachment.size)} • {formatDate(attachment.uploaded_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Pobierz
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Brak załączników</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
};

export default ShowJob;