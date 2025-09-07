<?php

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    private User $adminUser;
    private User $managerUser;
    private User $workerUser;
    private Role $adminRole;
    private Role $managerRole;
    private Role $workerRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Use existing roles from TestCase
        $this->adminRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'admin')->first();
        $this->managerRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'manager')->first();
        $this->workerRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'worker')->first();

        // Create or find existing permissions (global, no tenant_id)
        $viewUsersPermission = Permission::firstOrCreate(
            ['key' => 'users.view'],
            [
                'name' => 'Users View',
                'permission_key' => 'users.view',
                'permission_group' => 'users',
                'description' => 'Permission to view users', 
                'slug' => 'users.view',
                'is_active' => true
            ]
        );
        $createUsersPermission = Permission::firstOrCreate(
            ['key' => 'users.create'],
            [
                'name' => 'Users Create',
                'permission_key' => 'users.create',
                'permission_group' => 'users',
                'description' => 'Permission to create users', 
                'slug' => 'users.create',
                'is_active' => true
            ]
        );
        $editUsersPermission = Permission::firstOrCreate(
            ['key' => 'users.edit'],
            [
                'name' => 'Users Edit',
                'permission_key' => 'users.edit',
                'permission_group' => 'users',
                'description' => 'Permission to edit users', 
                'slug' => 'users.edit',
                'is_active' => true
            ]
        );
        $deleteUsersPermission = Permission::firstOrCreate(
            ['key' => 'users.delete'],
            [
                'name' => 'Users Delete',
                'permission_key' => 'users.delete',
                'permission_group' => 'users',
                'description' => 'Permission to delete users', 
                'slug' => 'users.delete',
                'is_active' => true
            ]
        );

        // Assign permissions to roles
        $this->adminRole->permissions()->attach([
            $viewUsersPermission->id, 
            $createUsersPermission->id, 
            $editUsersPermission->id, 
            $deleteUsersPermission->id
        ]);
        $this->managerRole->permissions()->attach([$viewUsersPermission->id, $editUsersPermission->id]);
        $this->workerRole->permissions()->attach([$viewUsersPermission->id]);

        // Create users
        $this->adminUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->adminUser->roles()->attach($this->adminRole->id);

        $this->managerUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->managerUser->roles()->attach($this->managerRole->id);

        $this->workerUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->workerUser->roles()->attach($this->workerRole->id);
    }

    public function test_admin_can_view_all_users()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);

        // Create additional users
        User::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);

        // Act
        $response = $this->getJson('/api/v1/users');

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'email',
                            'phone',
                            'is_active',
                            'data',
                            'created_at'
                        ]
                    ]
                ]);
        
        $this->assertCount(6, $response->json('data')); // 3 base users + 3 additional
    }

    public function test_manager_can_view_users()
    {
        // Arrange
        Sanctum::actingAs($this->managerUser);

        // Act
        $response = $this->getJson('/api/v1/users');

        // Assert
        $response->assertStatus(200);
    }

    public function test_worker_cannot_create_users()
    {
        // Arrange
        Sanctum::actingAs($this->workerUser);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        // Act
        $response = $this->postJson('/api/v1/users', $userData);

        // Assert
        $response->assertStatus(403);
    }

    public function test_admin_can_create_user()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'phone' => '+1234567890',
            'is_active' => true,
            'data' => [
                'first_name' => 'New',
                'last_name' => 'User',
                'status' => 'active'
            ]
        ];

        // Act
        $response = $this->postJson('/api/v1/users', $userData);

        // Assert
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'email',
                        'phone',
                        'is_active',
                        'data',
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'tenant_id' => $this->tenant->id
        ]);
    }

    public function test_admin_can_update_user()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
        $userToUpdate = User::factory()->create(['tenant_id' => $this->tenant->id]);

        $updateData = [
            'name' => 'Updated Name',
            'is_active' => false
        ];

        // Act
        $response = $this->putJson("/api/v1/users/{$userToUpdate->id}", $updateData);

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'email',
                        'phone',
                        'is_active',
                        'data',
                        'created_at'
                    ]
                ]);
        
        $this->assertDatabaseHas('users', [
            'id' => $userToUpdate->id,
            'name' => 'Updated Name',
            'is_active' => false
        ]);
    }

    public function test_admin_can_delete_user()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
        $userToDelete = User::factory()->create(['tenant_id' => $this->tenant->id]);

        // Act
        $response = $this->deleteJson("/api/v1/users/{$userToDelete->id}");

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message'
                ]);
        
        $this->assertSoftDeleted('users', [
            'id' => $userToDelete->id
        ]);
    }

    public function test_user_cannot_access_different_tenant_users()
    {
        // Arrange
        $anotherTenant = \App\Models\Tenant::factory()->create();
        $userFromAnotherTenant = User::factory()->create(['tenant_id' => $anotherTenant->id]);
        
        Sanctum::actingAs($this->adminUser);

        // Act
        $response = $this->getJson("/api/v1/users/{$userFromAnotherTenant->id}");

        // Assert
        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_users()
    {
        // Act
        $response = $this->getJson('/api/v1/users');

        // Assert
        $response->assertStatus(401);
    }

    public function test_user_can_view_own_profile()
    {
        // Arrange
        Sanctum::actingAs($this->workerUser);

        // Act
        $response = $this->getJson("/api/v1/auth/profile");

        // Assert
        $response->assertStatus(200)
                ->assertJsonFragment([
                    'id' => $this->workerUser->id,
                    'email' => $this->workerUser->email
                ]);
    }
}
