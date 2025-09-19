import React from 'react';
import { Head } from '@inertiajs/react';

interface UserData {
    user: {
        id: string;
        tenant_id: string;
        email: string;
        name: string;
        phone: string;
        is_active: boolean;
        data: {
            hire_date: string;
            department: string;
            employee_id: string;
            emergency_contact: string;
        };
        created_at: string;
        updated_at: string;
        worker?: {
            id: string;
            employee_number: string;
            status: string;
            first_name: string;
            last_name: string;
            data: {
                start_date: string;
                hourly_rate: number;
                uniform_size: string;
                specialization: string;
                preferred_shift: string;
                vehicle_assigned: boolean;
            };
            job_assignments: any[];
            tenant: any;
            skills: any[];
            certifications: any[];
        };
        roles: any[];
        form_responses: any[];
        tenant: {
            id: string;
            name: string;
            slug: string;
            sector: string;
            data: any;
        };
        permissions: any[];
        notifications: any[];
        audit_logs: any[];
    };
    computed_permissions: any[];
}

const UserProfile: React.FC<{ userData: UserData }> = ({ userData }) => {
    const { user, computed_permissions } = userData;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            assigned: 'bg-purple-100 text-purple-800'
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    return (
        <>
            <Head title={`Profil użytkownika - ${user.name}`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold mb-8">Profil użytkownika</h1>

                            {/* Basic User Info */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Podstawowe informacje</h2>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Imię i nazwisko</label>
                                            <p className="text-lg font-semibold">{user.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-lg">{user.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Telefon</label>
                                            <p className="text-lg">{user.phone}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Status</label>
                                            <p>{getStatusBadge(user.is_active ? 'active' : 'inactive')}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">ID użytkownika</label>
                                            <p className="text-sm text-gray-500 font-mono">{user.id}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Utworzono</label>
                                            <p className="text-sm">{formatDate(user.created_at)}</p>
                                        </div>
                                    </div>
                                    
                                    {user.data && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h3 className="text-lg font-medium mb-3">Dodatkowe dane</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Data zatrudnienia</label>
                                                    <p>{user.data.hire_date}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Dział</label>
                                                    <p>{user.data.department}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">ID pracownika</label>
                                                    <p>{user.data.employee_id}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600">Kontakt alarmowy</label>
                                                    <p>{user.data.emergency_contact}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tenant Info */}
                            {user.tenant && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Organizacja</h2>
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Nazwa</label>
                                                <p className="text-lg font-semibold">{user.tenant.name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Sektor</label>
                                                <p>{user.tenant.sector}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Slug</label>
                                                <p className="text-sm text-gray-500 font-mono">{user.tenant.slug}</p>
                                            </div>
                                        </div>
                                        {user.tenant.data && (
                                            <div className="mt-4 pt-4 border-t border-blue-200">
                                                <h3 className="text-lg font-medium mb-3">Szczegóły organizacji</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {Object.entries(user.tenant.data).map(([key, value]) => (
                                                        <div key={key}>
                                                            <label className="block text-sm font-medium text-gray-600 capitalize">{key.replace('_', ' ')}</label>
                                                            <p className="text-sm">{value as string}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Worker Info */}
                            {user.worker && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Dane pracownika</h2>
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Imię i nazwisko</label>
                                                <p className="text-lg font-semibold">{user.worker.first_name} {user.worker.last_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Numer pracownika</label>
                                                <p>{user.worker.employee_number}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600">Status</label>
                                                <p>{getStatusBadge(user.worker.status)}</p>
                                            </div>
                                        </div>

                                        {user.worker.data && (
                                            <div className="mb-6 pt-6 border-t border-green-200">
                                                <h3 className="text-lg font-medium mb-3">Szczegóły pracownika</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600">Data rozpoczęcia</label>
                                                        <p>{user.worker.data.start_date}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600">Stawka godzinowa</label>
                                                        <p>${user.worker.data.hourly_rate}/h</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600">Rozmiar munduru</label>
                                                        <p>{user.worker.data.uniform_size}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600">Specjalizacja</label>
                                                        <p>{user.worker.data.specialization}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600">Preferowana zmiana</label>
                                                        <p>{user.worker.data.preferred_shift}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600">Przypisany pojazd</label>
                                                        <p>{user.worker.data.vehicle_assigned ? 'Tak' : 'Nie'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {user.worker.skills && user.worker.skills.length > 0 && (
                                            <div className="mb-6 pt-6 border-t border-green-200">
                                                <h3 className="text-lg font-medium mb-3">Umiejętności</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {user.worker.skills.map((skill: any) => (
                                                        <div key={skill.id} className="bg-white p-4 rounded-lg border border-green-200">
                                                            <h4 className="font-semibold">{skill.name}</h4>
                                                            <p className="text-sm text-gray-600">{skill.category}</p>
                                                            <p className="text-sm text-gray-500">{skill.description}</p>
                                                            <div className="mt-2">
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                    Poziom: {skill.pivot.level}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Certifications */}
                                        {user.worker.certifications && user.worker.certifications.length > 0 && (
                                            <div className="pt-6 border-t border-green-200">
                                                <h3 className="text-lg font-medium mb-3">Certyfikaty</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {user.worker.certifications.map((cert: any) => (
                                                        <div key={cert.id} className="bg-white p-4 rounded-lg border border-green-200">
                                                            <h4 className="font-semibold">{cert.name}</h4>
                                                            <p className="text-sm text-gray-600">{cert.authority}</p>
                                                            <div className="mt-2 space-y-1">
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">Wydano:</span> {cert.pivot.issued_at}
                                                                </div>
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">Wygasa:</span> {cert.pivot.expires_at}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Job Assignments */}
                            {user.worker?.job_assignments && user.worker.job_assignments.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Przypisania do prac</h2>
                                    <div className="bg-purple-50 p-6 rounded-lg">
                                        <div className="space-y-4">
                                            {user.worker.job_assignments.map((assignment: any) => (
                                                <div key={assignment.id} className="bg-white p-4 rounded-lg border border-purple-200">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{assignment.job.title}</h3>
                                                            <p className="text-gray-600">{assignment.job.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {getStatusBadge(assignment.status)}
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                Rola: {assignment.role}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Przypisano:</span> {formatDate(assignment.assigned_at)}
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Zaplanowano:</span> {formatDate(assignment.job.scheduled_at)}
                                                        </div>
                                                        {assignment.job.completed_at && (
                                                            <div>
                                                                <span className="text-gray-600">Ukończono:</span> {formatDate(assignment.job.completed_at)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {assignment.job.data && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Priorytet:</span> 
                                                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                                        assignment.job.data.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                                        assignment.job.data.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                        assignment.job.data.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {assignment.job.data.priority}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Szacowany czas:</span> {assignment.job.data.estimated_duration}
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Kontakt klienta:</span> {assignment.job.data.customer_contact}
                                                                </div>
                                                            </div>
                                                            
                                                            {assignment.job.data.tools_required && (
                                                                <div className="mt-3">
                                                                    <span className="text-gray-600 block mb-1">Wymagane narzędzia:</span>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {assignment.job.data.tools_required.map((tool: string, index: number) => (
                                                                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                                                {tool}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Roles */}
                            {user.roles && user.roles.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Role i uprawnienia</h2>
                                    <div className="bg-indigo-50 p-6 rounded-lg">
                                        <div className="space-y-6">
                                            {user.roles.map((role: any) => (
                                                <div key={role.id} className="bg-white p-4 rounded-lg border border-indigo-200">
                                                    <h3 className="font-semibold text-lg mb-2">{role.name}</h3>
                                                    <p className="text-gray-600 mb-4">{role.description}</p>
                                                    
                                                    {role.permissions && role.permissions.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium mb-2">Uprawnienia:</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {role.permissions.map((permission: any) => (
                                                                    <span key={permission.id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                                                                        {permission.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Responses */}
                            {user.form_responses && user.form_responses.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Odpowiedzi w formularzach</h2>
                                    <div className="bg-yellow-50 p-6 rounded-lg">
                                        <div className="space-y-4">
                                            {user.form_responses.map((response: any) => (
                                                <div key={response.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold">{response.form.name}</h3>
                                                            <p className="text-gray-600">Formularz: {response.form.type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            {getStatusBadge(response.is_submitted ? 'completed' : 'pending')}
                                                            {response.submitted_at && (
                                                                <div className="text-sm text-gray-500 mt-1">
                                                                    Wysłano: {formatDate(response.submitted_at)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {response.job && (
                                                        <div className="mb-3 text-sm">
                                                            <span className="text-gray-600">Praca:</span> {response.job.title}
                                                        </div>
                                                    )}

                                                    {response.response_data && (
                                                        <div className="bg-gray-50 p-3 rounded">
                                                            <h4 className="font-medium mb-2">Dane odpowiedzi:</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                {Object.entries(response.response_data).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                                                        <span className="ml-2">{value as string}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications */}
                            {user.notifications && user.notifications.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Powiadomienia</h2>
                                    <div className="bg-orange-50 p-6 rounded-lg">
                                        <div className="space-y-3">
                                            {user.notifications.slice(0, 5).map((notification: any) => (
                                                <div key={notification.id} className="bg-white p-4 rounded-lg border border-orange-200">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold">{notification.title}</h3>
                                                            <p className="text-gray-600 text-sm">{notification.message}</p>
                                                        </div>
                                                        <div className="ml-4 text-right">
                                                            {getStatusBadge(notification.is_read ? 'completed' : 'pending')}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatDate(notification.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {user.notifications.length > 5 && (
                                            <div className="mt-4 text-center">
                                                <span className="text-gray-600">... i {user.notifications.length - 5} więcej powiadomień</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Audit Logs */}
                            {user.audit_logs && user.audit_logs.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Historia działań</h2>
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <div className="space-y-3">
                                            {user.audit_logs.slice(0, 10).map((log: any) => (
                                                <div key={log.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium">{log.action}</span>
                                                                <span className="text-gray-600">na</span>
                                                                <span className="font-medium">{log.entity_type}</span>
                                                            </div>
                                                            {log.changes && (
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {JSON.stringify(log.changes, null, 2).substring(0, 100)}...
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatDate(log.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {user.audit_logs.length > 10 && (
                                            <div className="mt-4 text-center">
                                                <span className="text-gray-600">... i {user.audit_logs.length - 10} więcej wpisów</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* JSON Raw Data */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Dane surowe (JSON)</h2>
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <details className="cursor-pointer">
                                        <summary className="font-medium text-gray-700 hover:text-gray-900">
                                            Kliknij aby rozwinąć dane JSON
                                        </summary>
                                        <pre className="mt-4 text-xs text-gray-600 overflow-auto max-h-96 bg-white p-4 rounded border">
                                            {JSON.stringify(userData, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfile;