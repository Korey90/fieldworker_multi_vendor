<?php

namespace Tests\Feature\Api;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $manager;
    private User $worker;
    private Tenant $testTenant;

    protected function setUp(): void
    {
        parent::setUp();

        // Create tenant without sector dependency  
        $this->testTenant = Tenant::factory()->active()->create();

        // Create roles and permissions
        $adminRole = Role::factory()->create(['name' => 'admin', 'slug' => 'admin']);
        $managerRole = Role::factory()->create(['name' => 'manager', 'slug' => 'manager']);
        $workerRole = Role::factory()->create(['name' => 'worker', 'slug' => 'worker']);

        $tenantPermission = Permission::factory()->create([
            'key' => 'tenant.manage',
            'description' => 'Manage Tenants'
        ]);

        // Assign permission to admin role
        $adminRole->permissions()->attach($tenantPermission->id);

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

    public function test_admin_can_list_tenants()
    {
        Sanctum::actingAs($this->admin);

        // Create additional tenants
        $tenant2 = Tenant::factory()->create();

        $response = $this->getJson('/api/v1/tenants');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'sector',
                        'data',
                        'created_at',
                        'updated_at'
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);
    }

    public function test_admin_can_create_tenant()
    {
        Sanctum::actingAs($this->admin);

        $tenantData = [
            'name' => 'New Test Tenant',
            'sector' => 'construction',
            'data' => ['key' => 'value']
        ];

        $response = $this->postJson('/api/v1/tenants', $tenantData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Tenant created successfully',
                'data' => [
                    'name' => 'New Test Tenant',
                    'sector' => 'construction'
                ]
            ]);

        $this->assertDatabaseHas('tenants', [
            'name' => 'New Test Tenant',
            'sector' => 'construction'
        ]);
    }

    public function test_admin_can_view_tenant()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson("/api/v1/tenants/{$this->testTenant->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'sector',
                    'data',
                    'created_at',
                    'updated_at'
                ]
            ])
            ->assertJson([
                'data' => [
                    'id' => $this->testTenant->id,
                    'name' => $this->testTenant->name
                ]
            ]);
    }

    public function test_admin_can_update_tenant()
    {
        Sanctum::actingAs($this->admin);

        $updateData = [
            'name' => 'Updated Tenant Name',
            'sector' => 'healthcare'
        ];

        $response = $this->putJson("/api/v1/tenants/{$this->testTenant->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tenant updated successfully',
                'data' => [
                    'name' => 'Updated Tenant Name'
                ]
            ]);

        $this->assertDatabaseHas('tenants', [
            'id' => $this->testTenant->id,
            'name' => 'Updated Tenant Name',
            'sector' => 'healthcare'
        ]);
    }

    public function test_admin_cannot_delete_tenant_with_users()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->deleteJson("/api/v1/tenants/{$this->testTenant->id}");

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Cannot delete tenant with active users'
            ]);

        $this->assertDatabaseHas('tenants', [
            'id' => $this->testTenant->id
        ]);
    }

    public function test_admin_can_delete_empty_tenant()
    {
        Sanctum::actingAs($this->admin);

        // Create tenant without users
        $emptyTenant = Tenant::factory()->create();

        $response = $this->deleteJson("/api/v1/tenants/{$emptyTenant->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Tenant deleted successfully'
            ]);

        $this->assertSoftDeleted('tenants', [
            'id' => $emptyTenant->id
        ]);
    }

    public function test_admin_can_view_tenant_stats()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson("/api/v1/tenants/{$this->testTenant->id}/stats");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'users_count',
                    'workers_count',
                    'locations_count',
                    'assets_count'
                ]
            ]);
    }

    public function test_manager_cannot_access_tenant_management()
    {
        Sanctum::actingAs($this->manager);

        $response = $this->getJson('/api/v1/tenants');
        $response->assertStatus(403);

        $response = $this->postJson('/api/v1/tenants', [
            'name' => 'Test',
            'sector' => 'construction'
        ]);
        $response->assertStatus(403);
    }

    public function test_worker_cannot_access_tenant_management()
    {
        Sanctum::actingAs($this->worker);

        $response = $this->getJson('/api/v1/tenants');
        $response->assertStatus(403);

        $response = $this->postJson('/api/v1/tenants', [
            'name' => 'Test',
            'sector' => 'construction'
        ]);
        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_tenants()
    {
        $response = $this->getJson('/api/v1/tenants');
        $response->assertStatus(401);
    }

    public function test_tenant_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/tenants', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'sector']);
    }

    public function test_tenant_creation_validates_invalid_sector()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/tenants', [
            'name' => 'Test Tenant',
            'sector' => 'invalid_sector'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['sector']);
    }

    public function test_tenant_search_functionality()
    {
        Sanctum::actingAs($this->admin);

        // Create tenants with specific names
        $searchableTenant = Tenant::factory()->create([
            'name' => 'Searchable Tenant Name'
        ]);

        $response = $this->getJson('/api/v1/tenants?search=Searchable');

        $response->assertStatus(200);
        
        $responseData = $response->json('data');
        $this->assertNotEmpty($responseData);
        
        $found = collect($responseData)->contains(function ($tenant) use ($searchableTenant) {
            return $tenant['id'] === $searchableTenant->id;
        });
        
        $this->assertTrue($found, 'Searchable tenant should be found in results');
    }

    public function test_tenant_filtering_by_sector()
    {
        Sanctum::actingAs($this->admin);

        // Create tenant with different sector
        $tenant2 = Tenant::factory()->create([
            'sector' => 'healthcare'
        ]);

        $response = $this->getJson("/api/v1/tenants?sector={$this->testTenant->sector}");

        $response->assertStatus(200);
        
        $responseData = $response->json('data');
        
        // All tenants should belong to the filtered sector
        foreach ($responseData as $tenant) {
            $this->assertEquals($this->testTenant->sector, $tenant['sector']);
        }
    }
}
