<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Permission>
 */
class PermissionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Permission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uniqueId = $this->faker->unique()->numberBetween(1, 999999);
        $key = 'test.permission.' . $uniqueId;
        
        $permissionGroups = [
            'users',
            'workers', 
            'jobs',
            'assets',
            'reports',
            'settings',
            'system'
        ];
        
        $actions = ['view', 'create', 'update', 'delete', 'manage'];
        $group = $this->faker->randomElement($permissionGroups);
        $action = $this->faker->randomElement($actions);
        
        return [
            'name' => ucfirst($group) . ' ' . ucfirst($action),
            'key' => $key,
            'permission_key' => $group . '.' . $action . '.' . $uniqueId, // Make permission_key unique
            'permission_group' => $group,
            'slug' => $key,
            'description' => 'Permission to ' . $action . ' ' . $group,
            'is_active' => $this->faker->boolean(90),
        ];
    }

    /**
     * Users permission states
     */
    public function usersView(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Users View',
            'key' => 'users.view',
            'permission_key' => 'users.view',
            'permission_group' => 'users',
            'description' => 'Permission to view users',
            'slug' => 'users.view',
            'is_active' => true,
        ]);
    }

    public function usersCreate(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Users Create',
            'key' => 'users.create',
            'permission_key' => 'users.create',
            'permission_group' => 'users',
            'description' => 'Permission to create users',
            'slug' => 'users.create',
            'is_active' => true,
        ]);
    }

    public function usersEdit(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Users Edit',
            'key' => 'users.edit',
            'permission_key' => 'users.edit',
            'permission_group' => 'users',
            'description' => 'Permission to edit users',
            'slug' => 'users.edit',
            'is_active' => true,
        ]);
    }

    public function usersDelete(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Users Delete',
            'key' => 'users.delete',
            'permission_key' => 'users.delete',
            'permission_group' => 'users',
            'description' => 'Permission to delete users',
            'slug' => 'users.delete',
            'is_active' => true,
        ]);
    }

    /**
     * Admin permission state
     */
    public function adminSettings(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Admin Settings',
            'key' => 'admin.settings',
            'permission_key' => 'admin.settings',
            'permission_group' => 'admin',
            'description' => 'Full admin access to settings',
            'slug' => 'admin.settings',
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the permission is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the permission is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
