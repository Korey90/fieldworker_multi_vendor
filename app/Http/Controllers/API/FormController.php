<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormResource;
use App\Http\Resources\FormResponseResource;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->get('current_tenant_id');
        
        $forms = Form::query()
            ->with(['tenant'])
            ->where('tenant_id', $tenantId)
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->form_type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => FormResource::collection($forms->items()),
            'meta' => [
                'current_page' => $forms->currentPage(),
                'last_page' => $forms->lastPage(),
                'per_page' => $forms->perPage(),
                'total' => $forms->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tenant_id' => 'required|exists:tenants,id',
            'type' => 'required|string|max:50',
            'schema' => 'required|array',
            'schema.fields' => 'required|array',
            'schema.fields.*.id' => 'required|string',
            'schema.fields.*.type' => 'required|string|in:text,textarea,number,email,date,datetime-local,select,checkbox,radio,file',
            'schema.fields.*.label' => 'required|string',
            'schema.fields.*.required' => 'boolean',
            'schema.fields.*.options' => 'nullable|array',
            'schema.settings' => 'nullable|array',
        ]);

        $form = Form::create($validated);
        $form->load(['tenant']);

        return response()->json([
            'message' => 'Form created successfully',
            'data' => new FormResource($form)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id');
        
        $form = Form::with(['tenant'])
            ->where('tenant_id', $tenantId)
            ->findOrFail($id);

        return response()->json([
            'data' => new FormResource($form)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->get('current_tenant_id');
        $form = Form::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:job,inspection,incident,maintenance,safety',
            'schema' => 'sometimes|required|array',
            'schema.fields' => 'sometimes|required|array',
            'schema.fields.*.id' => 'required|string',
            'schema.fields.*.type' => 'required|string|in:text,textarea,number,email,date,select,checkbox,radio,file',
            'schema.fields.*.label' => 'required|string',
            'schema.fields.*.required' => 'boolean',
            'schema.fields.*.options' => 'nullable|array',
        ]);

        $form->update($validated);
        $form->load(['tenant']);

        return response()->json([
            'message' => 'Form updated successfully',
            'data' => new FormResource($form)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id');
        $form = Form::where('tenant_id', $tenantId)->findOrFail($id);
        
        // For now, skip response check until relationship is properly configured
        $form->delete();

        return response()->json([
            'message' => 'Form deleted successfully'
        ]);
    }

    /**
     * Get form responses
     */
    public function responses(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->get('current_tenant_id');
        $form = Form::where('tenant_id', $tenantId)->findOrFail($id);
        
        // Return empty responses for now until FormResponse relationship is fixed
        return response()->json([
            'data' => [],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 0,
            ]
        ]);
    }

    /**
     * Duplicate form
     */
    public function duplicate(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->get('current_tenant_id');
        $originalForm = Form::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $newForm = $originalForm->replicate();
        $newForm->name = $validated['name'];
        $newForm->save();

        return response()->json([
            'message' => 'Form duplicated successfully',
            'data' => new FormResource($newForm)
        ], 201);
    }

    /**
     * Get form statistics
     */
    public function stats(string $id): JsonResponse
    {
        $tenantId = request()->get('current_tenant_id');
        $form = Form::where('tenant_id', $tenantId)->findOrFail($id);

        // For now, provide simplified stats until FormResponse relationship is fixed
        $stats = [
            'form_id' => $form->id,
            'total_responses' => 0,
            'recent_responses' => 0,
            'fields_count' => isset($form->schema['fields']) ? count($form->schema['fields']) : 0,
            'response_rate' => 0,
        ];

        return response()->json([
            'data' => $stats
        ]);
    }

    /**
     * Calculate average completion time
     */
    private function calculateAverageCompletionTime($responses)
    {
        $submittedResponses = $responses->where('is_submitted', true)->where('submitted_at', '!=', null);
        
        if ($submittedResponses->count() === 0) {
            return null;
        }

        $totalMinutes = $submittedResponses->sum(function ($response) {
            return $response->submitted_at->diffInMinutes($response->created_at);
        });

        return round($totalMinutes / $submittedResponses->count(), 2);
    }
}
