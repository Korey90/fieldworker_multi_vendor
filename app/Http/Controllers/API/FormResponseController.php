<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormResponseResource;
use App\Models\FormResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FormResponseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $responses = FormResponse::query()
            ->with(['form', 'user', 'job', 'tenant'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('form', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->when($request->tenant_id, function ($query, $tenantId) {
                $query->where('tenat_id', $tenantId);
            })
            ->when($request->form_id, function ($query, $formId) {
                $query->where('form_id', $formId);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->job_id, function ($query, $jobId) {
                $query->where('job_id', $jobId);
            })
            ->when($request->is_submitted !== null, function ($query) use ($request) {
                $query->where('is_submitted', $request->boolean('is_submitted'));
            })
            ->orderBy($request->get('sort', 'created_at'), $request->get('direction', 'desc'))
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'tenat_id' => 'required|exists:tenats,id',
            'user_id' => 'required|exists:users,id',
            'job_id' => 'nullable|exists:jobs,id',
            'response_data' => 'required|array',
            'is_submitted' => 'boolean',
        ]);

        if ($validated['is_submitted']) {
            $validated['submitted_at'] = now();
        }

        $response = FormResponse::create($validated);
        $response->load(['form', 'user', 'job']);

        return response()->json([
            'message' => 'Form response created successfully',
            'data' => new FormResponseResource($response)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $response = FormResponse::with([
            'form',
            'user.worker',
            'job.location',
            'tenant'
        ])->findOrFail($id);

        return response()->json([
            'data' => new FormResponseResource($response)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $response = FormResponse::findOrFail($id);

        // Check if response is already submitted
        if ($response->is_submitted) {
            return response()->json([
                'error' => 'Cannot update submitted response'
            ], 422);
        }

        $validated = $request->validate([
            'response_data' => 'sometimes|required|array',
            'is_submitted' => 'boolean',
        ]);

        if (isset($validated['is_submitted']) && $validated['is_submitted'] && !$response->is_submitted) {
            $validated['submitted_at'] = now();
        }

        $response->update($validated);
        $response->load(['form', 'user', 'job']);

        return response()->json([
            'message' => 'Form response updated successfully',
            'data' => new FormResponseResource($response)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $response = FormResponse::findOrFail($id);
        
        // Check if response is submitted
        if ($response->is_submitted) {
            return response()->json([
                'error' => 'Cannot delete submitted response'
            ], 422);
        }

        $response->delete();

        return response()->json([
            'message' => 'Form response deleted successfully'
        ]);
    }

    /**
     * Submit form response
     */
    public function submit(Request $request, string $id): JsonResponse
    {
        $response = FormResponse::findOrFail($id);

        if ($response->is_submitted) {
            return response()->json([
                'error' => 'Response is already submitted'
            ], 422);
        }

        $validated = $request->validate([
            'response_data' => 'required|array',
        ]);

        // Validate response data against form fields
        $form = $response->form;
        $validationErrors = $this->validateResponseData($validated['response_data'], $form->fields);

        if (!empty($validationErrors)) {
            return response()->json([
                'error' => 'Validation failed',
                'validation_errors' => $validationErrors
            ], 422);
        }

        $response->update([
            'response_data' => $validated['response_data'],
            'is_submitted' => true,
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Form response submitted successfully',
            'data' => new FormResponseResource($response)
        ]);
    }

    /**
     * Validate response data against form fields
     */
    private function validateResponseData(array $responseData, array $formFields): array
    {
        $errors = [];

        foreach ($formFields as $field) {
            $fieldName = $field['name'];
            $isRequired = $field['required'] ?? false;
            $fieldType = $field['type'];

            // Check if required field is missing or empty
            if ($isRequired && (!isset($responseData[$fieldName]) || empty($responseData[$fieldName]))) {
                $errors[$fieldName] = "Field '{$field['label']}' is required";
                continue;
            }

            // Skip validation if field is not provided and not required
            if (!isset($responseData[$fieldName])) {
                continue;
            }

            $value = $responseData[$fieldName];

            // Type-specific validation
            switch ($fieldType) {
                case 'email':
                    if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $errors[$fieldName] = "Field '{$field['label']}' must be a valid email";
                    }
                    break;
                case 'number':
                    if (!is_numeric($value)) {
                        $errors[$fieldName] = "Field '{$field['label']}' must be a number";
                    }
                    break;
                case 'date':
                    if (!strtotime($value)) {
                        $errors[$fieldName] = "Field '{$field['label']}' must be a valid date";
                    }
                    break;
                case 'select':
                case 'radio':
                    $options = $field['options'] ?? [];
                    if (!empty($options) && !in_array($value, $options)) {
                        $errors[$fieldName] = "Field '{$field['label']}' must be one of the allowed options";
                    }
                    break;
            }
        }

        return $errors;
    }
}
