<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantQuotaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && (auth()->user()->hasRole('admin') || auth()->user()->hasRole('manager'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantQuotaId = $this->route('tenantQuota')?->id;

        return [
            'tenant_id' => [
                'required',
                'exists:tenats,id',
                // Ensure unique combination of tenant_id and quota_type for new records
                Rule::unique('tenant_quotas', 'tenant_id')
                    ->where('quota_type', $this->input('quota_type'))
                    ->ignore($tenantQuotaId),
            ],
            'quota_type' => [
                'required',
                'string',
                'max:100',
                Rule::in([
                    'users',
                    'workers',
                    'jobs',
                    'assets',
                    'storage',
                    'api_calls',
                    'forms',
                    'notifications',
                    'attachments',
                    'signatures'
                ]),
            ],
            'quota_limit' => [
                'required',
                'integer',
                'min:0',
                'max:999999999',
            ],
            'current_usage' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999999999',
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['active', 'inactive', 'exceeded', 'warning']),
            ],
            'reset_date' => [
                'nullable',
                'date',
                'after:today',
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
            'tenant_id.required' => 'Tenant ID is required.',
            'tenant_id.exists' => 'The selected tenant does not exist.',
            'tenant_id.unique' => 'A quota for this tenant and quota type already exists.',
            'quota_type.required' => 'Quota type is required.',
            'quota_type.in' => 'Invalid quota type. Must be one of: users, workers, jobs, assets, storage, api_calls, forms, notifications, attachments, signatures.',
            'quota_limit.required' => 'Quota limit is required.',
            'quota_limit.integer' => 'Quota limit must be a number.',
            'quota_limit.min' => 'Quota limit cannot be negative.',
            'quota_limit.max' => 'Quota limit is too large.',
            'current_usage.integer' => 'Current usage must be a number.',
            'current_usage.min' => 'Current usage cannot be negative.',
            'status.in' => 'Invalid status. Must be one of: active, inactive, exceeded, warning.',
            'reset_date.after' => 'Reset date must be in the future.',
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
            'tenant_id' => 'tenant',
            'quota_type' => 'quota type',
            'quota_limit' => 'quota limit',
            'current_usage' => 'current usage',
            'reset_date' => 'reset date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        if (!$this->has('current_usage') && $this->isMethod('POST')) {
            $this->merge(['current_usage' => 0]);
        }

        if (!$this->has('status') && $this->isMethod('POST')) {
            $this->merge(['status' => 'active']);
        }

        if (!$this->has('reset_date') && $this->isMethod('POST')) {
            $this->merge(['reset_date' => now()->addMonth()]);
        }
    }
}
