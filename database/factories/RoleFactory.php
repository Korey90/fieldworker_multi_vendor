<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Role::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = [
            'Administrator',
            'Manager', 
            'Worker',
            'Supervisor',
        ];
        
        $roleName = $this->faker->randomElement($roles);
        
        return [
            'tenant_id' => \App\Models\Tenat::factory(),
            'name' => $roleName,
            'description' => $this->faker->sentence(),
        ];
    }

    /**
     * Admin role state
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Administrator',
            'description' => 'Full system access',
        ]);
    }

    /**
     * Manager role state
     */
    public function manager(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Manager',
            'description' => 'Management access',
        ]);
    }

    /**
     * Worker role state
     */
    public function worker(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Worker',
            'description' => 'Basic worker access',
        ]);
    }
}
