<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $forms = Form::query()
            ->with(['tenant'])
            ->withCount('responses')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('type', 'like', "%{$search}%")
                      ->orWhereHas('tenant', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenant_id', $tenantId);
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
            ->paginate($request->get('per_page', 15))
            ->withQueryString();

        $types = Form::distinct()
            ->pluck('type')
            ->filter()
            ->values();

        $tenants = Tenant::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/forms/index', [
            'forms' => $forms,
            'types' => $types,
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'type', 'tenant_id', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $tenants = Tenant::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/forms/create', [
            'tenants' => $tenants,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'tenant_id' => 'required|exists:tenants,id',
            'schema' => 'required|array',
            'schema.sections' => 'required|array',
            'schema.sections.*.title' => 'required|string',
            'schema.sections.*.fields' => 'required|array',
            'schema.sections.*.fields.*.name' => 'required|string',
            'schema.sections.*.fields.*.type' => 'required|string|in:text,textarea,number,email,date,datetime-local,select,checkbox,radio,file,signature',
            'schema.sections.*.fields.*.label' => 'required|string',
            'schema.sections.*.fields.*.required' => 'boolean',
            'schema.sections.*.fields.*.options' => 'nullable|array',
        ]);

        Form::create($validated);

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form created successfully.');
    }

    /**
     * Show a preview of the form.
     */
    public function preview(string $id): Response
    {
        $form = Form::with(['tenant'])->findOrFail($id);

        return Inertia::render('admin/forms/preview', [
            'form' => $form,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Form $form): Response
    {
        $form->load(['tenant', 'responses.worker', 'responses.job']);
        
        $recentResponses = $form->responses()
            ->with(['worker', 'job'])
            ->latest()
            ->take(10)
            ->get();

        $stats = [
            'total_responses' => $form->responses()->count(),
            'submitted_responses' => $form->responses()->where('is_submitted', true)->count(),
            'draft_responses' => $form->responses()->where('is_submitted', false)->count(),
            'recent_responses' => $form->responses()->where('created_at', '>=', now()->subDays(7))->count(),
        ];

        return Inertia::render('admin/forms/show', [
            'form' => $form,
            'recentResponses' => $recentResponses,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Form $form): Response
    {
        $tenants = Tenant::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/forms/edit', [
            'form' => $form,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'tenant_id' => 'required|exists:tenants,id',
            'schema' => 'required|array',
            'schema.sections' => 'required|array',
            'schema.sections.*.title' => 'required|string',
            'schema.sections.*.fields' => 'required|array',
            'schema.sections.*.fields.*.name' => 'required|string',
            'schema.sections.*.fields.*.type' => 'required|string|in:text,textarea,number,email,date,datetime-local,select,checkbox,radio,file,signature',
            'schema.sections.*.fields.*.label' => 'required|string',
            'schema.sections.*.fields.*.required' => 'boolean',
            'schema.sections.*.fields.*.options' => 'nullable|array',
        ]);

        $form->update($validated);

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Form $form)
    {
        // Check if form has responses
        if ($form->responses()->exists()) {
            return redirect()->route('admin.forms.index')
                ->with('error', 'Cannot delete form with existing responses.');
        }

        $form->delete();

        return redirect()->route('admin.forms.index')
            ->with('success', 'Form deleted successfully.');
    }

    /**
     * Duplicate a form
     */
    public function duplicate(Form $form)
    {
        $newForm = $form->replicate();
        $newForm->name = $form->name . ' (Copy)';
        $newForm->save();

        return redirect()->route('admin.forms.edit', $newForm)
            ->with('success', 'Form duplicated successfully.');
    }
}