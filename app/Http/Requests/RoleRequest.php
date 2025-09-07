<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = auth()->user()->tenant_id;
        $roleId = $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                Rule::unique('roles', 'name')
                    ->where('tenant_id', $tenantId)
                    ->ignore($roleId)
            ],
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required.',
            'name.unique' => 'A role with this name already exists in your organization.',
            'name.min' => 'Role name must be at least 2 characters.',
            'name.max' => 'Role name cannot exceed 100 characters.',
            'description.max' => 'Description cannot exceed 500 characters.',
            'permissions.array' => 'Permissions must be provided as an array.',
            'permissions.*.exists' => 'One or more selected permissions do not exist.',
        ];
    }
}
