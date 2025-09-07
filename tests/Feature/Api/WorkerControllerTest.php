<?php

namespace Tests\Feature\Api;

use App\Models\Worker;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Skill;
use App\Models\Certification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkerControllerTest extends TestCase
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

        $workerPermission = Permission::factory()->create([
            'key' => 'worker.manage',
            'description' => 'Manage Workers'
        ]);

        // Assign permission to admin and manager roles
        $adminRole->permissions()->attach($workerPermission->id);
        $managerRole->permissions()->attach($workerPermission->id);

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

    public function test_admin_can_list_workers()
    {
        Sanctum::actingAs($this->admin);

        // Create workers
        $workerUser1 = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $workerUser2 = User::factory()->create(['tenant_id' => $this->testTenant->id]);

        $worker1 = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser1->id
        ]);
        $worker2 = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser2->id
        ]);

        $response = $this->getJson('/api/v1/workers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'employee_number',
                        'status',
                        'data',
                        'user',
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

    public function test_admin_can_create_worker()
    {
        Sanctum::actingAs($this->admin);

        $workerUser = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $workerData = [
            'user_id' => $workerUser->id,
            'tenant_id' => $this->testTenant->id,
            'employee_number' => 'EMP001',
            'job_title' => 'Construction Worker',
            'hire_date' => '2024-01-01',
            'status' => 'active',
            'hourly_rate' => 25.50,
            'data' => [
                'department' => 'Construction',
                'supervisor' => 'Jane Smith',
                'emergency_contact' => [
                    'name' => 'John Doe',
                    'phone' => '123-456-7890',
                    'relationship' => 'spouse'
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/workers', $workerData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Worker created successfully'
            ])
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'employee_number',
                    'status'
                ]
            ]);

        $this->assertDatabaseHas('workers', [
            'employee_number' => 'EMP001',
            'tenant_id' => $this->testTenant->id
        ]);
    }

    public function test_admin_can_view_worker()
    {
        Sanctum::actingAs($this->admin);

        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id
        ]);

        $response = $this->getJson("/api/v1/workers/{$worker->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'employee_number',
                    'status',
                    'user',
                    'tenant'
                ]
            ]);
    }

    public function test_admin_can_update_worker()
    {
        Sanctum::actingAs($this->admin);

        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id,
            'status' => 'active'
        ]);

        $updateData = [
            'status' => 'inactive',
            'hourly_rate' => 30.00,
            'data' => [
                'job_title' => 'Senior Construction Worker'
            ]
        ];

        $response = $this->putJson("/api/v1/workers/{$worker->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Worker updated successfully'
            ]);

        $this->assertDatabaseHas('workers', [
            'id' => $worker->id,
            'status' => 'inactive'
        ]);
    }

    public function test_admin_can_delete_inactive_worker()
    {
        Sanctum::actingAs($this->admin);

        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id,
            'status' => 'inactive'
        ]);

        $response = $this->deleteJson("/api/v1/workers/{$worker->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Worker deleted successfully'
            ]);

        $this->assertSoftDeleted('workers', [
            'id' => $worker->id
        ]);
    }

    public function test_admin_can_delete_worker_without_active_assignments()
    {
        Sanctum::actingAs($this->admin);

        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id,
            'status' => 'active'
        ]);

        $response = $this->deleteJson("/api/v1/workers/{$worker->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Worker deleted successfully'
            ]);

        $this->assertSoftDeleted('workers', [
            'id' => $worker->id
        ]);
    }

    public function test_admin_can_get_worker_stats()
    {
        Sanctum::actingAs($this->admin);

        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id
        ]);

        $response = $this->getJson("/api/v1/workers/{$worker->id}/stats");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_jobs',
                    'completed_jobs',
                    'active_jobs',
                    'pending_jobs',
                    'skills_count',
                    'certifications_count',
                    'years_of_service'
                ]
            ]);
    }

    public function test_admin_can_get_available_workers()
    {
        Sanctum::actingAs($this->admin);

        $workerUser1 = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $workerUser2 = User::factory()->create(['tenant_id' => $this->testTenant->id]);

        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser1->id,
            'status' => 'active'
        ]);
        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser2->id,
            'status' => 'inactive'
        ]);

        $response = $this->getJson('/api/v1/workers/available');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'employee_number',
                        'status',
                        'user'
                    ]
                ]
            ]);

        // Should only return active workers
        $workers = $response->json('data');
        foreach ($workers as $worker) {
            $this->assertEquals('active', $worker['status']);
        }
    }

    public function test_manager_can_access_worker_management()
    {
        Sanctum::actingAs($this->manager);

        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $worker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id
        ]);

        $response = $this->getJson('/api/v1/workers');
        $response->assertStatus(200);

        $response = $this->getJson("/api/v1/workers/{$worker->id}");
        $response->assertStatus(200);
    }

    public function test_worker_cannot_create_workers()
    {
        Sanctum::actingAs($this->worker);

        $workerData = [
            'employee_number' => 'EMP001',
            'job_title' => 'Construction Worker'
        ];

        $response = $this->postJson('/api/v1/workers', $workerData);
        $response->assertStatus(403);
    }

    public function test_worker_can_view_workers_list()
    {
        Sanctum::actingAs($this->worker);

        $response = $this->getJson('/api/v1/workers');
        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_workers()
    {
        $response = $this->getJson('/api/v1/workers');
        $response->assertStatus(401);
    }

    public function test_worker_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/workers', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'user_id',
                'tenant_id',
                'employee_number',
                'job_title'
            ]);
    }

    public function test_worker_search_functionality()
    {
        Sanctum::actingAs($this->admin);

        $workerUser1 = User::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'John Searchable'
        ]);
        $workerUser2 = User::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'name' => 'Jane Normal'
        ]);

        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser1->id,
            'employee_number' => 'SEARCH001'
        ]);
        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser2->id,
            'employee_number' => 'NORMAL001'
        ]);

        $response = $this->getJson('/api/v1/workers?search=Searchable');

        $response->assertStatus(200);

        $responseData = $response->json('data');
        $this->assertNotEmpty($responseData);
        $this->assertStringContainsString('Searchable', $responseData[0]['user']['name']);
    }

    public function test_worker_filtering_by_status()
    {
        Sanctum::actingAs($this->admin);

        $workerUser1 = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $workerUser2 = User::factory()->create(['tenant_id' => $this->testTenant->id]);

        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser1->id,
            'status' => 'active'
        ]);
        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser2->id,
            'status' => 'inactive'
        ]);

        $response = $this->getJson('/api/v1/workers?status=active');

        $response->assertStatus(200);

        $responseData = $response->json('data');

        // All workers should have active status
        foreach ($responseData as $worker) {
            $this->assertEquals('active', $worker['status']);
        }
    }

    public function test_worker_tenant_isolation()
    {
        Sanctum::actingAs($this->admin);

        // Create worker in different tenant
        $otherTenant = Tenant::factory()->active()->create();
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        Worker::factory()->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherUser->id
        ]);

        // Create worker in current tenant
        $workerUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $workerUser->id
        ]);

        $response = $this->getJson('/api/v1/workers');

        $response->assertStatus(200);

        $responseData = $response->json('data');

        // Should only see workers from current tenant
        $this->assertCount(1, $responseData);
        $this->assertEquals($this->testTenant->id, $responseData[0]['tenant']['id']);
    }
}
