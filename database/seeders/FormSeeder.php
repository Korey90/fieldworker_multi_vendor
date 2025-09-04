<?php

namespace Database\Seeders;

use App\Models\Tenat;
use App\Models\Form;
use App\Models\Job;
use App\Models\Worker;
use App\Models\FormResponse;
use App\Models\Signature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FormSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenat::all();

        foreach ($tenants as $tenant) {
            $formCount = rand(3, 8);
            
            for ($i = 1; $i <= $formCount; $i++) {
                $formType = $this->getFormTypeForSector($tenant->sector);
                $schema = $this->generateFormSchema($formType);
                
                Form::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'name' => $this->generateFormName($formType),
                    'type' => $formType,
                    'schema' => $schema
                ]);
            }
        }
    }

    private function getFormTypeForSector($sector): string
    {
        $types = [
            'CONST' => ['safety_checklist', 'work_completion', 'inspection_report', 'material_request'],
            'MAINT' => ['maintenance_log', 'inspection_checklist', 'work_order', 'equipment_status'],
            'INSP' => ['inspection_report', 'compliance_checklist', 'audit_form', 'certification'],
            'SERV' => ['service_report', 'customer_feedback', 'installation_checklist', 'troubleshooting'],
            'LOG' => ['delivery_confirmation', 'pickup_receipt', 'route_log', 'damage_report'],
            'UTIL' => ['service_connection', 'meter_reading', 'maintenance_log', 'emergency_response'],
            'TELE' => ['installation_report', 'signal_test', 'equipment_checklist', 'performance_report'],
            'CLEAN' => ['cleaning_checklist', 'quality_inspection', 'chemical_usage', 'completion_report']
        ];

        $sectorTypes = $types[$sector] ?? ['general_form'];
        return $sectorTypes[rand(0, count($sectorTypes) - 1)];
    }

    private function generateFormName($type): string
    {
        $names = [
            'safety_checklist' => 'Site Safety Inspection Checklist',
            'work_completion' => 'Work Completion Report',
            'inspection_report' => 'Quality Inspection Report',
            'material_request' => 'Material Request Form',
            'maintenance_log' => 'Equipment Maintenance Log',
            'work_order' => 'Work Order Form',
            'equipment_status' => 'Equipment Status Report',
            'compliance_checklist' => 'Compliance Verification Checklist',
            'audit_form' => 'Internal Audit Form',
            'certification' => 'Certification Request',
            'service_report' => 'Service Completion Report',
            'customer_feedback' => 'Customer Satisfaction Survey',
            'installation_checklist' => 'Installation Verification Checklist',
            'troubleshooting' => 'Troubleshooting Report',
            'delivery_confirmation' => 'Delivery Confirmation Form',
            'pickup_receipt' => 'Pickup Receipt',
            'route_log' => 'Route Completion Log',
            'damage_report' => 'Damage Assessment Report',
            'service_connection' => 'Service Connection Form',
            'meter_reading' => 'Meter Reading Form',
            'emergency_response' => 'Emergency Response Report',
            'installation_report' => 'Installation Report',
            'signal_test' => 'Signal Test Results',
            'performance_report' => 'Performance Assessment Report',
            'cleaning_checklist' => 'Cleaning Task Checklist',
            'quality_inspection' => 'Quality Control Inspection',
            'chemical_usage' => 'Chemical Usage Log',
            'completion_report' => 'Task Completion Report'
        ];

        return $names[$type] ?? ucfirst(str_replace('_', ' ', $type));
    }

    private function generateFormSchema($type): array
    {
        $baseSchema = [
            'version' => '1.0',
            'sections' => []
        ];

        switch ($type) {
            case 'safety_checklist':
                $baseSchema['sections'] = [
                    [
                        'title' => 'Personal Protective Equipment',
                        'fields' => [
                            ['name' => 'hard_hat', 'type' => 'checkbox', 'label' => 'Hard hat worn', 'required' => true],
                            ['name' => 'safety_vest', 'type' => 'checkbox', 'label' => 'Safety vest worn', 'required' => true],
                            ['name' => 'safety_shoes', 'type' => 'checkbox', 'label' => 'Safety shoes worn', 'required' => true],
                            ['name' => 'gloves', 'type' => 'checkbox', 'label' => 'Protective gloves worn', 'required' => false]
                        ]
                    ],
                    [
                        'title' => 'Site Conditions',
                        'fields' => [
                            ['name' => 'weather_conditions', 'type' => 'select', 'label' => 'Weather conditions', 'options' => ['Clear', 'Rainy', 'Windy', 'Foggy'], 'required' => true],
                            ['name' => 'hazards_identified', 'type' => 'textarea', 'label' => 'Hazards identified', 'required' => false],
                            ['name' => 'emergency_exits', 'type' => 'checkbox', 'label' => 'Emergency exits clear', 'required' => true]
                        ]
                    ]
                ];
                break;

            case 'work_completion':
                $baseSchema['sections'] = [
                    [
                        'title' => 'Work Details',
                        'fields' => [
                            ['name' => 'tasks_completed', 'type' => 'textarea', 'label' => 'Tasks completed', 'required' => true],
                            ['name' => 'time_started', 'type' => 'time', 'label' => 'Start time', 'required' => true],
                            ['name' => 'time_finished', 'type' => 'time', 'label' => 'Finish time', 'required' => true],
                            ['name' => 'materials_used', 'type' => 'textarea', 'label' => 'Materials used', 'required' => false]
                        ]
                    ],
                    [
                        'title' => 'Quality & Issues',
                        'fields' => [
                            ['name' => 'quality_rating', 'type' => 'select', 'label' => 'Quality rating', 'options' => ['Excellent', 'Good', 'Satisfactory', 'Needs improvement'], 'required' => true],
                            ['name' => 'issues_encountered', 'type' => 'textarea', 'label' => 'Issues encountered', 'required' => false],
                            ['name' => 'recommendations', 'type' => 'textarea', 'label' => 'Recommendations', 'required' => false]
                        ]
                    ]
                ];
                break;

            case 'inspection_report':
                $baseSchema['sections'] = [
                    [
                        'title' => 'Inspection Details',
                        'fields' => [
                            ['name' => 'inspection_type', 'type' => 'select', 'label' => 'Inspection type', 'options' => ['Safety', 'Quality', 'Maintenance', 'Compliance'], 'required' => true],
                            ['name' => 'areas_inspected', 'type' => 'textarea', 'label' => 'Areas inspected', 'required' => true],
                            ['name' => 'overall_condition', 'type' => 'select', 'label' => 'Overall condition', 'options' => ['Excellent', 'Good', 'Fair', 'Poor'], 'required' => true]
                        ]
                    ],
                    [
                        'title' => 'Findings',
                        'fields' => [
                            ['name' => 'defects_found', 'type' => 'textarea', 'label' => 'Defects found', 'required' => false],
                            ['name' => 'corrective_actions', 'type' => 'textarea', 'label' => 'Corrective actions required', 'required' => false],
                            ['name' => 'follow_up_required', 'type' => 'checkbox', 'label' => 'Follow-up inspection required', 'required' => false]
                        ]
                    ]
                ];
                break;

            case 'customer_feedback':
                $baseSchema['sections'] = [
                    [
                        'title' => 'Service Evaluation',
                        'fields' => [
                            ['name' => 'service_rating', 'type' => 'select', 'label' => 'Overall service rating', 'options' => ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'], 'required' => true],
                            ['name' => 'technician_professional', 'type' => 'select', 'label' => 'Technician professionalism', 'options' => ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'], 'required' => true],
                            ['name' => 'work_quality', 'type' => 'select', 'label' => 'Work quality', 'options' => ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'], 'required' => true],
                            ['name' => 'timeliness', 'type' => 'select', 'label' => 'Timeliness', 'options' => ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Very Poor'], 'required' => true]
                        ]
                    ],
                    [
                        'title' => 'Additional Feedback',
                        'fields' => [
                            ['name' => 'comments', 'type' => 'textarea', 'label' => 'Additional comments', 'required' => false],
                            ['name' => 'recommend_service', 'type' => 'checkbox', 'label' => 'Would recommend our service', 'required' => false],
                            ['name' => 'contact_for_follow_up', 'type' => 'checkbox', 'label' => 'Contact me for follow-up', 'required' => false]
                        ]
                    ]
                ];
                break;

            default:
                $baseSchema['sections'] = [
                    [
                        'title' => 'General Information',
                        'fields' => [
                            ['name' => 'description', 'type' => 'textarea', 'label' => 'Description', 'required' => true],
                            ['name' => 'status', 'type' => 'select', 'label' => 'Status', 'options' => ['Complete', 'Incomplete', 'In Progress'], 'required' => true],
                            ['name' => 'notes', 'type' => 'textarea', 'label' => 'Additional notes', 'required' => false]
                        ]
                    ]
                ];
        }

        // Add signature section to all forms
        $baseSchema['sections'][] = [
            'title' => 'Signatures',
            'fields' => [
                ['name' => 'worker_signature', 'type' => 'signature', 'label' => 'Worker signature', 'required' => true],
                ['name' => 'supervisor_signature', 'type' => 'signature', 'label' => 'Supervisor signature', 'required' => false],
                ['name' => 'customer_signature', 'type' => 'signature', 'label' => 'Customer signature', 'required' => false]
            ]
        ];

        return $baseSchema;
    }
}
