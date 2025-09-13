import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Search,
    User,
    Mail,
    Phone,
    Award,
    X,
    Check,
    Clock,
    Users
} from 'lucide-react';
import { type User as UserType, type JobAssignment } from '@/types';

interface WorkerAssignmentProps {
    jobId: string;
    currentAssignments: JobAssignment[];
    availableWorkers: UserType[];
    onAssignmentChange?: () => void;
}

export default function WorkerAssignment({ 
    jobId, 
    currentAssignments, 
    availableWorkers,
    onAssignmentChange 
}: WorkerAssignmentProps) {
    const [isAssigning, setIsAssigning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('worker');

    // Filter workers that are not already assigned
    const assignedUserIds = currentAssignments.map(a => a.worker?.user?.id).filter(Boolean);
    const unassignedWorkers = availableWorkers.filter(
        worker => !assignedUserIds.includes(worker.id)
    );

    // Filter workers based on search term
    const filteredWorkers = unassignedWorkers.filter(worker =>
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssignWorker = async (workerId: number) => {
        try {
            await router.post(`/admin/jobs/${jobId}/assign-worker`, {
                user_id: workerId,
                role: selectedRole,
            }, {
                preserveState: true,
                onSuccess: () => {
                    setIsAssigning(false);
                    setSearchTerm('');
                    onAssignmentChange?.();
                }
            });
        } catch (error) {
            console.error('Error assigning worker:', error);
        }
    };

    const handleUnassignWorker = async (assignmentId: number) => {
        if (confirm('Are you sure you want to remove this worker from the job?')) {
            try {
                await router.delete(`/admin/jobs/${jobId}/assignments/${assignmentId}`, {
                    preserveState: true,
                    onSuccess: () => {
                        onAssignmentChange?.();
                    }
                });
            } catch (error) {
                console.error('Error unassigning worker:', error);
            }
        }
    };

    const getAssignmentStatusColor = (status: string) => {
        switch (status) {
            case 'assigned':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'started':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
            case 'completed':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'cancelled':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'assigned':
                return <Clock className="h-4 w-4" />;
            case 'started':
                return <User className="h-4 w-4" />;
            case 'completed':
                return <Check className="h-4 w-4" />;
            case 'cancelled':
                return <X className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const roles = [
        { value: 'worker', label: 'Worker' },
        { value: 'supervisor', label: 'Supervisor' },
        { value: 'specialist', label: 'Specialist' },
        { value: 'manager', label: 'Manager' },
    ];

    return (
        <div className="space-y-6">
            {/* Current Assignments */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Assigned Workers ({currentAssignments.length})</span>
                        </CardTitle>
                        <Button 
                            size="sm" 
                            onClick={() => setIsAssigning(true)}
                            disabled={unassignedWorkers.length === 0}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Worker
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentAssignments.length > 0 ? (
                        <div className="space-y-4">
                            {currentAssignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="font-medium">{assignment.worker?.user?.name}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {assignment.role}
                                                </Badge>
                                                <Badge className={getAssignmentStatusColor(assignment.status)}>
                                                    {getStatusIcon(assignment.status)}
                                                    <span className="ml-1">{assignment.status}</span>
                                                </Badge>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                                {assignment.worker?.user?.email && (
                                                    <div className="flex items-center space-x-1">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{assignment.worker.user.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {assignment.worker?.user?.skills && assignment.worker.user.skills.length > 0 && (
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Award className="h-3 w-3 text-muted-foreground" />
                                                    <div className="flex flex-wrap gap-1">
                                                        {assignment.worker.user.skills.slice(0, 3).map((skill) => (
                                                            <Badge key={skill.id} variant="secondary" className="text-xs">
                                                                {skill.name}
                                                            </Badge>
                                                        ))}
                                                        {assignment.worker.user.skills.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{assignment.worker.user.skills.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-xs text-muted-foreground">
                                            Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUnassignWorker(assignment.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No workers assigned</h3>
                            <p className="text-muted-foreground mb-4">
                                Assign workers to this job to get started with the work.
                            </p>
                            <Button onClick={() => setIsAssigning(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign First Worker
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Worker Assignment Modal/Panel */}
            {isAssigning && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Assign New Worker</CardTitle>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setIsAssigning(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Role Selection */}
                        <div>
                            <Label htmlFor="role">Worker Role</Label>
                            <select
                                id="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {roles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <Label htmlFor="search">Search Workers</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Available Workers */}
                        <div>
                            <Label>Available Workers ({filteredWorkers.length})</Label>
                            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                {filteredWorkers.length > 0 ? (
                                    filteredWorkers.map((worker) => (
                                        <div key={worker.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{worker.name}</p>
                                                    <p className="text-sm text-muted-foreground">{worker.email}</p>
                                                    {worker.skills && worker.skills.length > 0 && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <Award className="h-3 w-3 text-muted-foreground" />
                                                            <div className="flex gap-1">
                                                                {worker.skills.slice(0, 2).map((skill) => (
                                                                    <Badge key={skill.id} variant="secondary" className="text-xs">
                                                                        {skill.name}
                                                                    </Badge>
                                                                ))}
                                                                {worker.skills.length > 2 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        +{worker.skills.length - 2}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAssignWorker(worker.id)}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Assign
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            {searchTerm ? 'No workers found matching your search.' : 'No available workers to assign.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}