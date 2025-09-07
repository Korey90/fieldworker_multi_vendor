<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Job;
use App\Models\Worker;

class JobAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && (
            auth()->user()->hasAnyRole(['admin', 'manager']) || 
            auth()->user()->hasPermission('manage_job_assignments')
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $jobAssignmentId = $this->route('jobAssignment')?->id;
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'job_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!$value) return; // Skip validation if empty on update
                    
                    $job = \App\Models\Job::where('id', $value)
                        ->where('tenant_id', auth()->user()->tenant_id)
                        ->first();
                    
                    if (!$job) {
                        $fail('The selected job does not exist.');
                    }
                },
            ],
            'worker_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!$value) return; // Skip validation if empty on update
                    
                    $worker = \App\Models\Worker::where('id', $value)
                        ->where('tenant_id', auth()->user()->tenant_id)
                        ->first();
                    
                    if (!$worker) {
                        $fail('The selected worker does not exist.');
                    }
                },
                // Ensure worker is not already assigned to this job
                Rule::unique('job_assignments', 'worker_id')
                    ->where('job_id', $this->input('job_id'))
                    ->ignore($jobAssignmentId),
            ],
            'assigned_by' => [
                'sometimes',
                'exists:users,id',
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['assigned', 'in_progress', 'completed', 'cancelled']),
            ],
            'role' => [
                'nullable',
                'string',
                'max:255',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'data' => [
                'nullable',
                'array',
            ],
            'assigned_at' => [
                'sometimes',
                'date',
            ],
            'accepted_at' => [
                'nullable',
                'date',
                'after_or_equal:assigned_at',
            ],
            'started_at' => [
                'nullable',
                'date',
                'after_or_equal:accepted_at',
            ],
            'completed_at' => [
                'nullable',
                'date',
                'after_or_equal:started_at',
            ],
            'rejected_at' => [
                'nullable',
                'date',
                'after_or_equal:assigned_at',
            ],
            'cancelled_at' => [
                'nullable',
                'date',
                'after_or_equal:assigned_at',
            ],
            'rejection_reason' => [
                'nullable',
                'string',
                'max:500',
                'required_if:status,rejected',
            ],
            'cancellation_reason' => [
                'nullable',
                'string',
                'max:500',
                'required_if:status,cancelled',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'estimated_duration' => [
                'nullable',
                'integer',
                'min:1',
                'max:480', // 8 hours max in minutes
            ],
            'actual_duration' => [
                'nullable',
                'integer',
                'min:1',
                'max:480',
            ],
            'priority' => [
                'sometimes',
                'string',
                Rule::in(['low', 'normal', 'high', 'urgent']),
            ],
            'metadata' => [
                'nullable',
                'array',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'job_id.required' => 'Job is required.',
            'job_id.exists' => 'The selected job does not exist.',
            'worker_id.required' => 'Worker is required.',
            'worker_id.exists' => 'The selected worker does not exist.',
            'worker_id.unique' => 'This worker is already assigned to this job.',
            'assigned_by.exists' => 'The assigned by user does not exist.',
            'status.in' => 'Invalid status. Must be one of: pending, accepted, rejected, in_progress, completed, cancelled.',
            'accepted_at.after_or_equal' => 'Acceptance date must be after or equal to assignment date.',
            'started_at.after_or_equal' => 'Start date must be after or equal to acceptance date.',
            'completed_at.after_or_equal' => 'Completion date must be after or equal to start date.',
            'rejected_at.after_or_equal' => 'Rejection date must be after or equal to assignment date.',
            'cancelled_at.after_or_equal' => 'Cancellation date must be after or equal to assignment date.',
            'rejection_reason.required_if' => 'Rejection reason is required when status is rejected.',
            'rejection_reason.max' => 'Rejection reason cannot exceed 500 characters.',
            'cancellation_reason.required_if' => 'Cancellation reason is required when status is cancelled.',
            'cancellation_reason.max' => 'Cancellation reason cannot exceed 500 characters.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
            'estimated_duration.min' => 'Estimated duration must be at least 1 minute.',
            'estimated_duration.max' => 'Estimated duration cannot exceed 8 hours (480 minutes).',
            'actual_duration.min' => 'Actual duration must be at least 1 minute.',
            'actual_duration.max' => 'Actual duration cannot exceed 8 hours (480 minutes).',
            'priority.in' => 'Invalid priority. Must be one of: low, normal, high, urgent.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'job_id' => 'job',
            'worker_id' => 'worker',
            'assigned_by' => 'assigned by',
            'assigned_at' => 'assignment date',
            'accepted_at' => 'acceptance date',
            'started_at' => 'start date',
            'completed_at' => 'completion date',
            'rejected_at' => 'rejection date',
            'cancelled_at' => 'cancellation date',
            'rejection_reason' => 'rejection reason',
            'cancellation_reason' => 'cancellation reason',
            'estimated_duration' => 'estimated duration',
            'actual_duration' => 'actual duration',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set defaults for new assignments
        if ($this->isMethod('POST')) {
            if (!$this->has('assigned_by')) {
                $this->merge(['assigned_by' => auth()->id()]);
            }

            if (!$this->has('status')) {
                $this->merge(['status' => 'pending']);
            }

            if (!$this->has('assigned_at')) {
                $this->merge(['assigned_at' => now()]);
            }

            if (!$this->has('priority')) {
                $this->merge(['priority' => 'normal']);
            }
        }
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Check if job is available for assignment
            if ($this->filled('job_id')) {
                $job = Job::where('id', $this->input('job_id'))
                    ->where('tenant_id', auth()->user()->tenant_id)
                    ->first();
                
                if ($job && $job->status !== 'open') {
                    $validator->errors()->add('job_id', 'This job is not available for assignment.');
                }
            }

            // Check if worker is available
            if ($this->filled('worker_id')) {
                $worker = Worker::where('id', $this->input('worker_id'))
                    ->where('tenant_id', auth()->user()->tenant_id)
                    ->first();
                
                if ($worker && $worker->status !== 'active') {
                    $validator->errors()->add('worker_id', 'This worker is not available for assignment.');
                }
            }

            // Validate status transitions
            if ($this->isMethod('PATCH') && $this->filled('status')) {
                $currentAssignment = $this->route('jobAssignment');
                $newStatus = $this->input('status');
                
                if ($currentAssignment) {
                    $validTransitions = [
                        'pending' => ['accepted', 'rejected', 'cancelled'],
                        'accepted' => ['in_progress', 'cancelled'],
                        'in_progress' => ['completed', 'cancelled'],
                        'rejected' => [],
                        'completed' => [],
                        'cancelled' => [],
                    ];

                    $currentStatus = $currentAssignment->status;
                    
                    if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
                        $validator->errors()->add('status', "Cannot change status from {$currentStatus} to {$newStatus}.");
                    }
                }
            }
        });
    }
}
