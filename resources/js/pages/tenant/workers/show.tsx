import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, 
    DollarSign, HardHat, Shield, Briefcase, FileText, Clock
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    roles: Array<{
        id: string;
        name: string;
        description?: string;
    }>;
}

interface Location {
    id: string;
    name: string;
    address: string;
}

interface Skill {
    id: string;
    name: string;
    description?: string;
    pivot: {
        level: string;
    };
}

interface JobAssignment {
    id: string;
    created_at: string;
    job: {
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        scheduled_start?: string;
    };
}

interface Certification {
    id: string;
    name: string;
    description?: string;
    pivot: {
        issued_at: string;
        expires_at?: string;
    };
}

interface FormResponse {
    id: string;
    created_at: string;
    data: any;
    form?: {
        name: string;
        description?: string;
    };
}

interface Worker {
    id: string;
    employee_number?: string;
    first_name: string;
    last_name: string;
    status: 'active' | 'inactive' | 'suspended';
    hire_date: string;
    hourly_rate?: number;
    created_at: string;
    user: User | ['null'];
    location?: Location;
    skills: Skill[];
    job_assignments: JobAssignment[];
    certifications: Certification[];
    form_responses: FormResponse[];
}

interface Props {
    worker: Worker;
    can: {
        update: boolean;
        delete: boolean;
    };
}

const WorkersShow: React.FC<Props> = ({ worker, can }) => {
    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
            suspended: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusText = (status: string) => {
        const texts = {
            active: 'Aktywny',
            inactive: 'Nieaktywny',
            suspended: 'Zawieszony',
        };
        return texts[status as keyof typeof texts] || status;
    };

    const getJobStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getSkillLevelColor = (level: string) => {
        const colors = {
            beginner: 'bg-blue-100 text-blue-800 border-blue-200',
            intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            advanced: 'bg-orange-100 text-orange-800 border-orange-200',
            expert: 'bg-green-100 text-green-800 border-green-200',
        };
        return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getSkillLevelText = (level: string) => {
        const texts = {
            beginner: 'Początkujący',
            intermediate: 'Średniozaawansowany',
            advanced: 'Zaawansowany',
            expert: 'Ekspert',
        };
        return texts[level as keyof typeof texts] || level;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount);
    };

    const getWorkerFullName = () => {
        return `${worker.first_name} ${worker.last_name}`;
    };

    const handleDelete = () => {
        if (confirm('Czy na pewno chcesz usunąć tego pracownika? Tej operacji nie można cofnąć.')) {
            router.delete(route('tenant.workers.destroy', worker.id));
        }
    };

    return (
        <AppLayout>
            <Head title={`Pracownik: ${getWorkerFullName()}`} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
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

                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {getWorkerFullName()}
                                    </h1>
                                    <Badge className={getStatusColor(worker.status)}>
                                        {getStatusText(worker.status)}
                                    </Badge>
                                    {worker.employee_number && (
                                        <span className="text-lg text-gray-500">
                                            #{worker.employee_number}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600">
                                    Pracownik zatrudniony od {formatDate(worker.hire_date)}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {can.update && (
                                    <Link href={route('tenant.workers.edit', worker.id)}>
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edytuj
                                        </Button>
                                    </Link>
                                )}
                                {can.delete && (
                                    <Button variant="destructive" onClick={handleDelete}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Usuń
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="info" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="info">Informacje</TabsTrigger>
                            <TabsTrigger value="skills">Umiejętności</TabsTrigger>
                            <TabsTrigger value="jobs">Zlecenia</TabsTrigger>
                            <TabsTrigger value="history">Historia</TabsTrigger>
                        </TabsList>

                        {/* Basic Information */}
                        <TabsContent value="info" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Dane osobowe
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Imię</span>
                                                <p className="mt-1">{worker.first_name}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Nazwisko</span>
                                                <p className="mt-1">{worker.last_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span>{worker?.user?.email || 'Brak adresu email'}</span>
                                        </div>

                                        {worker?.user?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span>{worker.user.phone || 'Brak numeru telefonu'}</span>
                                            </div>
                                        )}

                                        {worker.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">{worker.location.name}</p>
                                                    <p className="text-sm text-gray-500">{worker.location.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Employment Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            Dane zatrudnienia
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Data zatrudnienia</span>
                                                <p className="mt-1">{formatDate(worker.hire_date)}</p>
                                            </div>
                                        </div>

                                        {worker.hourly_rate && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Stawka godzinowa</span>
                                                    <p className="mt-1">{formatCurrency(worker.hourly_rate)}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500">Status pracownika</span>
                                            <Badge className={getStatusColor(worker.status)}>
                                                {getStatusText(worker.status)}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* System Roles */}
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Role w systemie
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {worker?.user?.roles.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {worker.user.roles.map((role) => (
                                                    <Badge key={role.id} variant="outline">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Brak przypisanych ról systemowych</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Skills & Certifications */}
                        <TabsContent value="skills" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Skills */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <HardHat className="h-5 w-5" />
                                            Umiejętności
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {worker.skills.length > 0 ? (
                                            <div className="space-y-3">
                                                {worker.skills.map((skill) => (
                                                    <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg">
                                                        <div>
                                                            <h4 className="font-medium">{skill.name}</h4>
                                                            {skill.description && (
                                                                <p className="text-sm text-gray-500">{skill.description}</p>
                                                            )}
                                                        </div>
                                                        <Badge className={getSkillLevelColor(skill.pivot.level)}>
                                                            {getSkillLevelText(skill.pivot.level)}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Brak przypisanych umiejętności</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Certifications */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Certyfikaty
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {worker.certifications.length > 0 ? (
                                            <div className="space-y-3">
                                                {worker.certifications.map((certification) => (
                                                    <div key={certification.id} className="p-3 border rounded-lg">
                                                        <h4 className="font-medium">{certification.name}</h4>
                                                        {certification.description && (
                                                            <p className="text-sm text-gray-500 mb-2">{certification.description}</p>
                                                        )}
                                                        <div className="text-xs text-gray-600">
                                                            <p>Wydany: {formatDate(certification.pivot.issued_at)}</p>
                                                            {certification.pivot.expires_at && (
                                                                <p>Wygasa: {formatDate(certification.pivot.expires_at)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Brak certyfikatów</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Job Assignments */}
                        <TabsContent value="jobs" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5" />
                                        Przypisane zlecenia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {worker.job_assignments.length > 0 ? (
                                        <div className="space-y-4">
                                            {worker.job_assignments.map((assignment) => (
                                                <div key={assignment.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">
                                                                <Link 
                                                                    href={route('tenant.jobs.show', assignment.job.id)}
                                                                    className="text-blue-600 hover:text-blue-800"
                                                                >
                                                                    {assignment.job.title}
                                                                </Link>
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {assignment.job.description}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <Badge className={getJobStatusColor(assignment.job.status)}>
                                                                {assignment.job.status === 'pending' && 'Oczekujące'}
                                                                {assignment.job.status === 'in_progress' && 'W toku'}
                                                                {assignment.job.status === 'completed' && 'Ukończone'}
                                                                {assignment.job.status === 'cancelled' && 'Anulowane'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Przypisane: {formatDate(assignment.created_at)}</span>
                                                        </div>
                                                        {assignment.job.scheduled_start && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>Planowane: {formatDateTime(assignment.job.scheduled_start)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Brak przypisanych zleceń</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* History & Forms */}
                        <TabsContent value="history" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Ostatnie formularze
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {worker.form_responses.length > 0 ? (
                                        <div className="space-y-3">
                                            {worker.form_responses.map((response) => (
                                                <div key={response.id} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">
                                                                {response.form?.name || 'Formularz'}
                                                            </h4>
                                                            {response.form?.description && (
                                                                <p className="text-sm text-gray-500">{response.form.description}</p>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDateTime(response.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Brak wypełnionych formularzy</p>
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

export default WorkersShow;