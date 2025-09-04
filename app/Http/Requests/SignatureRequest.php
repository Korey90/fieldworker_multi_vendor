<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SignatureRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'user_id' => [
                'required',
                'exists:users,id',
            ],
            'signatory_name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s\-\.\']+$/', // Only letters, spaces, hyphens, dots, and apostrophes
            ],
            'signatory_role' => [
                'nullable',
                'string',
                'max:255',
            ],
            'document_hash' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-fA-F0-9]+$/', // Only hexadecimal characters
            ],
            'metadata' => [
                'nullable',
                'array',
            ],
        ];

        // Signature data validation for new signatures
        if ($this->isMethod('POST')) {
            $rules['signature_data'] = [
                'required',
                'string',
                'regex:/^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+\/=]+$/', // Base64 image format
            ];
        }

        // For updates, only allow certain fields to be modified
        if ($this->isMethod('PATCH') || $this->isMethod('PUT')) {
            $rules = [
                'signatory_role' => [
                    'nullable',
                    'string',
                    'max:255',
                ],
                'metadata' => [
                    'nullable',
                    'array',
                ],
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'User is required.',
            'user_id.exists' => 'The selected user does not exist.',
            'signatory_name.required' => 'Signatory name is required.',
            'signatory_name.max' => 'Signatory name cannot exceed 255 characters.',
            'signatory_name.regex' => 'Signatory name can only contain letters, spaces, hyphens, dots, and apostrophes.',
            'signatory_role.max' => 'Signatory role cannot exceed 255 characters.',
            'signature_data.required' => 'Signature data is required.',
            'signature_data.regex' => 'Invalid signature format. Must be a valid base64 encoded image.',
            'document_hash.max' => 'Document hash cannot exceed 255 characters.',
            'document_hash.regex' => 'Document hash must contain only hexadecimal characters.',
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
            'user_id' => 'user',
            'signatory_name' => 'signatory name',
            'signatory_role' => 'signatory role',
            'signature_data' => 'signature',
            'document_hash' => 'document hash',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // For new signatures, set user_id to current user if not provided
        if ($this->isMethod('POST') && !$this->has('user_id')) {
            $this->merge(['user_id' => auth()->id()]);
        }

        // Clean up signature data format if needed
        if ($this->has('signature_data')) {
            $signatureData = $this->input('signature_data');
            
            // Ensure proper data URI format
            if (!str_starts_with($signatureData, 'data:image/')) {
                // If it's just base64 without the data URI prefix, add it
                if (base64_decode($signatureData, true) !== false) {
                    $this->merge(['signature_data' => 'data:image/png;base64,' . $signatureData]);
                }
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
            // Validate signature data size
            if ($this->has('signature_data')) {
                $signatureData = $this->input('signature_data');
                
                // Remove data URI prefix to get pure base64
                $base64Data = preg_replace('/^data:image\/[^;]+;base64,/', '', $signatureData);
                
                // Decode to check actual file size
                $decodedData = base64_decode($base64Data);
                
                if ($decodedData === false) {
                    $validator->errors()->add('signature_data', 'Invalid signature data format.');
                } else {
                    $sizeInBytes = strlen($decodedData);
                    $maxSizeInBytes = 2 * 1024 * 1024; // 2MB limit
                    
                    if ($sizeInBytes > $maxSizeInBytes) {
                        $validator->errors()->add('signature_data', 'Signature image is too large. Maximum size is 2MB.');
                    }
                    
                    // Check image dimensions (optional)
                    $imageInfo = getimagesizefromstring($decodedData);
                    if ($imageInfo !== false) {
                        [$width, $height] = $imageInfo;
                        
                        // Reasonable limits for signature images
                        if ($width > 1000 || $height > 500) {
                            $validator->errors()->add('signature_data', 'Signature image dimensions are too large. Maximum: 1000x500 pixels.');
                        }
                        
                        if ($width < 50 || $height < 20) {
                            $validator->errors()->add('signature_data', 'Signature image is too small. Minimum: 50x20 pixels.');
                        }
                    }
                }
            }

            // Authorization check - users can only create signatures for themselves unless they're admin
            if ($this->isMethod('POST') && $this->filled('user_id')) {
                $userId = $this->input('user_id');
                $currentUser = auth()->user();
                
                if ($userId != $currentUser->id && !$currentUser->hasRole('admin')) {
                    $validator->errors()->add('user_id', 'You can only create signatures for yourself.');
                }
            }
        });
    }
}
