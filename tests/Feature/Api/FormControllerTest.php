<?php

namespace Tests\Feature\Api;

use App\Models\Form;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Role;
use App\Models\Permission;
use App\Models\FormResponse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FormControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $manager;
    private User $worker;
    private Tenant $testTenant;

    protected function setUp(): void
    {
        parent::setUp();

        // Create active tenant
        $this->testTenant = Tenant::factory()->active()->create();

        // Create roles and permissions
        $adminRole = Role::factory()->create(['name' => 'admin', 'slug' => 'admin']);
        $managerRole = Role::factory()->create(['name' => 'manager', 'slug' => 'manager']);
        $workerRole = Role::factory()->create(['name' => 'worker', 'slug' => 'worker']);

        $formPermission = Permission::factory()->create([
            'key' => 'form.manage',
            'description' => 'Manage Forms'
        ]);

        // Assign permission to admin, manager, and worker roles
        $adminRole->permissions()->attach($formPermission->id);
        $managerRole->permissions()->attach($formPermission->id);
        $workerRole->permissions()->attach($formPermission->id);

        // Create users
        $this->admin = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $this->admin->roles()->attach($adminRole->id);

        $this->manager = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $this->manager->roles()->attach($managerRole->id);

        $this->worker = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $this->worker->roles()->attach($workerRole->id);
    }

    public function test_admin_can_list_forms()
    {
        Sanctum::actingAs($this->admin);

        // Create forms within the same test
        Form::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Job Assignment Form',
            'type' => 'job'
        ]);
        Form::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Safety Inspection Form',
            'type' => 'inspection'
        ]);

        $response = $this->getJson('/api/v1/forms');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'type',
                        'schema',
                        'tenant'
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_create_form()
    {
        Sanctum::actingAs($this->admin);

        $formData = [
            'name' => 'Custom Job Form',
            'tenant_id' => $this->testTenant->id,
            'type' => 'job',
            'schema' => [
                'fields' => [
                    [
                        'id' => 'worker_name',
                        'type' => 'text',
                        'label' => 'Worker Name',
                        'required' => true,
                        'placeholder' => 'Enter worker name'
                    ],
                    [
                        'id' => 'job_location',
                        'type' => 'select',
                        'label' => 'Job Location',
                        'required' => true,
                        'options' => [
                            ['value' => 'warehouse', 'label' => 'Warehouse'],
                            ['value' => 'office', 'label' => 'Office'],
                            ['value' => 'field', 'label' => 'Field Work']
                        ]
                    ]
                ],
                'settings' => [
                    'theme' => 'default',
                    'submit_button_text' => 'Submit Job Form'
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/forms', $formData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Form created successfully'
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'type',
                    'schema'
                ]
            ]);

        $this->assertDatabaseHas('forms', [
            'name' => 'Custom Job Form',
            'tenant_id' => $this->testTenant->id,
            'type' => 'job'
        ]);
    }

    public function test_admin_can_view_form()
    {
        Sanctum::actingAs($this->admin);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson("/api/v1/forms/{$form->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'type',
                    'schema',
                    'tenant'
                ]
            ]);
    }

    public function test_admin_can_update_form()
    {
        Sanctum::actingAs($this->admin);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Original Form'
        ]);

        $updateData = [
            'name' => 'Updated Form Name',
            'type' => 'inspection',
            'schema' => [
                'fields' => [
                    [
                        'id' => 'inspector',
                        'type' => 'text',
                        'label' => 'Inspector Name',
                        'required' => true
                    ]
                ]
            ]
        ];

        $response = $this->putJson("/api/v1/forms/{$form->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Form updated successfully'
            ]);

        $this->assertDatabaseHas('forms', [
            'id' => $form->id,
            'name' => 'Updated Form Name',
            'type' => 'inspection'
        ]);
    }

    public function test_admin_can_delete_form()
    {
        Sanctum::actingAs($this->admin);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->deleteJson("/api/v1/forms/{$form->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Form deleted successfully'
            ]);

        $this->assertSoftDeleted('forms', [
            'id' => $form->id
        ]);
    }

    public function test_admin_can_get_form_responses()
    {
        Sanctum::actingAs($this->admin);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        // We'll assume FormResponse exists and has factory
        // For now, we'll test the endpoint structure
        $response = $this->getJson("/api/v1/forms/{$form->id}/responses");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);
    }

    public function test_admin_can_duplicate_form()
    {
        Sanctum::actingAs($this->admin);

        $originalForm = Form::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Original Form'
        ]);

        $duplicateData = [
            'name' => 'Duplicated Form'
        ];

        $response = $this->postJson("/api/v1/forms/{$originalForm->id}/duplicate", $duplicateData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Form duplicated successfully'
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'type',
                    'schema'
                ]
            ]);

        $this->assertDatabaseHas('forms', [
            'name' => 'Duplicated Form',
            'tenant_id' => $this->testTenant->id,
            'type' => $originalForm->type
        ]);

        // Verify we have 2 forms now
        $this->assertEquals(2, Form::where('tenant_id', $this->testTenant->id)->count());
    }

    public function test_admin_can_get_form_stats()
    {
        Sanctum::actingAs($this->admin);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson("/api/v1/forms/{$form->id}/stats");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'form_id',
                    'total_responses',
                    'recent_responses',
                    'fields_count',
                    'response_rate'
                ]
            ]);
    }

    public function test_manager_can_access_form_management()
    {
        Sanctum::actingAs($this->manager);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson('/api/v1/forms');
        $response->assertStatus(200);

        $response = $this->getJson("/api/v1/forms/{$form->id}");
        $response->assertStatus(200);
    }

    public function test_worker_can_access_forms()
    {
        Sanctum::actingAs($this->worker);

        $form = Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson('/api/v1/forms');
        $response->assertStatus(200);

        $response = $this->getJson("/api/v1/forms/{$form->id}");
        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_forms()
    {
        $response = $this->getJson('/api/v1/forms');
        $response->assertStatus(401);
    }

    public function test_form_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/forms', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'tenant_id',
                'type',
                'schema'
            ]);
    }

    public function test_form_creation_validates_schema_structure()
    {
        Sanctum::actingAs($this->admin);

        $invalidFormData = [
            'name' => 'Test Form',
            'tenant_id' => $this->testTenant->id,
            'type' => 'job',
            'schema' => [
                'fields' => [
                    [
                        // Missing required 'id' and 'label'
                        'type' => 'text',
                        'required' => true
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/forms', $invalidFormData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'schema.fields.0.id',
                'schema.fields.0.label'
            ]);
    }

    public function test_form_search_functionality()
    {
        Sanctum::actingAs($this->admin);

        Form::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Searchable Job Form'
        ]);
        Form::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Regular Form'
        ]);

        $response = $this->getJson('/api/v1/forms?search=Searchable');

        $response->assertStatus(200);

        $responseData = $response->json('data');
        $this->assertNotEmpty($responseData);
        $this->assertStringContainsString('Searchable', $responseData[0]['name']);
    }

    public function test_form_filtering_by_type()
    {
        Sanctum::actingAs($this->admin);

        Form::factory()->job()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        Form::factory()->inspection()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson('/api/v1/forms?form_type=job');

        $response->assertStatus(200);

        $responseData = $response->json('data');

        // All forms should have job type
        foreach ($responseData as $form) {
            $this->assertEquals('job', $form['type']);
        }
    }

    public function test_form_tenant_isolation()
    {
        Sanctum::actingAs($this->admin);

        // Create form in different tenant
        $otherTenant = Tenant::factory()->active()->create();
        Form::factory()->create([
            'tenant_id' => $otherTenant->id
        ]);

        // Create form in current tenant
        Form::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson('/api/v1/forms');

        $response->assertStatus(200);

        $responseData = $response->json('data');

        // Should only see forms from current tenant
        $this->assertCount(1, $responseData);
        $this->assertEquals($this->testTenant->id, $responseData[0]['tenant']['id']);
    }
}
