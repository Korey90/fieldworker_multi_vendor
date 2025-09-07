<?php

namespace Tests\Feature\Api\V1;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $tenant;
    protected $admin;
    protected $manager;
    protected $worker;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create(['status' => 'active']);

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
        $this->admin = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->admin->roles()->attach($adminRole);

        $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->manager->roles()->attach($managerRole);

        $this->worker = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->worker->roles()->attach($workerRole);
    }

    public function test_admin_can_list_permissions(): void
    {
        Sanctum::actingAs($this->admin);

        Permission::factory()->usersView()->create();
        Permission::factory()->usersCreate()->create();
        Permission::factory()->adminSettings()->create();

        $response = $this->getJson('/api/v1/system/permissions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'permission_key',
                        'permission_group',
                        'is_active',
                        'created_at',
                        'updated_at',
                        'roles',
                        'roles_count',
                        'is_system_permission',
                        'is_tenant_permission',
                        'action'
                    ]
                ]
            ]);

        $this->assertGreaterThanOrEqual(3, count($response->json('data')));
    }

    public function test_manager_cannot_list_permissions(): void
    {
        Sanctum::actingAs($this->manager);

        Permission::factory()->usersView()->create();

        $response = $this->getJson('/api/v1/system/permissions');

        $response->assertStatus(403);
    }

    public function test_worker_cannot_access_permissions(): void
    {
        Sanctum::actingAs($this->worker);

        $response = $this->getJson('/api/v1/system/permissions');

        $response->assertStatus(403);
    }

    public function test_can_search_permissions(): void
    {
        Sanctum::actingAs($this->admin);

        Permission::factory()->usersView()->create();
        Permission::factory()->usersCreate()->create();
        Permission::factory()->adminSettings()->create();

        $response = $this->getJson('/api/v1/system/permissions?search=users');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        foreach ($permissions as $permission) {
            $this->assertTrue(
                str_contains(strtolower($permission['name']), 'users') ||
                str_contains(strtolower($permission['permission_key']), 'users')
            );
        }
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/system/permissions');

        $response->assertStatus(401);
    }

    public function test_can_filter_permissions_by_group(): void
    {
        Sanctum::actingAs($this->admin);

        Permission::factory()->usersView()->create();
        Permission::factory()->usersCreate()->create();
        Permission::factory()->adminSettings()->create();

        $response = $this->getJson('/api/v1/system/permissions?permission_group=users');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        foreach ($permissions as $permission) {
            $this->assertEquals('users', $permission['permission_group']);
        }
    }

    public function test_can_filter_permissions_by_status(): void
    {
        Sanctum::actingAs($this->admin);

        Permission::factory()->active()->create();
        Permission::factory()->active()->create();
        Permission::factory()->inactive()->create();

        $response = $this->getJson('/api/v1/system/permissions?is_active=true');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        foreach ($permissions as $permission) {
            $this->assertTrue($permission['is_active']);
        }

        $response = $this->getJson('/api/v1/system/permissions?is_active=false');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        foreach ($permissions as $permission) {
            $this->assertFalse($permission['is_active']);
        }
    }

    public function test_can_sort_permissions(): void
    {
        Sanctum::actingAs($this->admin);

        Permission::factory()->create(['permission_group' => 'zeta', 'name' => 'Z Permission']);
        Permission::factory()->create(['permission_group' => 'alpha', 'name' => 'A Permission']);
        Permission::factory()->create(['permission_group' => 'beta', 'name' => 'B Permission']);

        $response = $this->getJson('/api/v1/system/permissions?sort=permission_group&direction=asc');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        $this->assertEquals('alpha', $permissions[0]['permission_group']);

        $response = $this->getJson('/api/v1/system/permissions?sort=permission_group&direction=desc');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        $this->assertEquals('zeta', $permissions[0]['permission_group']);
    }

    public function test_permissions_include_computed_fields(): void
    {
        Sanctum::actingAs($this->admin);

        $systemPermission = Permission::factory()->create([
            'permission_key' => 'system.manage.all'
        ]);
        
        $tenantPermission = Permission::factory()->create([
            'permission_key' => 'tenant.manage.users'
        ]);

        $response = $this->getJson('/api/v1/system/permissions');

        $response->assertStatus(200);

        $permissions = $response->json('data');
        
        $systemPerm = collect($permissions)->firstWhere('id', $systemPermission->id);
        $tenantPerm = collect($permissions)->firstWhere('id', $tenantPermission->id);
        
        $this->assertTrue($systemPerm['is_system_permission']);
        $this->assertFalse($systemPerm['is_tenant_permission']);
        
        $this->assertFalse($tenantPerm['is_system_permission']);
        $this->assertTrue($tenantPerm['is_tenant_permission']);
        
        $this->assertArrayHasKey('action', $systemPerm);
        $this->assertArrayHasKey('action', $tenantPerm);
    }
}
