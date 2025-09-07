<?php

namespace Tests\Feature\Api\V1;

use App\Models\Certification;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Worker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CertificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $admin;
    protected $manager;
    protected $worker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create tenant
        $this->tenant = Tenant::factory()->active()->create();

        // Create roles
        $adminRole = Role::factory()->create([
            'name' => 'admin',
            'slug' => 'admin',
            'tenant_id' => $this->tenant->id
        ]);
        
        $managerRole = Role::factory()->create([
            'name' => 'manager', 
            'slug' => 'manager',
            'tenant_id' => $this->tenant->id
        ]);
        
        $workerRole = Role::factory()->create([
            'name' => 'worker',
            'slug' => 'worker', 
            'tenant_id' => $this->tenant->id
        ]);

        // Create users
        $this->admin = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => 'admin@test.com'
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->manager = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => 'manager@test.com'
        ]);
        $this->manager->roles()->attach($managerRole);

        $this->worker = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => 'worker@test.com'
        ]);
        $this->worker->roles()->attach($workerRole);
    }

    public function test_admin_can_list_certifications()
    {
        Sanctum::actingAs($this->admin);
        
        Certification::factory(3)->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson('/api/v1/certifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'issuing_authority',
                        'validity_period_months',
                        'is_active',
                        'tenant_id',
                        'created_at'
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_manager_can_list_certifications()
    {
        Sanctum::actingAs($this->manager);
        
        Certification::factory(2)->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson('/api/v1/certifications');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_worker_cannot_access_certifications()
    {
        Sanctum::actingAs($this->worker);

        $response = $this->getJson('/api/v1/certifications');

        $response->assertStatus(403);
    }

    public function test_can_show_single_certification()
    {
        Sanctum::actingAs($this->admin);
        
        $certification = Certification::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson("/api/v1/certifications/{$certification->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'issuing_authority',
                    'validity_period_months',
                    'is_active',
                    'tenant_id',
                    'created_at'
                ]
            ])
            ->assertJson([
                'data' => [
                    'id' => $certification->id,
                    'name' => $certification->name
                ]
            ]);
    }

    public function test_cannot_show_certification_from_different_tenant()
    {
        Sanctum::actingAs($this->admin);
        
        $otherTenant = Tenant::factory()->active()->create();
        $certification = Certification::factory()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->getJson("/api/v1/certifications/{$certification->id}");

        $response->assertStatus(404);
    }

    public function test_can_create_certification()
    {
        Sanctum::actingAs($this->admin);
        
        $certificationData = [
            'name' => 'First Aid Certification',
            'description' => 'Basic first aid training',
            'authority' => 'Red Cross',
            'validity_period_months' => 24,
            'is_active' => true
        ];

        $response = $this->postJson('/api/v1/certifications', $certificationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'description',
                    'issuing_authority',
                    'validity_period_months',
                    'is_active',
                    'tenant_id',
                    'created_at'
                ]
            ])
            ->assertJson([
                'message' => 'Certification created successfully',
                'data' => [
                    'name' => 'First Aid Certification',
                    'description' => 'Basic first aid training',
                    'issuing_authority' => 'Red Cross',
                    'validity_period_months' => 24,
                    'is_active' => true,
                    'tenant_id' => $this->tenant->id
                ]
            ]);

        $this->assertDatabaseHas('certifications', [
            'name' => 'First Aid Certification',
            'description' => 'Basic first aid training',
            'authority' => 'Red Cross',
            'validity_period_months' => 24,
            'is_active' => true,
            'tenant_id' => $this->tenant->id
        ]);
    }

    public function test_can_update_certification()
    {
        Sanctum::actingAs($this->admin);
        
        $certification = Certification::factory()->create(['tenant_id' => $this->tenant->id]);
        
        $updateData = [
            'name' => 'Updated Certification Name',
            'description' => 'Updated description',
            'authority' => 'Updated Authority',
            'validity_period_months' => 36,
            'is_active' => false
        ];

        $response = $this->putJson("/api/v1/certifications/{$certification->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'name',
                    'description',
                    'issuing_authority',
                    'validity_period_months',
                    'is_active',
                    'tenant_id'
                ]
            ])
            ->assertJson([
                'message' => 'Certification updated successfully',
                'data' => [
                    'id' => $certification->id,
                    'name' => 'Updated Certification Name',
                    'description' => 'Updated description',
                    'issuing_authority' => 'Updated Authority',
                    'validity_period_months' => 36,
                    'is_active' => false
                ]
            ]);

        $this->assertDatabaseHas('certifications', [
            'id' => $certification->id,
            'name' => 'Updated Certification Name',
            'description' => 'Updated description',
            'authority' => 'Updated Authority',
            'validity_period_months' => 36,
            'is_active' => false
        ]);
    }

    public function test_admin_can_delete_certification()
    {
        Sanctum::actingAs($this->admin);
        
        $certification = Certification::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->deleteJson("/api/v1/certifications/{$certification->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Certification deleted successfully'
            ]);

        $this->assertDatabaseMissing('certifications', [
            'id' => $certification->id
        ]);
    }

    public function test_manager_cannot_delete_certification()
    {
        Sanctum::actingAs($this->manager);
        
        $certification = Certification::factory()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->deleteJson("/api/v1/certifications/{$certification->id}");

        $response->assertStatus(403);
    }

    public function test_cannot_delete_certification_assigned_to_workers()
    {
        Sanctum::actingAs($this->admin);
        
        $certification = Certification::factory()->create(['tenant_id' => $this->tenant->id]);
        $worker = Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Assign certification to worker
        $certification->workers()->attach($worker->id, [
            'issued_at' => now(),
            'expires_at' => now()->addMonths(12)
        ]);

        $response = $this->deleteJson("/api/v1/certifications/{$certification->id}");

        $response->assertStatus(422)
            ->assertJsonStructure([
                'error',
                'workers_count'
            ])
            ->assertJson([
                'error' => 'Cannot delete certification that is assigned to workers',
                'workers_count' => 1
            ]);

        $this->assertDatabaseHas('certifications', [
            'id' => $certification->id
        ]);
    }

    public function test_can_get_certification_statistics()
    {
        Sanctum::actingAs($this->admin);
        
        // Create specific certifications to ensure predictable statistics
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
            'validity_period_months' => 12
        ]);
        
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
            'validity_period_months' => 24
        ]);
        
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => false,
            'validity_period_months' => 36
        ]);
        
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'is_active' => true,
            'validity_period_months' => null  // permanent
        ]);

        $response = $this->getJson('/api/v1/certifications/stats/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_certifications',
                'active_certifications',
                'inactive_certifications',
                'permanent_certifications',
                'renewable_certifications',
                'authorities_breakdown',
                'validity_breakdown'
            ])
            ->assertJson([
                'total_certifications' => 4,
                'active_certifications' => 3,
                'inactive_certifications' => 1,
                'permanent_certifications' => 1,
                'renewable_certifications' => 3
            ]);
    }

    public function test_can_get_certification_workers()
    {
        Sanctum::actingAs($this->admin);
        
        $certification = Certification::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Create user and worker with proper relationships
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $user->id
        ]);
        
        // Assign certification to worker
        $certification->workers()->attach($worker->id, [
            'issued_at' => now()->subMonths(6),
            'expires_at' => now()->addMonths(6)
        ]);

        $response = $this->getJson("/api/v1/certifications/{$certification->id}/workers");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'certification' => [
                    'id',
                    'name'
                ],
                'workers' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'issued_at',
                        'expires_at',
                        'is_expired'
                    ]
                ]
            ]);

        $this->assertCount(1, $response->json('workers'));
    }

    public function test_can_search_certifications()
    {
        Sanctum::actingAs($this->admin);
        
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'First Aid Training',
            'authority' => 'Red Cross'
        ]);
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Safety Certification',
            'authority' => 'OSHA'
        ]);

        $response = $this->getJson('/api/v1/certifications?search=First Aid');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertEquals('First Aid Training', $data[0]['name']);
    }

    public function test_can_filter_certifications_by_authority()
    {
        Sanctum::actingAs($this->admin);
        
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'authority' => 'Red Cross'
        ]);
        Certification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'authority' => 'OSHA'
        ]);

        $response = $this->getJson('/api/v1/certifications?authority=Red Cross');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertEquals('Red Cross', $data[0]['issuing_authority']);
    }

    public function test_can_filter_certifications_by_status()
    {
        Sanctum::actingAs($this->admin);
        
        Certification::factory()->active()->create(['tenant_id' => $this->tenant->id]);
        Certification::factory()->inactive()->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson('/api/v1/certifications?is_active=true');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertTrue($data[0]['is_active']);
    }

    public function test_validates_required_fields_on_create()
    {
        Sanctum::actingAs($this->admin);
        
        $response = $this->postJson('/api/v1/certifications', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_validates_validity_period_range()
    {
        Sanctum::actingAs($this->admin);
        
        $response = $this->postJson('/api/v1/certifications', [
            'name' => 'Test Certification',
            'validity_period_months' => 150 // Over 120 months limit
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['validity_period_months']);
    }

    public function test_requires_authentication()
    {
        $response = $this->getJson('/api/v1/certifications');

        $response->assertStatus(401);
    }

    public function test_lists_only_tenant_certifications()
    {
        Sanctum::actingAs($this->admin);
        
        // Create certifications for current tenant
        Certification::factory(2)->create(['tenant_id' => $this->tenant->id]);

        // Create certifications for other tenant
        $otherTenant = Tenant::factory()->active()->create();
        Certification::factory(3)->create(['tenant_id' => $otherTenant->id]);

        $response = $this->getJson('/api/v1/certifications');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        // Should only see certifications from own tenant
        $this->assertCount(2, $data);
        foreach ($data as $certification) {
            $this->assertEquals($this->tenant->id, $certification['tenant_id']);
        }
    }
}
