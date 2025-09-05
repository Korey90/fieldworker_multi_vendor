<?php

namespace Database\Factories;

use App\Models\Tenat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tenat>
 */
class TenatFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tenat::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->company();
        
        return [
            'name' => $name,
            'sector' => $this->faker->randomElement(['construction', 'agriculture', 'manufacturing', 'healthcare', 'retail']),
            'data' => json_encode([
                'max_users' => $this->faker->numberBetween(10, 500),
                'max_storage' => $this->faker->numberBetween(1000, 50000), // MB
                'features' => [
                    'advanced_reporting' => $this->faker->boolean(),
                    'api_access' => $this->faker->boolean(),
                    'custom_branding' => $this->faker->boolean(),
                ],
                'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            ])
        ];
    }

    /**
     * Indicate that the tenant is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'data' => json_encode(array_merge(
                json_decode($attributes['data'] ?? '{}', true),
                ['status' => 'active']
            )),
        ]);
    }

    /**
     * Indicate that the tenant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'data' => json_encode(array_merge(
                json_decode($attributes['data'] ?? '{}', true),
                ['status' => 'inactive']
            )),
        ]);
    }

    /**
     * Indicate that the tenant is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'data' => json_encode(array_merge(
                json_decode($attributes['data'] ?? '{}', true),
                ['status' => 'suspended']
            )),
        ]);
    }
}
