<?php

namespace Tests\Unit\Models;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    public function test_user_can_have_multiple_roles()
    {
        // Arrange
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $adminRole = Role::factory()->create(['slug' => 'admin']);
        $managerRole = Role::factory()->create(['slug' => 'manager']);

        // Act
        $user->roles()->attach([$adminRole->id, $managerRole->id]);

        // Assert
        $this->assertEquals(2, $user->roles->count());
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('manager'));
        $this->assertFalse($user->hasRole('worker'));
    }

    public function test_role_can_have_multiple_permissions()
    {
        // Arrange
        $role = Role::factory()->create(['slug' => 'admin']);
        $permission1 = Permission::factory()->create(['slug' => 'users.create']);
        $permission2 = Permission::factory()->create(['slug' => 'users.delete']);

        // Act
        $role->permissions()->attach([$permission1->id, $permission2->id]);

        // Assert
        $this->assertEquals(2, $role->permissions->count());
        $this->assertTrue($role->permissions->contains($permission1));
        $this->assertTrue($role->permissions->contains($permission2));
    }

    public function test_user_inherits_permissions_from_roles()
    {
        // Arrange
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $role = Role::factory()->create(['slug' => 'admin']);
        $permission = Permission::factory()->create(['slug' => 'users.create']);

        $role->permissions()->attach($permission->id);
        $user->roles()->attach($role->id);

        // Act & Assert
        $this->assertTrue($user->hasPermission('users.create'));
        $this->assertFalse($user->hasPermission('nonexistent.permission'));
    }

    public function test_user_can_have_direct_permissions()
    {
        // Arrange
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $permission = Permission::factory()->create(['slug' => 'special.permission']);

        // Act
        $user->permissions()->attach($permission->id);

        // Assert
        $this->assertTrue($user->hasPermission('special.permission'));
    }
}
