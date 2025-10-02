<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Tenant;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormResponseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $responses = FormResponse::query()
            ->with(['form.tenant', 'worker', 'job'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('form', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('worker', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->form_id, function ($query, $formId) {
                $query->where('form_id', $formId);
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->whereHas('form', function ($q) use ($tenantId) {
                    $q->where('tenant_id', $tenantId);
                });
            })
            ->when($request->worker_id, function ($query, $workerId) {
                $query->where('worker_id', $workerId);
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'submitted') {
                    $query->where('is_submitted', true);
                } elseif ($status === 'draft') {
                    $query->where('is_submitted', false);
                }
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15))
            ->withQueryString();

        $forms = Form::with('tenant')
            ->select('id', 'name', 'tenant_id')
            ->orderBy('name')
            ->get();

        $tenants = Tenant::select('id', 'name')
            ->orderBy('name')
            ->get();

        $workers = Worker::select('id', 'first_name', 'email')
            ->orderBy('first_name')
            ->limit(100)
            ->get();



           // dd($forms, $tenants, $workers, $responses);

        return Inertia::render('admin/form-responses/index', [
            'responses' => $responses,
            'forms' => $forms,
            'tenants' => $tenants,
            'workers' => $workers,
            'filters' => $request->only(['search', 'form_id', 'tenant_id', 'worker_id', 'status', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $forms = Form::with('tenant')
            ->select('id', 'name', 'tenant_id', 'schema')
            ->orderBy('name')
            ->get();

        $workers = Worker::select('id', 'first_name', 'email')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('admin/form-responses/create', [
            'forms' => $forms,
            'workers' => $workers,
            
        ]);
    }

    /**
     * Show the form for creating a new resource with step-by-step workflow.
     */
    public function createNew(Request $request): Response
    {
        $tenants = Tenant::select('id', 'name', 'sector')->orderBy('name')->get();
        
        $jobs = [];
        
        // Load all jobs with their tenants, forms and workers
        $jobs = \App\Models\Job::with([
            'tenant:id,name,sector', 
            'forms:id,name,type,tenant_id,schema',
            'workers:id,first_name,last_name,email'
        ])
            ->select('id', 'title', 'description', 'status', 'scheduled_at', 'tenant_id')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($job) {
                // Ensure tenant has sector field for our interface
                $job->tenant->sector = $job->tenant->sector ?? 'Unknown';
                return $job;
            });

        return Inertia::render('admin/form-responses/create-new', [
            'tenants' => $tenants,
            'jobs' => $jobs,
            'selectedTenant' => $request->tenant,
            'selectedJob' => $request->job,
            'selectedForm' => $request->form,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //dd($request->all());
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'job_id' => 'nullable|exists:tenant_jobs,id',
            'worker_id' => 'nullable|exists:workers,id',
            'tenant_id' => 'required|exists:tenants,id',
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        $formResponse = FormResponse::create($validated);

        if($validated['is_submitted'] ?? false) {
            // If the form is submitted, set the submitted_at timestamp
            $formResponse->update([
                'submitted_at' => now(),
            ]);
        }

        return redirect()->route('admin.form-responses.index')
            ->with('success', 'Form response created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FormResponse $formResponse): Response
    {
        $formResponse->load(['form.tenant', 'worker', 'job']);

        return Inertia::render('admin/form-responses/show', [
            'response' => $formResponse,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FormResponse $formResponse): Response
    {
        $formResponse->load(['form', 'user']);

        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/form-responses/edit', [
            'response' => $formResponse,
            'form' => $formResponse->form,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FormResponse $formResponse)
    {
        $validated = $request->validate([
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        $formResponse->update($validated);

        return redirect()->route('admin.form-responses.index')
            ->with('success', 'Form response updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FormResponse $formResponse)
    {
        $formResponse->delete();

        return redirect()->route('admin.form-responses.index')
            ->with('success', 'Form response deleted successfully.');
    }

    /**
     * Submit a form response
     */
    public function submit(FormResponse $formResponse)
    {
        $formResponse->update([
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);

        return redirect()->route('admin.form-responses.show', $formResponse)
            ->with('success', 'Form response submitted successfully.');
    }
}