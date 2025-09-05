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
        
        // Create roles
        $this->adminRole = Role::factory()->admin()->create(['tenant_id' => $this->tenant->id]);
        $this->managerRole = Role::factory()->manager()->create(['tenant_id' => $this->tenant->id]);
        $this->workerRole = Role::factory()->worker()->create(['tenant_id' => $this->tenant->id]);

        // Create permissions
        $viewUsersPermission = Permission::factory()->usersView()->create(['tenant_id' => $this->tenant->id]);
        $createUsersPermission = Permission::factory()->usersCreate()->create(['tenant_id' => $this->tenant->id]);
        $editUsersPermission = Permission::factory()->usersEdit()->create(['tenant_id' => $this->tenant->id]);
        $deleteUsersPermission = Permission::factory()->usersDelete()->create(['tenant_id' => $this->tenant->id]);

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
                            'status',
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
            'password_confirmation' => 'password123',
            'first_name' => 'New',
            'last_name' => 'User',
            'phone' => '+1234567890',
            'status' => 'active'
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
                        'status'
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
            'status' => 'inactive'
        ];

        // Act
        $response = $this->putJson("/api/v1/users/{$userToUpdate->id}", $updateData);

        // Assert
        $response->assertStatus(200);
        
        $this->assertDatabaseHas('users', [
            'id' => $userToUpdate->id,
            'name' => 'Updated Name',
            'status' => 'inactive'
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
        $response->assertStatus(204);
        
        $this->assertSoftDeleted('users', [
            'id' => $userToDelete->id
        ]);
    }

    public function test_user_cannot_access_different_tenant_users()
    {
        // Arrange
        $anotherTenant = \App\Models\Tenat::factory()->create();
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
        $response = $this->getJson("/api/v1/users/{$this->workerUser->id}");

        // Assert
        $response->assertStatus(200)
                ->assertJsonFragment([
                    'id' => $this->workerUser->id,
                    'email' => $this->workerUser->email
                ]);
    }
}
