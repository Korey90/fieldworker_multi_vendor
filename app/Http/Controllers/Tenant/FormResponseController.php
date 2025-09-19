<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FormResponseController extends Controller
{
    /**
     * Display a listing of form responses for a specific form.
     */
    public function index(Request $request, Form $form): Response
    {
        // Ensure the form belongs to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this form');
        }

        $responses = FormResponse::with(['user', 'form'])
            ->where('form_id', $form->id)
            ->where('tenant_id', auth()->user()->tenant_id)
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'submitted') {
                    $query->where('is_submitted', true);
                } elseif ($status === 'draft') {
                    $query->where('is_submitted', false);
                }
            })
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('tenant/form-responses/index', [
            'form' => $form,
            'responses' => $responses,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new response.
     */
    public function create(Form $form): Response
    {
        // Ensure the form belongs to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this form');
        }

        return Inertia::render('tenant/form-responses/create', [
            'form' => $form,
        ]);
    }

    /**
     * Store a newly created response in storage.
     */
    public function store(Request $request, Form $form)
    {
        // Ensure the form belongs to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this form');
        }

        $request->validate([
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
            'job_id' => 'nullable|string|exists:jobs,id',
        ]);

        $response = FormResponse::create([
            'form_id' => $form->id,
            'tenant_id' => auth()->user()->tenant_id,
            'user_id' => auth()->id(),
            'job_id' => $request->job_id,
            'response_data' => $request->response_data,
            'is_submitted' => $request->boolean('is_submitted', false),
            'submitted_at' => $request->boolean('is_submitted', false) ? now() : null,
        ]);

        if ($request->boolean('is_submitted', false)) {
            return redirect()->route('tenant.form-responses.show', [$form, $response])
                ->with('success', 'Form submitted successfully!');
        }

        return redirect()->route('tenant.form-responses.index', $form)
            ->with('success', 'Draft saved successfully!');
    }

    /**
     * Display the specified response.
     */
    public function show(Form $form, FormResponse $response): Response
    {
        // Ensure both form and response belong to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id || 
            $response->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access');
        }

        $response->load(['user', 'form', 'signatures']);

        return Inertia::render('tenant/form-responses/show', [
            'form' => $form,
            'response' => $response,
        ]);
    }

    /**
     * Show the form for editing the specified response.
     */
    public function edit(Form $form, FormResponse $response): Response
    {
        // Ensure both form and response belong to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id || 
            $response->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access');
        }

        // Only allow editing of non-submitted responses
        if ($response->is_submitted) {
            return redirect()->route('tenant.form-responses.show', [$form, $response])
                ->with('error', 'Cannot edit submitted responses');
        }

        return Inertia::render('tenant/form-responses/edit', [
            'form' => $form,
            'response' => $response,
        ]);
    }

    /**
     * Update the specified response in storage.
     */
    public function update(Request $request, Form $form, FormResponse $response)
    {
        // Ensure both form and response belong to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id || 
            $response->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access');
        }

        // Only allow updating of non-submitted responses
        if ($response->is_submitted) {
            return redirect()->route('tenant.form-responses.show', [$form, $response])
                ->with('error', 'Cannot edit submitted responses');
        }

        $request->validate([
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        $response->update([
            'response_data' => $request->response_data,
            'is_submitted' => $request->boolean('is_submitted', false),
            'submitted_at' => $request->boolean('is_submitted', false) ? now() : $response->submitted_at,
        ]);

        if ($request->boolean('is_submitted', false)) {
            return redirect()->route('tenant.form-responses.show', [$form, $response])
                ->with('success', 'Form submitted successfully!');
        }

        return redirect()->route('tenant.form-responses.index', $form)
            ->with('success', 'Response updated successfully!');
    }

    /**
     * Remove the specified response from storage.
     */
    public function destroy(Form $form, FormResponse $response)
    {
        // Ensure both form and response belong to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id || 
            $response->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access');
        }

        $response->delete();

        return redirect()->route('tenant.form-responses.index', $form)
            ->with('success', 'Response deleted successfully!');
    }

    /**
     * Export responses to CSV
     */
    public function export(Request $request, Form $form)
    {
        // Ensure the form belongs to the current tenant
        if ($form->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this form');
        }

        $responses = FormResponse::with(['user'])
            ->where('form_id', $form->id)
            ->where('tenant_id', auth()->user()->tenant_id)
            ->where('is_submitted', true)
            ->orderBy('submitted_at', 'desc')
            ->get();

        $filename = "form_responses_{$form->name}_" . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($responses, $form) {
            $file = fopen('php://output', 'w');
            
            // Get all field names from the form schema
            $fieldNames = [];
            foreach ($form->schema['sections'] ?? [] as $section) {
                foreach ($section['fields'] ?? [] as $field) {
                    $fieldNames[] = $field['name'];
                }
            }

            // CSV Header
            $header = array_merge([
                'Response ID',
                'User Name',
                'User Email',
                'Submitted At',
            ], $fieldNames);
            
            fputcsv($file, $header);

            // CSV Data
            foreach ($responses as $response) {
                $row = [
                    $response->id,
                    $response->user->name ?? '',
                    $response->user->email ?? '',
                    $response->submitted_at?->format('Y-m-d H:i:s') ?? '',
                ];

                // Add field values
                foreach ($fieldNames as $fieldName) {
                    $row[] = $response->response_data[$fieldName] ?? '';
                }

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}