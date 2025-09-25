<?php

namespace Database\Seeders;

use App\Models\Form;
use App\Models\Job;
use App\Models\User;
use App\Models\Worker;
use App\Models\FormResponse;
use App\Models\Signature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FormResponseSeeder extends Seeder
{
    public function run(): void
    {
        $forms = Form::all();
        $completedJobs = Job::where('status', 'completed')->get();
        
        foreach ($completedJobs as $job) {
            // Get users assigned to this job through workers
            $assignedUsers = Worker::whereHas('jobAssignments', function ($query) use ($job) {
                $query->where('job_id', $job->id);
            })->get();

            $assignedUsers = $assignedUsers->filter(fn($w) => $w->user_id && User::find($w->user_id));
            if ($assignedUsers->isEmpty()) continue;

            // Wybierz losowego usera   
//            $user = $assignedUsers->random();


            // Get forms for this tenant
            $tenantForms = $forms->where('tenant_id', $job->tenant_id);
            
            if ($tenantForms->isEmpty()) continue;

            $this->command->info("Creating form responses for Job ID: {$job->id} with " . count($assignedUsers) . " assigned users and " . count($tenantForms) . " forms.");

            // Create 1-3 form responses per completed job
            $responseCount = rand(1, min(3, $tenantForms->count()));
            $selectedForms = $tenantForms->random($responseCount);

            $this->command->info("Creating form responses for Job ID: {$job->id} with " . count($assignedUsers) . " assigned users and " . count($selectedForms) . " selected forms.");

            foreach ($selectedForms as $form) {
                $user = $assignedUsers->random();

                $this->command->info("Creating form response for User ID: {$user->id} and Form ID: {$form->id}");
                
                $formResponse = FormResponse::create([
                    'id' => Str::uuid(),
                    'form_id' => $form->id,
                    'tenant_id' => $job->tenant_id,
                    'user_id' => $user->id,
                    'job_id' => $job->id,
                    'response_data' => $this->generateAnswers($form->schema),
                    'is_submitted' => true,
                    'submitted_at' => now()->subDays(rand(1, 30)),
                ]);

                // Create signatures for this response
                $this->createSignatures($formResponse, $form->schema);
            }
        }
    }

    private function generateAnswers($schema): array
    {
        $answers = [];
        
        foreach ($schema['sections'] as $section) {
            foreach ($section['fields'] as $field) {
                if ($field['type'] === 'signature') {
                    continue; // Signatures are handled separately
                }

                $answers[$field['name']] = $this->generateFieldAnswer($field);
            }
        }

        return $answers;
    }

    private function generateFieldAnswer($field): mixed
    {
        switch ($field['type']) {
            case 'checkbox':
                return rand(0, 1) == 1;

            case 'select':
                if (isset($field['options']) && !empty($field['options'])) {
                    return $field['options'][rand(0, count($field['options']) - 1)];
                }
                return null;

            case 'textarea':
                return $this->generateTextareaContent($field['name']);

            case 'text':
                return $this->generateTextContent($field['name']);

            case 'time':
                return sprintf('%02d:%02d', rand(6, 18), rand(0, 59));

            case 'date':
                return date('Y-m-d', strtotime('-' . rand(0, 30) . ' days'));

            case 'number':
                return rand(1, 100);

            default:
                return $field['required'] ? 'Sample data' : null;
        }
    }

    private function generateTextareaContent($fieldName): string
    {
        $content = [
            'tasks_completed' => [
                'Installed new electrical outlets according to code specifications.',
                'Replaced damaged plumbing fixtures and tested water pressure.',
                'Completed safety inspection of all equipment and documented findings.',
                'Performed routine maintenance tasks and cleaned work area.'
            ],
            'materials_used' => [
                'Copper pipes, PVC fittings, electrical wire, outlet boxes',
                'Safety equipment, cleaning supplies, lubricants, filters',
                'Replacement parts, gaskets, seals, mounting hardware',
                'Tools, measuring equipment, testing devices'
            ],
            'issues_encountered' => [
                'Minor delay due to missing materials, resolved by next day delivery.',
                'Access restricted due to ongoing construction, coordinated with site supervisor.',
                'Equipment malfunction required additional troubleshooting time.',
                'Weather conditions caused temporary work stoppage.'
            ],
            'recommendations' => [
                'Schedule preventive maintenance every 6 months to avoid future issues.',
                'Consider upgrading to more efficient equipment for better performance.',
                'Implement regular safety training for all personnel.',
                'Maintain adequate inventory of replacement parts.'
            ],
            'hazards_identified' => [
                'Wet floor near entrance, placed warning signs.',
                'Loose electrical cable, secured and covered.',
                'Sharp edges on metal surfaces, added protective covering.',
                'Poor lighting in stairwell, reported to management.'
            ],
            'areas_inspected' => [
                'Main electrical panel, distribution boxes, all outlets and switches.',
                'HVAC system including ducts, filters, and control systems.',
                'Plumbing fixtures, pipes, valves, and drainage systems.',
                'Safety equipment, emergency exits, and warning systems.'
            ],
            'defects_found' => [
                'Minor corrosion on pipe joints, requires monitoring.',
                'Worn insulation on electrical cables, scheduled for replacement.',
                'Loose mounting bolts on equipment, tightened during inspection.',
                'Filter needs replacement, ordered and will install next visit.'
            ],
            'corrective_actions' => [
                'Replace worn components within 30 days.',
                'Schedule follow-up inspection in 3 months.',
                'Update maintenance procedures to prevent recurrence.',
                'Provide additional training to maintenance staff.'
            ],
            'comments' => [
                'Excellent service, very professional and thorough work.',
                'Technician explained everything clearly and answered all questions.',
                'Work completed on time and exceeded expectations.',
                'Very satisfied with the quality of service provided.'
            ],
            'description' => [
                'Completed all assigned tasks according to work order specifications.',
                'Performed thorough inspection and documented all findings.',
                'Resolved customer concerns and ensured satisfaction.',
                'Maintained high quality standards throughout the project.'
            ],
            'notes' => [
                'Customer requests scheduling next service during business hours.',
                'Additional work may be needed, will provide estimate.',
                'All safety protocols followed throughout the project.',
                'Recommend quarterly maintenance schedule going forward.'
            ]
        ];

        $fieldContent = $content[$fieldName] ?? [
            'Standard response for ' . str_replace('_', ' ', $fieldName) . '.',
            'Completed as requested with attention to detail.',
            'Work performed according to company standards.',
            'All requirements met satisfactorily.'
        ];

        return $fieldContent[rand(0, count($fieldContent) - 1)];
    }

    private function generateTextContent($fieldName): string
    {
        $content = [
            'employee_name' => 'John Smith',
            'customer_name' => 'ABC Company',
            'equipment_model' => 'Model XYZ-123',
            'reference_number' => 'REF-' . rand(1000, 9999),
            'location' => 'Building A, Floor 2',
            'temperature' => rand(15, 25) . '°C',
            'pressure' => rand(10, 50) . ' PSI',
            'voltage' => rand(110, 240) . 'V'
        ];

        return $content[$fieldName] ?? 'Sample ' . str_replace('_', ' ', $fieldName);
    }

    private function createSignatures($formResponse, $schema): void
    {
        // Find signature fields in schema
        foreach ($schema['sections'] as $section) {
            foreach ($section['fields'] as $field) {
                if ($field['type'] === 'signature' && rand(0, 1) == 1) {
                    Signature::create([
                        'id' => Str::uuid(),
                        'form_response_id' => $formResponse->id,
                        'name' => $this->getSignatureName($field['name']),
                        'role' => $this->getSignatureRole($field['name']),
                        'signature_image_path' => 'signatures/' . Str::uuid() . '.png'
                    ]);
                }
            }
        }
    }

    private function getSignatureName($fieldName): string
    {
        $names = [
            'worker_signature' => ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson'],
            'supervisor_signature' => ['Bob Manager', 'Alice Supervisor', 'Tom Leader'],
            'customer_signature' => ['Customer Rep', 'Site Manager', 'Facility Coordinator']
        ];

        $fieldNames = $names[$fieldName] ?? ['Generic Name'];
        return $fieldNames[rand(0, count($fieldNames) - 1)];
    }

    private function getSignatureRole($fieldName): string
    {
        $roles = [
            'worker_signature' => 'Field Technician',
            'supervisor_signature' => 'Field Supervisor',
            'customer_signature' => 'Customer Representative'
        ];

        return $roles[$fieldName] ?? 'Authorized Signatory';
    }
}
