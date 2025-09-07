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
        $roleName = $this->faker->jobTitle();
        
        return [
            'tenant_id' => \App\Models\Tenant::factory(),
            'name' => $roleName,
            'description' => $this->faker->sentence(),
            'slug' => strtolower(str_replace(' ', '-', $roleName)) . '-' . $this->faker->unique()->randomNumber(3),
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
