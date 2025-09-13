<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Tenant;
use App\Models\User;
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
            ->with(['form.tenant', 'user', 'job'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('form', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
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
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
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

        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->limit(100)
            ->get();

        return Inertia::render('admin/form-responses/index', [
            'responses' => $responses,
            'forms' => $forms,
            'tenants' => $tenants,
            'users' => $users,
            'filters' => $request->only(['search', 'form_id', 'tenant_id', 'user_id', 'status', 'sort', 'direction']),
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

        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/form-responses/create', [
            'forms' => $forms,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'user_id' => 'required|exists:users,id',
            'data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        FormResponse::create($validated);

        return redirect()->route('admin.form-responses.index')
            ->with('success', 'Form response created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FormResponse $formResponse): Response
    {
        $formResponse->load(['form.tenant', 'user', 'job']);

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
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FormResponse $formResponse)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'data' => 'required|array',
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