import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { 
    ArrowLeft, 
    Save,
    AlertCircle,
    Trash2,
    FileText,
    MapPin,
    Users,
    Search,
    X
} from 'lucide-react';
import { type BreadcrumbItem, type Job, type Location, type User, type Worker, type Form, type Tenant } from '@/types';

interface JobEditProps {
    job: Job & {
        workers?: Worker[];
        forms?: Form[];
        tenant?: Tenant;
    };
    locations: Location[];
    workers: Worker[];
    forms: Form[];
    tenants: Tenant[];
}

interface JobFormData {
    tenant_id: string;
    title: string;
    description: string;
    location_id: string;
    assigned_worker_ids: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    scheduled_at: string;
    data: Record<string, any>;
    required_forms: string[];
}


const statuses = [
    { value: 'pending', label: 'Oczekuje' },
    { value: 'in_progress', label: 'W trakcie' },
    { value: 'completed', label: 'Ukończone' },
    { value: 'cancelled', label: 'Anulowane' },
];

export default function JobEdit({ job, locations, workers, forms, tenants }: JobEditProps) {
    // Debug: Log the incoming job data
    console.log('JobEdit - Incoming job data:', {
        id: job.id,
        scheduled_at: job.scheduled_at,
        title: job.title,
        tenant_id: job.tenant_id
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [formSearchQuery, setFormSearchQuery] = useState('');
    const [showFormDropdown, setShowFormDropdown] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Jobs', href: '/admin/jobs' },
        { title: job.title, href: `/admin/jobs/${job.id}` },
        { title: 'Edit', href: `/admin/jobs/${job.id}/edit` },
    ];

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        
        try {
            // Handle various date formats that might come from backend
            let date: Date;
            
            if (dateString.includes('T')) {
                // ISO format: 2024-01-01T10:30:00.000Z or 2024-01-01T10:30:00
                date = new Date(dateString);
            } else {
                // Fallback for other formats
                date = new Date(dateString);
            }
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return '';
            }
            
            // Format as YYYY-MM-DDTHH:mm for datetime-local input
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours().toString().padStart(2, '0');
            const minute = date.getMinutes().toString().padStart(2, '0');
            
            const formatted = `${year}-${month}-${day}T${hour}:${minute}`;
            console.log('Date formatting:', { input: dateString, output: formatted, date: date.toString() });
            return formatted;
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return '';
        }
    };

    const { data, setData, put, processing, errors, delete: destroy } = useForm<JobFormData>({
        tenant_id: job.tenant_id?.toString() || '',
        title: job.title || '',
        description: job.description || '',
        location_id: job.location_id?.toString() || '',
        assigned_worker_ids: job.workers?.map((w: any) => w.id.toString()) || [],
        status: job.status || 'pending',
        scheduled_at: formatDateForInput(job.scheduled_at || ''),
        data: job.data || {},
        required_forms: job.forms?.map((f: any) => f.id) || [],
    });

    // Wyczyść wybrane formy i pracowników gdy zmieni się tenant
    useEffect(() => {
        if (data.tenant_id && forms && workers) {
            // Sprawdź czy wybrane formy należą do aktualnego tenanta
            if (data.required_forms.length > 0) {
                const validForms = data.required_forms.filter(formId => {
                    const form = forms.find(f => f.id === formId);
                    return form && form.tenant_id === data.tenant_id;
                });
                
                // Jeśli niektóre formy nie należą do tenanta, usuń je
                if (validForms.length !== data.required_forms.length) {
                    setData('required_forms', validForms);
                }
            }
            
            // Sprawdź czy przypisani pracownicy należą do aktualnego tenanta
            if (data.assigned_worker_ids.length > 0) {
                const validWorkers = data.assigned_worker_ids.filter(workerId => {
                    const worker = workers.find(w => w.id.toString() === workerId);
                    return worker && worker.tenant_id === data.tenant_id;
                });
                
                // Jeśli niektórzy pracownicy nie należą do tenanta, usuń ich
                if (validWorkers.length !== data.assigned_worker_ids.length) {
                    setData('assigned_worker_ids', validWorkers);
                }
            }
        }
    }, [data.tenant_id, forms, workers]);

    const handleWorkerSelection = (worker: Worker) => {
        const workerId = worker.id.toString();
        if (!data.assigned_worker_ids.includes(workerId)) {
            const newWorkerIds = [...data.assigned_worker_ids];
            newWorkerIds.push(workerId);
            setData('assigned_worker_ids', newWorkerIds);
        }
        setSearchQuery('');
        setShowDropdown(false);
    };

    const handleFormSelection = (form: Form) => {
        const currentForms = data.required_forms || [];
        if (!currentForms.includes(form.id)) {
            const newForms = [...currentForms, form.id];
            setData('required_forms', newForms);
        }
        setFormSearchQuery('');
        setShowFormDropdown(false);
    };

    const removeForm = (formId: string) => {
        setData('required_forms', (data.required_forms || []).filter(id => id !== formId));
    };

    const removeWorker = (workerId: string) => {
        setData('assigned_worker_ids', data.assigned_worker_ids.filter(id => id !== workerId));
    };

    const filteredWorkers = (workers || []).filter(worker => {
        // Sprawdź czy pracownik nie jest już przypisany
        if (data.assigned_worker_ids.includes(worker.id.toString())) {
            return false;
        }
        
        // Filtrowanie po tenant_id - jeśli wybrano tenanta, pokazuj tylko jego pracowników
        if (data.tenant_id && worker.tenant_id !== data.tenant_id) {
            return false;
        }
        
        // Filtrowanie po wyszukiwanej frazie
        if (!searchQuery.trim()) return false;
        
        const searchLower = searchQuery.toLowerCase();
        return worker.first_name.toLowerCase().includes(searchLower) ||
               worker.last_name.toLowerCase().includes(searchLower) ||
               worker.email.toLowerCase().includes(searchLower);
    });

    const filteredForms = (forms || []).filter(form => {
        if (!form || !form.id) return false;
        
        const isAlreadySelected = (data.required_forms || []).includes(form.id);
        if (isAlreadySelected) return false;
        
        if (!formSearchQuery.trim()) return false;
        
        // Filtrowanie po tenant_id - jeśli wybrano tenanta, pokazuj tylko jego formy
        if (data.tenant_id && form.tenant_id !== data.tenant_id) {
            return false;
        }
        
        const searchLower = formSearchQuery.toLowerCase();
        const nameMatch = form.name?.toLowerCase().includes(searchLower) || false;
        const typeMatch = form.type?.toLowerCase().includes(searchLower) || false;
        
        return nameMatch || typeMatch;
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

    const isFormValid = () => {
        return data.title.trim() !== '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Job: ${job.title}`} />
            <div className="max-w-7xl mx-auto space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
                        <p className="text-gray-600 mt-1">Update job details and assignments</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDelete}
                            disabled={processing}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Job
                        </Button>
                        <Link href={`/admin/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Job
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Grid Layout - All Sections Visible */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {/* Basic Information Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Podstawowe informacje</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="tenant_id">Wybierz klienta *</Label>
                                <select
                                    id="tenant_id"
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Wybierz klienta...</option>
                                    {(tenants || []).map((tenant) => (
                                        <option key={tenant.id} value={tenant.id}>
                                            {tenant.name} ({(tenant as any).sector || 'Unknown'})
                                        </option>
                                    ))}
                                </select>
                                {errors.tenant_id && (
                                    <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.tenant_id}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="title">Tytuł pracy *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Wprowadź tytuł pracy"
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
                                <Label htmlFor="status">Status *</Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
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

                            <div>
                                <Label htmlFor="description">Opis</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Wprowadź opis pracy"
                                    rows={4}
                                    className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.description && (
                                    <div className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.description}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Schedule Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5" />
                                <span>Lokalizacja i harmonogram</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="location_id">Lokalizacja pracy</Label>
                                <select
                                    id="location_id"
                                    value={data.location_id}
                                    onChange={(e) => setData('location_id', e.target.value)}
                                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Wybierz lokalizację...</option>
                                    {(locations || []).map((location) => (
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

                            <DateTimePicker
                                id="scheduled_at"
                                label="Zaplanowana data i godzina"
                                value={data.scheduled_at}
                                onChange={(value) => setData('scheduled_at', value)}
                                placeholder="Wybierz datę i godzinę"
                                error={errors.scheduled_at}
                                className="mt-1"
                            />

                            {/* Location Preview */}
                            {data.location_id && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <h4 className="font-medium mb-2 text-sm">Wybrana lokalizacja:</h4>
                                    {(() => {
                                        const selectedLocation = locations.find(l => l.id.toString() === data.location_id);
                                        return selectedLocation ? (
                                            <div className="text-xs text-muted-foreground space-y-1">
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

                    {/* Worker Assignment Card */}
                    <Card className="lg:col-span-2 xl:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Przypisanie pracowników</span>
                            </CardTitle>
                            <CardDescription>
                                Przypisz pracowników do tego zadania.
                                {data.tenant_id 
                                    ? ` Pokazani są tylko pracownicy wybranego klienta.`
                                    : ` Pokazani są pracownicy wszystkich klientów.`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Przypisz pracowników (opcjonalne)</Label>
                                {/* Autocomplete Search */}
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Szukaj pracowników po imieniu lub emailu..."
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
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                                            {filteredWorkers.length > 0 ? (
                                                filteredWorkers.slice(0, 10).map((worker) => (
                                                    <button
                                                        key={worker.id}
                                                        type="button"
                                                        onClick={() => handleWorkerSelection(worker)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                                                            {worker.first_name.charAt(0)}{worker.last_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{worker.first_name} {worker.last_name}</p>
                                                            <p className="text-xs text-gray-500">{worker.email}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                                    Nie znaleziono pracowników dla "{searchQuery}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Workers Display */}
                                {data.assigned_worker_ids.length > 0 && (
                                    <div className="mt-2 mb-4">
                                        <p className="text-sm font-medium mb-2">Wybrani pracownicy ({data.assigned_worker_ids.length}):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {data.assigned_worker_ids.map((workerId) => {
                                                const worker = workers.find(u => u.id.toString() === workerId);
                                                return worker ? (
                                                    <div key={workerId} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1.5 rounded-lg text-xs border border-blue-200">
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                                {worker.first_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{worker.first_name} {worker.last_name}</p>
                                                                {worker.tenant_id && (
                                                                    <p className="text-xs text-blue-600">
                                                                        {tenants.find(t => t.id.toString() === worker.tenant_id)?.name || 'Unknown tenant'}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeWorker(workerId)}
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

                                {errors.assigned_worker_ids && (
                                    <div className="mt-2 flex items-center space-x-1 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.assigned_worker_ids}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Forms Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Wymagane formularze</CardTitle>
                            <CardDescription>
                                Wybierz formularze, które pracownicy muszą wypełnić.
                                {data.tenant_id 
                                    ? ` Pokazane są tylko formularze dla wybranego klienta.`
                                    : ` Pokazane są formularze wszystkich klientów.`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Form Search */}
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Szukaj formularzy..."
                                        value={formSearchQuery}
                                        onChange={(e) => {
                                            setFormSearchQuery(e.target.value);
                                            setShowFormDropdown(e.target.value.length > 0);
                                        }}
                                        onFocus={() => setShowFormDropdown(formSearchQuery.length > 0)}
                                        onBlur={() => setTimeout(() => setShowFormDropdown(false), 200)}
                                        className="pl-10"
                                    />
                                </div>
                                
                                {/* Dropdown Results */}
                                {showFormDropdown && formSearchQuery.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto mt-1">
                                        {filteredForms.length > 0 ? (
                                            filteredForms.slice(0, 10).map((form) => (
                                                <button
                                                    key={form.id}
                                                    type="button"
                                                    onClick={() => handleFormSelection(form)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-sm">{form.name}</p>
                                                            <p className="text-xs text-gray-500">Type: {form.type}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                Nie znaleziono formularzy dla "{formSearchQuery}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Forms Display */}
                            {data.required_forms && data.required_forms.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium mb-2">
                                        Wybrane formularze ({data.required_forms.length}):
                                    </p>
                                    <div className="space-y-2">
                                        {data.required_forms.map((formId) => {
                                            const form = forms.find(f => f.id === formId);
                                            return form ? (
                                                <div key={formId} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-green-900">{form.name}</p>
                                                            <div className="flex items-center space-x-2">
                                                                <p className="text-xs text-green-700">{form.type}</p>
                                                                {form.tenant_id && (
                                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                        {tenants.find(t => t.id.toString() === form.tenant_id)?.name || 'Unknown tenant'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeForm(formId)}
                                                        className="text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full p-1 transition-colors"
                                                        title="Usuń formularz"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {data.required_forms && data.required_forms.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Żadne formularze nie zostały jeszcze wybrane</p>
                                    <p className="text-xs text-gray-400">Użyj wyszukiwarki powyżej, aby dodać formularze</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Job Summary Card - Full Width */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Podsumowanie pracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Klient</Label>
                                <p className="text-sm text-muted-foreground">
                                    {data.tenant_id 
                                        ? tenants.find(t => t.id.toString() === data.tenant_id)?.name || 'Unknown'
                                        : 'Not specified'
                                    }
                                </p>
                            </div>
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
                                {data.assigned_worker_ids.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.assigned_worker_ids.map((workerId) => {
                                            const worker = workers.find(u => u.id.toString() === workerId);
                                            return worker ? (
                                                <span key={workerId} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                                                    {worker.first_name} {worker.last_name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No workers assigned</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-sm font-medium">Required Forms</Label>
                                {data.required_forms.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.required_forms.map((formId) => {
                                            const form = forms.find(f => f.id === formId);
                                            return form ? (
                                                <span key={formId} className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                                                    {form.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No forms required</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                    <Link href={`/admin/jobs/${job.id}`}>
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    
                    <Button 
                        type="button" 
                        onClick={() => {
                            put(`/admin/jobs/${job.id}`, {
                                onSuccess: () => {
                                    // Redirect handled by controller
                                },
                            });
                        }}
                        disabled={processing || !isFormValid()}
                    >
                        {processing ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Update Job
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}