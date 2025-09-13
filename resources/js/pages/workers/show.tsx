import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    DollarSign,
    Award,
    Briefcase,
    FileText,
    BarChart3,
    Edit,
    Trash2,
    UserX,
    ArrowLeft
} from 'lucide-react';

// TypeScript interfaces
interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

interface Location {
    id: string;
    name: string;
    address?: string;
}

interface Skill {
    id: string;
    name: string;
    level: number; // 1-5 scale
}

interface Certification {
    id: string;
    name: string;
    expiry_date?: string;
    status: 'valid' | 'expiring' | 'expired';
}

interface JobAssignment {
    job: {
        id: string;
        title: string;
        status: string;
        start_date?: string;
        end_date?: string;
        location?: {
            id: string;
            name: string;
        };
    };
    status: string;
    assigned_at: string;
}

interface Worker {
    id: string;
    employee_id: string;
    status: 'active' | 'inactive' | 'on_leave';
    hire_date?: string;
    hourly_rate?: number;
    user: User;
    location?: Location;
    skills: Skill[];
    certifications: Certification[];
    job_history: JobAssignment[];
}

interface WorkerShowProps {
    worker: Worker;
}

export default function WorkerShow({ worker }: WorkerShowProps) {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Workers', href: '/admin/workers' },
        { title: worker.user.name, href: '' },
    ];

    const getStatusColor = (status: Worker['status']) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'on_leave':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: Worker['status']) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'inactive':
                return 'Inactive';
            case 'on_leave':
                return 'On Leave';
            default:
                return 'Unknown';
        }
    };

    const getSkillLevelText = (level: number) => {
        switch (level) {
            case 1:
                return 'Beginner';
            case 2:
                return 'Intermediate';
            case 3:
                return 'Advanced';
            case 4:
                return 'Expert';
            case 5:
                return 'Master';
            default:
                return 'Unknown';
        }
    };

    const getCertificationColor = (status: string) => {
        switch (status) {
            case 'valid':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'expiring':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'expired':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return 'Not specified';
        return `$${amount.toFixed(2)}/hour`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Worker: ${worker.user.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Workers
                        </Button>
                        <h1 className="text-3xl font-bold">Worker Profile</h1>
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/workers/${worker.id}/edit`}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm">
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                        </Button>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Worker Profile Header */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-6">
                            {/* Avatar */}
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {worker.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            
                            {/* Basic Info */}
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                    <h2 className="text-2xl font-bold">{worker.user.name}</h2>
                                    <Badge variant={getStatusColor(worker.status)}>
                                        {getStatusText(worker.status)}
                                    </Badge>
                                </div>
                                
                                <p className="text-muted-foreground mb-4">
                                    Employee ID: #{worker.employee_id}
                                </p>
                                
                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{worker.user.email}</span>
                                    </div>
                                    
                                    {worker.user.phone && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span>{worker.user.phone}</span>
                                        </div>
                                    )}
                                    
                                    {worker.location && (
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{worker.location.name}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{formatCurrency(worker.hourly_rate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">
                            <User className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="skills">
                            <Award className="h-4 w-4 mr-2" />
                            Skills & Certs
                        </TabsTrigger>
                        <TabsTrigger value="jobs">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Job History
                        </TabsTrigger>
                        <TabsTrigger value="performance">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Employment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Hire Date:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(worker.hire_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Hourly Rate:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {formatCurrency(worker.hourly_rate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Status:</span>
                                        <Badge variant={getStatusColor(worker.status)}>
                                            {getStatusText(worker.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Location:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {worker.location?.name || 'Not assigned'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Total Skills:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {worker.skills.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Certifications:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {worker.certifications.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Completed Jobs:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {worker.job_history.filter(j => j.job.status === 'completed').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Active Jobs:</span>
                                        <span className="text-sm text-muted-foreground">
                                            {worker.job_history.filter(j => j.job.status === 'in_progress').length}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Skills & Certifications Tab */}
                    <TabsContent value="skills" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Skills */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills ({worker.skills.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {worker.skills.map((skill) => (
                                            <div key={skill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <span className="font-medium">{skill.name}</span>
                                                <Badge variant="outline">
                                                    {getSkillLevelText(skill.level)}
                                                </Badge>
                                            </div>
                                        ))}
                                        {worker.skills.length === 0 && (
                                            <p className="text-muted-foreground text-sm">No skills assigned yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Certifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Certifications ({worker.certifications.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {worker.certifications.map((cert) => (
                                            <div key={cert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{cert.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Expires: {formatDate(cert.expiry_date)}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs ${getCertificationColor(cert.status)}`}>
                                                    {cert.status}
                                                </div>
                                            </div>
                                        ))}
                                        {worker.certifications.length === 0 && (
                                            <p className="text-muted-foreground text-sm">No certifications assigned yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Job History Tab */}
                    <TabsContent value="jobs" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Job History ({worker.job_history.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {worker.job_history.map((assignment, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{assignment.job.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    📍 {assignment.job.location?.name || 'Unknown location'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(assignment.job.start_date)} - {formatDate(assignment.job.end_date)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="mb-2">
                                                    {assignment.job.status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">
                                                    Assigned: {formatDate(assignment.assigned_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {worker.job_history.length === 0 && (
                                        <p className="text-muted-foreground text-sm">No job history available.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Performance Analytics Coming Soon</h3>
                                    <p className="text-muted-foreground">
                                        Performance metrics and analytics will be available in the next update.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Documents & Signatures</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">Document Management Coming Soon</h3>
                                    <p className="text-muted-foreground">
                                        Document uploads and signature management will be available in the next update.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
