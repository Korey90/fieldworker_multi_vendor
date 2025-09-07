<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Form>
 */
class FormFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Form::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => $this->faker->words(3, true) . ' Form',
            'type' => $this->faker->randomElement(['job', 'inspection', 'incident', 'maintenance', 'safety']),
            'schema' => [
                'fields' => [
                    [
                        'id' => 'field_1',
                        'type' => 'text',
                        'label' => 'Worker Name',
                        'required' => true,
                        'placeholder' => 'Enter worker name'
                    ],
                    [
                        'id' => 'field_2',
                        'type' => 'email',
                        'label' => 'Email Address',
                        'required' => true,
                        'placeholder' => 'Enter email'
                    ],
                    [
                        'id' => 'field_3',
                        'type' => 'select',
                        'label' => 'Status',
                        'required' => true,
                        'options' => [
                            ['value' => 'pending', 'label' => 'Pending'],
                            ['value' => 'completed', 'label' => 'Completed'],
                            ['value' => 'cancelled', 'label' => 'Cancelled']
                        ]
                    ],
                    [
                        'id' => 'field_4',
                        'type' => 'textarea',
                        'label' => 'Comments',
                        'required' => false,
                        'placeholder' => 'Additional comments'
                    ]
                ],
                'settings' => [
                    'theme' => 'default',
                    'submit_button_text' => 'Submit Form',
                    'success_message' => 'Form submitted successfully'
                ]
            ]
        ];
    }

    /**
     * Create a job form
     */
    public function job(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Job Assignment Form',
            'type' => 'job',
            'schema' => [
                'fields' => [
                    [
                        'id' => 'job_title',
                        'type' => 'text',
                        'label' => 'Job Title',
                        'required' => true
                    ],
                    [
                        'id' => 'location',
                        'type' => 'select',
                        'label' => 'Location',
                        'required' => true,
                        'options' => []
                    ],
                    [
                        'id' => 'scheduled_date',
                        'type' => 'date',
                        'label' => 'Scheduled Date',
                        'required' => true
                    ]
                ]
            ]
        ]);
    }

    /**
     * Create an inspection form
     */
    public function inspection(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Safety Inspection Form',
            'type' => 'inspection',
            'schema' => [
                'fields' => [
                    [
                        'id' => 'inspector_name',
                        'type' => 'text',
                        'label' => 'Inspector Name',
                        'required' => true
                    ],
                    [
                        'id' => 'inspection_date',
                        'type' => 'date',
                        'label' => 'Inspection Date',
                        'required' => true
                    ],
                    [
                        'id' => 'safety_rating',
                        'type' => 'select',
                        'label' => 'Safety Rating',
                        'required' => true,
                        'options' => [
                            ['value' => 'excellent', 'label' => 'Excellent'],
                            ['value' => 'good', 'label' => 'Good'],
                            ['value' => 'fair', 'label' => 'Fair'],
                            ['value' => 'poor', 'label' => 'Poor']
                        ]
                    ]
                ]
            ]
        ]);
    }

    /**
     * Create an incident form
     */
    public function incident(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Incident Report Form',
            'type' => 'incident',
            'schema' => [
                'fields' => [
                    [
                        'id' => 'incident_date',
                        'type' => 'datetime-local',
                        'label' => 'Incident Date & Time',
                        'required' => true
                    ],
                    [
                        'id' => 'severity',
                        'type' => 'select',
                        'label' => 'Severity Level',
                        'required' => true,
                        'options' => [
                            ['value' => 'low', 'label' => 'Low'],
                            ['value' => 'medium', 'label' => 'Medium'],
                            ['value' => 'high', 'label' => 'High'],
                            ['value' => 'critical', 'label' => 'Critical']
                        ]
                    ],
                    [
                        'id' => 'description',
                        'type' => 'textarea',
                        'label' => 'Incident Description',
                        'required' => true,
                        'placeholder' => 'Describe what happened'
                    ]
                ]
            ]
        ]);
    }
}
