<?php

namespace App\Http\Controllers;

use App\Models\FormResponse;
use App\Models\Form;
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
        $tenantId = session('current_tenant_id');
        
        $responses = FormResponse::query()
            ->where('tenant_id', $tenantId)
            ->with(['form', 'user', 'job', 'tenant'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('form', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($request->form_id, function ($query, $formId) {
                $query->where('form_id', $formId);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->is_submitted !== null, function ($query) use ($request) {
                $query->where('is_submitted', $request->boolean('is_submitted'));
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15))
            ->withQueryString();

        $forms = Form::where('tenant_id', $tenantId)->get(['id', 'name']);
        $users = User::where('tenant_id', $tenantId)->get(['id', 'name']);

        return Inertia::render('form-responses/index', [
            'responses' => $responses,
            'forms' => $forms,
            'users' => $users,
            'filters' => $request->only(['search', 'form_id', 'user_id', 'is_submitted', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $tenantId = session('current_tenant_id');
        $forms = Form::where('tenant_id', $tenantId)->get(['id', 'name', 'schema']);
        
        return Inertia::render('form-responses/create', [
            'forms' => $forms,
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
            'job_id' => 'nullable|exists:tenant_jobs,id',
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        $validated['tenant_id'] = session('current_tenant_id');
        
        if ($validated['is_submitted'] ?? false) {
            $validated['submitted_at'] = now();
        }

        FormResponse::create($validated);

        return redirect()->route('form-responses.index')
            ->with('success', 'Form response created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FormResponse $formResponse): Response
    {
        $formResponse->load(['form', 'user', 'job', 'tenant']);
        
        return Inertia::render('form-responses/show', [
            'response' => $formResponse,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FormResponse $formResponse): Response
    {
        if ($formResponse->is_submitted) {
            return redirect()->route('form-responses.show', $formResponse)
                ->with('error', 'Cannot edit submitted response.');
        }

        $formResponse->load(['form', 'user', 'job']);
        
        return Inertia::render('form-responses/edit', [
            'response' => $formResponse,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FormResponse $formResponse)
    {
        if ($formResponse->is_submitted) {
            return redirect()->route('form-responses.show', $formResponse)
                ->with('error', 'Cannot update submitted response.');
        }

        $validated = $request->validate([
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        if ($validated['is_submitted'] ?? false) {
            $validated['submitted_at'] = now();
        }

        $formResponse->update($validated);

        return redirect()->route('form-responses.index')
            ->with('success', 'Form response updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FormResponse $formResponse)
    {
        if ($formResponse->is_submitted) {
            return redirect()->route('form-responses.index')
                ->with('error', 'Cannot delete submitted response.');
        }

        $formResponse->delete();

        return redirect()->route('form-responses.index')
            ->with('success', 'Form response deleted successfully.');
    }

    /**
     * Submit a form response
     */
    public function submit(FormResponse $formResponse)
    {
        if ($formResponse->is_submitted) {
            return redirect()->route('form-responses.show', $formResponse)
                ->with('error', 'Response already submitted.');
        }

        $formResponse->update([
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);

        return redirect()->route('form-responses.show', $formResponse)
            ->with('success', 'Form response submitted successfully.');
    }
}