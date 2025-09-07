<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttachmentRequest extends FormRequest
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
            'tenant_id' => [
                'required',
                'exists:tenants,id',
            ],
            'attachable_type' => [
                'nullable',
                'string',
                Rule::in([
                    'App\Models\Job',
                    'App\Models\Worker',
                    'App\Models\Asset',
                    'App\Models\Form',
                    'App\Models\FormResponse',
                    'App\Models\User',
                    'App\Models\Certification',
                ]),
            ],
            'attachable_id' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'metadata' => [
                'nullable',
                'array',
            ],
        ];

        // File validation for new uploads
        if ($this->isMethod('POST')) {
            $rules['file'] = [
                'required',
                'file',
                'max:10240', // 10MB max
                'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt,csv,zip,rar',
            ];
        }

        // For bulk upload
        if ($this->route()->getName() === 'attachments.bulk-upload') {
            $rules = [
                'files' => 'required|array|max:10',
                'files.*' => [
                    'required',
                    'file',
                    'max:10240',
                    'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt,csv,zip,rar',
                ],
                'attachable_type' => [
                    'required',
                    'string',
                    Rule::in([
                        'App\Models\Job',
                        'App\Models\Worker',
                        'App\Models\Asset',
                        'App\Models\Form',
                        'App\Models\FormResponse',
                        'App\Models\User',
                        'App\Models\Certification',
                    ]),
                ],
                'attachable_id' => [
                    'required',
                    'integer',
                    'min:1',
                ],
                'description' => [
                    'nullable',
                    'string',
                    'max:1000',
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
            'file.required' => 'Please select a file to upload.',
            'file.file' => 'The uploaded item must be a valid file.',
            'file.max' => 'The file size cannot exceed 10MB.',
            'file.mimes' => 'Invalid file type. Allowed types: jpg, jpeg, png, pdf, doc, docx, xls, xlsx, txt, csv, zip, rar.',
            'files.required' => 'Please select at least one file to upload.',
            'files.array' => 'Files must be provided as an array.',
            'files.max' => 'You can upload a maximum of 10 files at once.',
            'files.*.file' => 'Each item must be a valid file.',
            'files.*.max' => 'Each file cannot exceed 10MB.',
            'files.*.mimes' => 'Invalid file type for one or more files.',
            'attachable_type.required' => 'Attachable type is required.',
            'attachable_type.in' => 'Invalid attachable type.',
            'attachable_id.required' => 'Attachable ID is required.',
            'attachable_id.integer' => 'Attachable ID must be a number.',
            'attachable_id.min' => 'Invalid attachable ID.',
            'description.max' => 'Description cannot exceed 1000 characters.',
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
            'attachable_type' => 'attachment type',
            'attachable_id' => 'record ID',
            'description' => 'file description',
        ];
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
            // Validate that the attachable model exists
            if ($this->filled(['attachable_type', 'attachable_id'])) {
                $modelClass = $this->input('attachable_type');
                
                if (class_exists($modelClass)) {
                    $exists = $modelClass::where('id', $this->input('attachable_id'))->exists();
                    
                    if (!$exists) {
                        $validator->errors()->add('attachable_id', 'The selected record does not exist.');
                    }
                } else {
                    $validator->errors()->add('attachable_type', 'Invalid model type.');
                }
            }
        });
    }
}
