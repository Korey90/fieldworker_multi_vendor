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
        $forms = Form::query()
            ->with(['tenant', 'responses'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->when($request->form_type, function ($query, $type) {
                $query->where('form_type', $type);
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
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
            'description' => 'nullable|string',
            'tenat_id' => 'required|exists:tenats,id',
            'fields' => 'required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,number,email,date,select,checkbox,radio,file',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'form_type' => 'required|string|max:50',
            'is_active' => 'boolean',
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
        $form = Form::with([
            'tenant.sector',
            'responses.user',
            'responses.job'
        ])->findOrFail($id);

        return response()->json([
            'data' => new FormResource($form)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $form = Form::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'sometimes|required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,number,email,date,select,checkbox,radio,file',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'form_type' => 'sometimes|required|string|max:50',
            'is_active' => 'boolean',
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
        $form = Form::findOrFail($id);
        
        // Check if form has responses
        if ($form->responses()->count() > 0) {
            return response()->json([
                'error' => 'Cannot delete form with existing responses'
            ], 422);
        }

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
        $form = Form::findOrFail($id);
        
        $responses = $form->responses()
            ->with(['user', 'job'])
            ->when($request->is_submitted !== null, function ($query) use ($request) {
                $query->where('is_submitted', $request->boolean('is_submitted'));
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->job_id, function ($query, $jobId) {
                $query->where('job_id', $jobId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => FormResponseResource::collection($responses->items()),
            'meta' => [
                'current_page' => $responses->currentPage(),
                'last_page' => $responses->lastPage(),
                'per_page' => $responses->perPage(),
                'total' => $responses->total(),
            ]
        ]);
    }

    /**
     * Duplicate form
     */
    public function duplicate(Request $request, string $id): JsonResponse
    {
        $originalForm = Form::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $newForm = $originalForm->replicate();
        $newForm->name = $validated['name'];
        $newForm->is_active = false; // Start as inactive
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
        $form = Form::with(['responses'])->findOrFail($id);

        $responses = $form->responses;
        
        $stats = [
            'total_responses' => $responses->count(),
            'submitted_responses' => $responses->where('is_submitted', true)->count(),
            'draft_responses' => $responses->where('is_submitted', false)->count(),
            'response_rate' => $responses->count() > 0 ? 
                round(($responses->where('is_submitted', true)->count() / $responses->count()) * 100, 2) : 0,
            'average_completion_time' => $this->calculateAverageCompletionTime($responses),
            'recent_responses' => $responses->where('created_at', '>=', now()->subDays(7))->count(),
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
