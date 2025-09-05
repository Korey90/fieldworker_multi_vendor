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
        $permissions = [
            ['key' => 'users.view', 'description' => 'View Users'],
            ['key' => 'users.create', 'description' => 'Create Users'],
            ['key' => 'users.edit', 'description' => 'Edit Users'],
            ['key' => 'users.delete', 'description' => 'Delete Users'],
            ['key' => 'jobs.view', 'description' => 'View Jobs'],
            ['key' => 'jobs.create', 'description' => 'Create Jobs'],
            ['key' => 'jobs.edit', 'description' => 'Edit Jobs'],
            ['key' => 'jobs.delete', 'description' => 'Delete Jobs'],
            ['key' => 'admin.settings', 'description' => 'Admin Settings'],
            ['key' => 'roles.manage', 'description' => 'Manage Roles'],
        ];
        
        $permission = $this->faker->randomElement($permissions);
        
        return [
            'key' => $permission['key'],
            'description' => $permission['description'],
        ];
    }

    /**
     * Users permission states
     */
    public function usersView(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'users.view',
            'description' => 'Permission to view users',
        ]);
    }

    public function usersCreate(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'users.create',
            'description' => 'Permission to create users',
        ]);
    }

    public function usersEdit(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'users.edit',
            'description' => 'Permission to edit users',
        ]);
    }

    public function usersDelete(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'users.delete',
            'description' => 'Permission to delete users',
        ]);
    }

    /**
     * Admin permission state
     */
    public function adminSettings(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'admin.settings',
            'description' => 'Full admin access to settings',
        ]);
    }
}
