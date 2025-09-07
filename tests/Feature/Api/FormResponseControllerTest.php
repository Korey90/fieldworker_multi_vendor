<?php

namespace Tests\Feature\Api;

use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Job;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormResponseControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $manager; 
    private User $worker;
    private Tenant $tenant;
    private Role $adminRole;
    private Role $managerRole;
    private Role $workerRole;
    private Form $form;

    protected function setUp(): void
    {
        // Nie wywołujemy parent::setUp() żeby uniknąć konfliktu z tenant w TestCase
        $this->app = $this->createApplication();
        $this->setUpTraits();        // Create tenant
        $this->tenant = Tenant::factory()->active()->create();

        // Create roles
        $this->adminRole = Role::factory()->create(['name' => 'Admin', 'slug' => 'admin']);
        $this->managerRole = Role::factory()->create(['name' => 'Manager', 'slug' => 'manager']);
        $this->workerRole = Role::factory()->create(['name' => 'Worker', 'slug' => 'worker']);

        // Create users
        $this->admin = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->admin->roles()->attach($this->adminRole);

        $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->manager->roles()->attach($this->managerRole);

        $this->worker = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->worker->roles()->attach($this->workerRole);

        // Create test form
        $this->form = Form::factory()->create([
            'tenant_id' => $this->tenant->id,
            'schema' => [
                'fields' => [
                    [
                        'name' => 'feedback',
                        'type' => 'text',
                        'label' => 'Feedback',
                        'required' => true
                    ],
                    [
                        'name' => 'rating',
                        'type' => 'number',
                        'label' => 'Rating',
                        'required' => false
                    ]
                ]
            ]
        ]);
    }

    public function test_admin_can_list_form_responses(): void
    {
        FormResponse::factory()->count(3)->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/form-responses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'response_data',
                        'is_submitted',
                        'created_at',
                        'updated_at'
                    ]
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_can_create_form_response(): void
    {
        $data = [
            'form_id' => $this->form->id,
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id,
            'response_data' => [
                'feedback' => 'Great job!',
                'rating' => 5
            ],
            'is_submitted' => false,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/form-responses', $data);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Form response created successfully',
                'data' => [
                    'response_data' => $data['response_data'],
                    'is_submitted' => false,
                ]
            ]);

        $this->assertDatabaseHas('form_responses', [
            'form_id' => $this->form->id,
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_admin_can_view_form_response(): void
    {
        $formResponse = FormResponse::factory()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/form-responses/{$formResponse->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $formResponse->id,
                    'response_data' => $formResponse->response_data,
                    'is_submitted' => $formResponse->is_submitted,
                ]
            ]);
    }

    public function test_admin_can_update_draft_form_response(): void
    {
        $formResponse = FormResponse::factory()->draft()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $updateData = [
            'response_data' => [
                'feedback' => 'Updated feedback',
                'rating' => 4
            ],
            'is_submitted' => false,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/form-responses/{$formResponse->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Form response updated successfully',
                'data' => [
                    'response_data' => $updateData['response_data'],
                    'is_submitted' => false,
                ]
            ]);
    }

    public function test_admin_cannot_update_submitted_form_response(): void
    {
        $formResponse = FormResponse::factory()->submitted()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $updateData = [
            'response_data' => [
                'feedback' => 'Updated feedback',
                'rating' => 4
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/form-responses/{$formResponse->id}", $updateData);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Cannot update submitted response'
            ]);
    }

    public function test_admin_can_delete_draft_form_response(): void
    {
        $formResponse = FormResponse::factory()->draft()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/form-responses/{$formResponse->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Form response deleted successfully'
            ]);

        $this->assertDatabaseMissing('form_responses', [
            'id' => $formResponse->id,
        ]);
    }

    public function test_admin_cannot_delete_submitted_form_response(): void
    {
        $formResponse = FormResponse::factory()->submitted()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/form-responses/{$formResponse->id}");

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Cannot delete submitted response'
            ]);

        $this->assertDatabaseHas('form_responses', [
            'id' => $formResponse->id,
        ]);
    }

    public function test_admin_can_submit_form_response(): void
    {
        $formResponse = FormResponse::factory()->draft()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
            'response_data' => [
                'feedback' => 'Initial feedback',
                'rating' => 3
            ]
        ]);

        $submitData = [
            'response_data' => [
                'feedback' => 'Final feedback',
                'rating' => 5
            ]
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/form-responses/{$formResponse->id}/submit", $submitData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Form response submitted successfully',
                'data' => [
                    'is_submitted' => true,
                    'response_data' => $submitData['response_data']
                ]
            ]);

        $formResponse->refresh();
        $this->assertTrue($formResponse->is_submitted);
        $this->assertNotNull($formResponse->submitted_at);
    }

    public function test_cannot_submit_already_submitted_form_response(): void
    {
        $formResponse = FormResponse::factory()->submitted()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $submitData = [
            'response_data' => [
                'feedback' => 'Updated feedback',
                'rating' => 5
            ]
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/form-responses/{$formResponse->id}/submit", $submitData);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Response is already submitted'
            ]);
    }

    public function test_submit_validates_required_fields(): void
    {
        $formResponse = FormResponse::factory()->draft()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $submitData = [
            'response_data' => [
                'rating' => 5
                // Missing required 'feedback' field
            ]
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/form-responses/{$formResponse->id}/submit", $submitData);

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Validation failed',
                'validation_errors' => [
                    'feedback' => "Field 'Feedback' is required"
                ]
            ]);
    }

    public function test_manager_can_access_form_responses(): void
    {
        $formResponse = FormResponse::factory()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->manager->id,
        ]);

        $response = $this->actingAs($this->manager, 'sanctum')
            ->getJson('/api/v1/form-responses');

        $response->assertStatus(200);
    }

    public function test_worker_can_access_form_responses(): void
    {
        $formResponse = FormResponse::factory()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->worker->id,
        ]);

        $response = $this->actingAs($this->worker, 'sanctum')
            ->getJson('/api/v1/form-responses');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_form_responses(): void
    {
        $response = $this->getJson('/api/v1/form-responses');

        $response->assertStatus(401);
    }

    public function test_form_response_creation_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/form-responses', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['form_id', 'tenant_id', 'user_id', 'response_data']);
    }

    public function test_form_response_with_job(): void
    {
        $job = Job::factory()->create([
            'tenant_id' => $this->tenant->id,
        ]);

        $data = [
            'form_id' => $this->form->id,
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id,
            'job_id' => $job->id,
            'response_data' => [
                'feedback' => 'Job related feedback',
                'rating' => 4
            ],
            'is_submitted' => false,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/form-responses', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('form_responses', [
            'job_id' => $job->id,
        ]);
    }

    public function test_form_response_search_functionality(): void
    {
        FormResponse::factory()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/form-responses?search=' . $this->form->name);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_form_response_filtering_by_form(): void
    {
        $form2 = Form::factory()->create(['tenant_id' => $this->tenant->id]);

        FormResponse::factory()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        FormResponse::factory()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $form2->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/form-responses?form_id=' . $this->form->id);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_form_response_filtering_by_submission_status(): void
    {
        FormResponse::factory()->draft()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        FormResponse::factory()->submitted()->create([
            'tenant_id' => $this->tenant->id,
            'form_id' => $this->form->id,
            'user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/form-responses?is_submitted=true');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }
}
