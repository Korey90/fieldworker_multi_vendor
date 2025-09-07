<?php

namespace Tests\Feature\Api\V1\System;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Response;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $tenant;
    protected $role;
    protected $permissions;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->active()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Create admin role and assign to user for middleware
        $adminRole = Role::factory()->admin()->create([
            'tenant_id' => $this->tenant->id,
            'slug' => 'admin'
        ]);
        $this->user->roles()->attach($adminRole);
        
        $this->role = Role::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->permissions = Permission::factory()->count(3)->create();
        
        $this->actingAs($this->user, 'sanctum');
    }

    public function test_can_list_roles()
    {
        // Create additional roles for same tenant
        Role::factory()->count(2)->create(['tenant_id' => $this->tenant->id]);
        
        // Create role for different tenant (should not appear)
        $otherTenant = Tenant::factory()->create();
        Role::factory()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->getJson('/api/v1/system/roles');

        $response->assertStatus(Response::HTTP_OK)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'description',
                            'slug',
                            'tenant_id',
                            'permissions'
                        ]
                    ]
                ]);

        // Should only show roles for current tenant (admin + this->role + 2 additional = 4)
        $this->assertCount(4, $response->json('data'));
    }

    public function test_can_create_role()
    {
        $roleData = [
            'name' => 'Test Role',
            'description' => 'Test role description',
            'permissions' => $this->permissions->pluck('id')->toArray()
        ];

        $response = $this->postJson('/api/v1/system/roles', $roleData);

        $response->assertStatus(Response::HTTP_CREATED)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'slug',
                        'tenant_id',
                        'permissions'
                    ]
                ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'Test Role',
            'description' => 'Test role description',
            'tenant_id' => $this->tenant->id,
            'slug' => 'test-role'
        ]);

        // Check permissions are attached
        $role = Role::where('name', 'Test Role')->first();
        $this->assertCount(3, $role->permissions);
    }

    public function test_can_show_role()
    {
        $this->role->permissions()->attach($this->permissions);

        $response = $this->getJson("/api/v1/system/roles/{$this->role->id}");

        $response->assertStatus(Response::HTTP_OK)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'slug',
                        'tenant_id',
                        'permissions'
                    ]
                ]);

        $this->assertEquals($this->role->id, $response->json('data.id'));
        $this->assertCount(3, $response->json('data.permissions'));
    }

    public function test_cannot_show_role_from_different_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherRole = Role::factory()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->getJson("/api/v1/system/roles/{$otherRole->id}");

        $response->assertStatus(Response::HTTP_NOT_FOUND);
    }

    public function test_can_update_role()
    {
        $updateData = [
            'name' => 'Updated Role Name',
            'description' => 'Updated description',
            'permissions' => $this->permissions->take(2)->pluck('id')->toArray()
        ];

        $response = $this->putJson("/api/v1/system/roles/{$this->role->id}", $updateData);

        $response->assertStatus(Response::HTTP_OK)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'slug',
                        'tenant_id',
                        'permissions'
                    ]
                ]);

        $this->assertDatabaseHas('roles', [
            'id' => $this->role->id,
            'name' => 'Updated Role Name',
            'description' => 'Updated description',
            'slug' => 'updated-role-name'
        ]);

        // Check permissions are updated
        $this->role->refresh();
        $this->assertCount(2, $this->role->permissions);
    }

    public function test_cannot_update_role_from_different_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherRole = Role::factory()->create(['tenant_id' => $otherTenant->id]);

        $updateData = [
            'name' => 'Updated Role Name',
            'description' => 'Updated description'
        ];

        $response = $this->putJson("/api/v1/system/roles/{$otherRole->id}", $updateData);

        $response->assertStatus(Response::HTTP_NOT_FOUND);
    }

    public function test_can_delete_role()
    {
        $roleId = $this->role->id;

        $response = $this->deleteJson("/api/v1/system/roles/{$roleId}");

        $response->assertStatus(Response::HTTP_NO_CONTENT);

        $this->assertDatabaseMissing('roles', [
            'id' => $roleId
        ]);
    }

    public function test_cannot_delete_role_from_different_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherRole = Role::factory()->create(['tenant_id' => $otherTenant->id]);

        $response = $this->deleteJson("/api/v1/system/roles/{$otherRole->id}");

        $response->assertStatus(Response::HTTP_NOT_FOUND);

        $this->assertDatabaseHas('roles', [
            'id' => $otherRole->id
        ]);
    }

    public function test_can_assign_permission_to_role()
    {
        $permission = $this->permissions->first();

        $response = $this->postJson("/api/v1/system/roles/{$this->role->id}/permissions/{$permission->id}");

        $response->assertStatus(Response::HTTP_OK)
                ->assertJson([
                    'message' => 'Permission assigned successfully'
                ]);

        $this->assertTrue($this->role->permissions()->where('permission_id', $permission->id)->exists());
    }

    public function test_cannot_assign_permission_to_role_from_different_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherRole = Role::factory()->create(['tenant_id' => $otherTenant->id]);
        $permission = $this->permissions->first();

        $response = $this->postJson("/api/v1/system/roles/{$otherRole->id}/permissions/{$permission->id}");

        $response->assertStatus(Response::HTTP_NOT_FOUND);
    }

    public function test_can_remove_permission_from_role()
    {
        $permission = $this->permissions->first();
        $this->role->permissions()->attach($permission);

        $response = $this->deleteJson("/api/v1/system/roles/{$this->role->id}/permissions/{$permission->id}");

        $response->assertStatus(Response::HTTP_OK)
                ->assertJson([
                    'message' => 'Permission removed successfully'
                ]);

        $this->assertFalse($this->role->permissions()->where('permission_id', $permission->id)->exists());
    }

    public function test_can_list_role_permissions()
    {
        $this->role->permissions()->attach($this->permissions);

        $response = $this->getJson("/api/v1/system/roles/{$this->role->id}/permissions");

        $response->assertStatus(Response::HTTP_OK)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'description',
                            'permission_key',
                            'permission_group',
                            'is_active'
                        ]
                    ]
                ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_validates_required_fields_on_create()
    {
        $response = $this->postJson('/api/v1/system/roles', []);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
                ->assertJsonValidationErrors(['name']);
    }

    public function test_validates_unique_name_per_tenant_on_create()
    {
        $existingRole = Role::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Existing Role'
        ]);

        $response = $this->postJson('/api/v1/system/roles', [
            'name' => 'Existing Role',
            'description' => 'Test description'
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
                ->assertJsonValidationErrors(['name']);
    }

    public function test_allows_same_name_across_different_tenants()
    {
        $otherTenant = Tenant::factory()->create();
        Role::factory()->create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Same Name Role'
        ]);

        $response = $this->postJson('/api/v1/system/roles', [
            'name' => 'Same Name Role',
            'description' => 'Test description'
        ]);

        $response->assertStatus(Response::HTTP_CREATED);
    }

    public function test_validates_permissions_array_on_create()
    {
        $response = $this->postJson('/api/v1/system/roles', [
            'name' => 'Test Role',
            'description' => 'Test description',
            'permissions' => 'invalid'
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
                ->assertJsonValidationErrors(['permissions']);
    }

    public function test_validates_permission_existence_on_create()
    {
        $response = $this->postJson('/api/v1/system/roles', [
            'name' => 'Test Role',
            'description' => 'Test description',
            'permissions' => [999, 1000]
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
                ->assertJsonValidationErrors(['permissions.0', 'permissions.1']);
    }

    public function test_validates_unique_name_per_tenant_on_update()
    {
        $existingRole = Role::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Existing Role'
        ]);

        $response = $this->putJson("/api/v1/system/roles/{$this->role->id}", [
            'name' => 'Existing Role',
            'description' => 'Updated description'
        ]);

        $response->assertStatus(Response::HTTP_UNPROCESSABLE_ENTITY)
                ->assertJsonValidationErrors(['name']);
    }

    public function test_can_update_role_with_same_name()
    {
        $response = $this->putJson("/api/v1/system/roles/{$this->role->id}", [
            'name' => $this->role->name,
            'description' => 'Updated description'
        ]);

        $response->assertStatus(Response::HTTP_OK);
    }

    public function test_role_has_correct_slug_generation()
    {
        $response = $this->postJson('/api/v1/system/roles', [
            'name' => 'Test Role With Spaces',
            'description' => 'Test description'
        ]);

        $response->assertStatus(Response::HTTP_CREATED);

        $this->assertDatabaseHas('roles', [
            'name' => 'Test Role With Spaces',
            'slug' => 'test-role-with-spaces'
        ]);
    }

    public function test_role_includes_permissions_in_response()
    {
        $this->role->permissions()->attach($this->permissions->take(2));

        $response = $this->getJson("/api/v1/system/roles/{$this->role->id}");

        $response->assertStatus(Response::HTTP_OK);
        
        $responseData = $response->json('data');
        $this->assertArrayHasKey('permissions', $responseData);
        $this->assertCount(2, $responseData['permissions']);
        
        foreach ($responseData['permissions'] as $permission) {
            $this->assertArrayHasKey('id', $permission);
            $this->assertArrayHasKey('name', $permission);
            $this->assertArrayHasKey('permission_key', $permission);
        }
    }

    public function test_handles_non_existent_role()
    {
        $response = $this->getJson('/api/v1/system/roles/999');

        $response->assertStatus(Response::HTTP_NOT_FOUND);
    }

    public function test_handles_non_existent_permission_assignment()
    {
        $response = $this->postJson("/api/v1/system/roles/{$this->role->id}/permissions/999");

        $response->assertStatus(Response::HTTP_NOT_FOUND);
    }

    public function test_handles_removing_non_assigned_permission()
    {
        $permission = $this->permissions->first();
        
        $response = $this->deleteJson("/api/v1/system/roles/{$this->role->id}/permissions/{$permission->id}");

        $response->assertStatus(Response::HTTP_OK)
                ->assertJson([
                    'message' => 'Permission removed successfully'
                ]);
    }

    public function test_prevents_duplicate_permission_assignment()
    {
        $permission = $this->permissions->first();
        $this->role->permissions()->attach($permission);

        $response = $this->postJson("/api/v1/system/roles/{$this->role->id}/permissions/{$permission->id}");

        $response->assertStatus(Response::HTTP_OK)
                ->assertJson([
                    'message' => 'Permission assigned successfully'
                ]);

        // Should still have only one instance
        $this->assertEquals(1, $this->role->permissions()->where('permission_id', $permission->id)->count());
    }
}
