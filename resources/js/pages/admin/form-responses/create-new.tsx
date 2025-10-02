import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import FormFiller from '@/components/FormFiller';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building, Briefcase, FileText, Plus, ChevronRight } from 'lucide-react';
import { Form, FormResponse, Worker } from '@/types';

interface Tenant {
    id: string;
    name: string;
    sector: string;
}

interface Job {
    id: string;
    title: string;
    description: string;
    status: string;
    scheduled_at: string;
    tenant: Tenant;
    forms: Form[];
    workers: Worker[];
}

interface Props {
    tenants: Tenant[];
    jobs: Job[];
    forms: Form[];
    selectedTenant?: string;
    selectedJob?: string;
    selectedForm?: string;
    response?: FormResponse;
}

type Step = 'tenant' | 'job' | 'form' | 'response';

export default function CreateFormResponse({ 
    tenants, 
    jobs, 
    forms, 
    selectedTenant, 
    selectedJob, 
    selectedForm,
    response 
}: Props) {
    const [currentStep, setCurrentStep] = useState<Step>('tenant');
    const [selectedTenantId, setSelectedTenantId] = useState<string>(selectedTenant || '');
    const [selectedJobId, setSelectedJobId] = useState<string>(selectedJob || '');
    const [selectedFormId, setSelectedFormId] = useState<string>(selectedForm || '');
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Filtered data based on selections - memoized to prevent infinite re-renders
    const filteredJobs = useMemo(() => 
        jobs.filter(job => 
            selectedTenantId ? job.tenant.id === selectedTenantId : true
        ), [jobs, selectedTenantId]
    );

    const selectedJobData = useMemo(() => 
        jobs.find(job => job.id === selectedJobId), 
        [jobs, selectedJobId]
    );

    const jobForms = useMemo(() => 
        selectedJobData?.forms || [], 
        [selectedJobData]
    );

    const selectedFormData = useMemo(() => 
        jobForms.find(form => form.id === selectedFormId), 
        [jobForms, selectedFormId]
    );

    const jobWorkers = useMemo(() => 
        selectedJobData?.workers || [], 
        [selectedJobData]
    );

    const selectedWorker = useMemo(() => 
        jobWorkers.find(worker => worker.id === selectedWorkerId), 
        [jobWorkers, selectedWorkerId]
    );

    const isEditing = !!response;

    // Auto-advance steps when selections are made
    useEffect(() => {
        if (selectedTenantId && currentStep === 'tenant') {
            setCurrentStep('job');
        }
    }, [selectedTenantId, currentStep]);

    useEffect(() => {
        if (selectedJobId && currentStep === 'job') {
            setCurrentStep('form');
        }
    }, [selectedJobId, currentStep]);

    useEffect(() => {
        if (selectedFormId && currentStep === 'form') {
            setCurrentStep('response');
        }
    }, [selectedFormId, currentStep]);

    // Initialize from URL params
    useEffect(() => {
        if (selectedTenant) setSelectedTenantId(selectedTenant);
        if (selectedJob) setSelectedJobId(selectedJob);
        if (selectedForm) setSelectedFormId(selectedForm);
        
        if (selectedForm) {
            setCurrentStep('response');
        } else if (selectedJob) {
            setCurrentStep('form');
        } else if (selectedTenant) {
            setCurrentStep('job');
        }
    }, [selectedTenant, selectedJob, selectedForm]);

    const handleTenantSelect = (tenantId: string) => {
        setSelectedTenantId(tenantId);
        setSelectedJobId('');
        setSelectedFormId('');
        router.get(route('admin.form-responses.create-new'), { tenant: tenantId }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleJobSelect = (jobId: string) => {
        setSelectedJobId(jobId);
        setSelectedFormId('');
        router.get(route('admin.form-responses.create-new'), { 
            tenant: selectedTenantId, 
            job: jobId 
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleFormSelect = (formId: string) => {
        setSelectedFormId(formId);
        router.get(route('admin.form-responses.create-new'), { 
            tenant: selectedTenantId, 
            job: selectedJobId,
            form: formId
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSubmit = async (formData: Record<string, any>, isSubmitted: boolean = false) => {
        setIsSaving(true);
        
        try {
            const data = {
                response_data: formData,
                is_submitted: isSubmitted,
                job_id: selectedJobId,
                form_id: selectedFormId,
                worker_id: selectedWorkerId || null,
                tenant_id: selectedTenantId,
            };

            if (isEditing) {
                router.put(route('admin.form-responses.update', response!.id), data, {
                    onSuccess: () => {
                        router.visit(route('admin.form-responses.index'));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save response. Please try again.');
                    }
                });
            } else {
                router.post(route('admin.form-responses.store'), data, {
                    onSuccess: () => {
                        router.visit(route('admin.form-responses.index'));
                    },
                    onError: (errors) => {
                        console.error('Save failed:', errors);
                        alert('Failed to save response. Please try again.');
                    }
                });
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save response. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = (formData: Record<string, any>) => {
        handleSubmit(formData, false);
    };

    const handleSubmitFinal = (formData: Record<string, any>) => {
        if (confirm('Are you sure you want to submit this form? You won\'t be able to edit it after submission.')) {
            handleSubmit(formData, true);
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Form Responses', href: '/admin/form-responses' },
        { title: isEditing ? 'Edit Response' : 'Create Response', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Form Response' : 'Create Form Response'} />
            
            <div className="max-w-7xl mx-auto space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Form Response' : 'Create Form Response'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {currentStep === 'tenant' && 'Select a client to view their jobs'}
                            {currentStep === 'job' && 'Select a job to view assigned forms'}
                            {currentStep === 'form' && 'Select a form to fill out'}
                            {currentStep === 'response' && 'Fill out the form response'}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit(route('admin.form-responses.index'))}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Responses
                    </Button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
                    <div className={`flex items-center space-x-2 ${currentStep === 'tenant' || selectedTenantId ? 'text-blue-600' : 'text-gray-400'}`}>
                        <Building className="h-5 w-5" />
                        <span className="font-medium">Select Client</span>
                        {selectedTenantId && (
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {tenants.find(t => t.id === selectedTenantId)?.name}
                            </span>
                        )}
                    </div>
                    {selectedTenantId && (
                        <>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <div className={`flex items-center space-x-2 ${currentStep === 'job' || selectedJobId ? 'text-blue-600' : 'text-gray-400'}`}>
                                <Briefcase className="h-5 w-5" />
                                <span className="font-medium">Select Job</span>
                                {selectedJobId && (
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {selectedJobData?.title}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                    {selectedJobId && (
                        <>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <div className={`flex items-center space-x-2 ${currentStep === 'form' || selectedFormId ? 'text-blue-600' : 'text-gray-400'}`}>
                                <FileText className="h-5 w-5" />
                                <span className="font-medium">Select Form</span>
                                {selectedFormId && (
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {selectedFormData?.name}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                    {selectedFormId && (
                        <>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <div className="flex items-center space-x-2 text-green-600">
                                <Plus className="h-5 w-5" />
                                <span className="font-medium">Create Response</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Step Content */}
                {currentStep === 'tenant' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tenants.map((tenant) => (
                            <Card 
                                key={tenant.id} 
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    selectedTenantId === tenant.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleTenantSelect(tenant.id)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Building className="h-5 w-5 text-blue-600" />
                                        <span>{tenant.name}</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Sector: {tenant.sector}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                        <p>Click to view jobs for this client</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {currentStep === 'job' && selectedTenantId && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Jobs for {tenants.find(t => t.id === selectedTenantId)?.name}
                            </h2>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCurrentStep('tenant')}
                            >
                                Change Client
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredJobs.map((job) => (
                                <Card 
                                    key={job.id} 
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedJobId === job.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleJobSelect(job.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Briefcase className="h-5 w-5 text-green-600" />
                                            <span>{job.title}</span>
                                        </CardTitle>
                                        <CardDescription>
                                            {job.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {job.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Forms:</span>
                                                <span className="font-medium">{job.forms?.length || 0} assigned</span>
                                            </div>
                                            {job.scheduled_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Scheduled:</span>
                                                    <span className="font-medium">
                                                        {new Date(job.scheduled_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredJobs.length === 0 && (
                            <div className="text-center py-12">
                                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                                <p className="text-gray-600">There are no jobs for this client yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 'form' && selectedJobId && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Forms for "{selectedJobData?.title}"
                            </h2>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCurrentStep('job')}
                            >
                                Change Job
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobForms.map((form) => (
                                <Card 
                                    key={form.id} 
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedFormId === form.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleFormSelect(form.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                            <span>{form.name}</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Type: {form.type}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-gray-600">
                                            <p>Click to create a response for this form</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {jobForms.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No forms assigned</h3>
                                <p className="text-gray-600">This job doesn't have any forms assigned yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 'response' && selectedFormData && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Fill Form: {selectedFormData.name}</h2>
                                <p className="text-gray-600">
                                    Job: {selectedJobData?.title} • Client: {tenants.find(t => t.id === selectedTenantId)?.name}
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCurrentStep('form')}
                            >
                                Change Form
                            </Button>
                        </div>

                        {/* Form Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">i</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">
                                        {isEditing ? 'Editing Response' : 'How to fill this form'}
                                    </h3>
                                    <div className="mt-1 text-sm text-blue-700">
                                        {isEditing ? (
                                            <p>You can modify your responses and save as draft or submit the final version.</p>
                                        ) : (
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Fill out all required fields marked with *</li>
                                                <li>You can save as draft and continue later</li>
                                                <li>Once submitted, you cannot edit the response</li>
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Worker Selection */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="worker-select" className="text-base font-medium">
                                        Select Worker <span className="text-red-500">*</span>
                                    </Label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Choose who will be filling out this form response
                                    </p>
                                </div>
                                
                                <Select 
                                    value={selectedWorkerId} 
                                    onValueChange={setSelectedWorkerId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a worker from this job..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobWorkers.map((worker) => (
                                            <SelectItem key={worker.id} value={worker.id}>
                                                {worker.first_name} {worker.last_name} ({worker.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {jobWorkers.length === 0 && (
                                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                                        ⚠️ No workers are assigned to this job. Please assign workers to the job first.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Form */}
                        {selectedWorkerId && (
                        <div className="bg-white rounded-lg border p-6">
                            <FormFiller
                                form={selectedFormData}
                                initialData={response?.response_data}
                                onSaveDraft={handleSaveDraft}
                                onSubmit={handleSubmitFinal}
                                disabled={isSaving}
                            />
                        </div>
                        )}

                        {/* Response Information */}
                        {isEditing && response && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Response Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Created:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(response.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Last Updated:</span>
                                        <span className="ml-2 font-medium">
                                            {new Date(response.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                            response.is_submitted 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {response.is_submitted ? 'Submitted' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}