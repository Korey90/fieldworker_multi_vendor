<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Registration is open to public
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s\-\.\']+$/', // Only letters, spaces, hyphens, dots, and apostrophes
            ],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                'confirmed',
            ],
            'password_confirmation' => [
                'required',
                'string',
            ],
            'tenant_name' => [
                'required',
                'string',
                'max:255',
                'unique:tenants,name',
                'regex:/^[a-zA-Z0-9\s\-\_\.]+$/', // Letters, numbers, spaces, hyphens, underscores, dots
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[\+]?[1-9][\d]{0,15}$/', // International phone number format
            ],
            'terms_accepted' => [
                'required',
                'boolean',
                'accepted',
            ],
            'marketing_consent' => [
                'nullable',
                'boolean',
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
            'name.required' => 'Full name is required.',
            'name.regex' => 'Name can only contain letters, spaces, hyphens, dots, and apostrophes.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'An account with this email address already exists.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password_confirmation.required' => 'Password confirmation is required.',
            'tenant_name.required' => 'Organization name is required.',
            'tenant_name.unique' => 'An organization with this name already exists.',
            'tenant_name.regex' => 'Organization name can only contain letters, numbers, spaces, hyphens, underscores, and dots.',
            'phone.regex' => 'Please provide a valid phone number.',
            'terms_accepted.required' => 'You must accept the terms and conditions.',
            'terms_accepted.accepted' => 'You must accept the terms and conditions.',
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
            'name' => 'full name',
            'email' => 'email address',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'tenant_name' => 'organization name',
            'phone' => 'phone number',
            'terms_accepted' => 'terms and conditions',
            'marketing_consent' => 'marketing consent',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean up email
        if ($this->has('email')) {
            $this->merge(['email' => strtolower(trim($this->input('email')))]);
        }

        // Clean up name
        if ($this->has('name')) {
            $this->merge(['name' => trim($this->input('name'))]);
        }

        // Clean up tenant name
        if ($this->has('tenant_name')) {
            $this->merge(['tenant_name' => trim($this->input('tenant_name'))]);
        }

        // Clean up phone
        if ($this->has('phone')) {
            $phone = preg_replace('/[^+\d]/', '', $this->input('phone'));
            $this->merge(['phone' => $phone]);
        }

        // Ensure boolean values
        if ($this->has('terms_accepted')) {
            $this->merge(['terms_accepted' => filter_var($this->input('terms_accepted'), FILTER_VALIDATE_BOOLEAN)]);
        }

        if ($this->has('marketing_consent')) {
            $this->merge(['marketing_consent' => filter_var($this->input('marketing_consent'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }
}
