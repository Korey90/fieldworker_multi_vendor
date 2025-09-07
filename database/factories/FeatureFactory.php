<?php

namespace Database\Factories;

use App\Models\Feature;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Feature>
 */
class FeatureFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Feature::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'feature_key' => $this->faker->unique()->slug(),
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'feature_type' => $this->faker->randomElement(['core', 'premium', 'addon']),
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
            'config' => null,
        ];
    }

    /**
     * Indicate that the feature is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the feature is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the feature is a core feature.
     */
    public function core(): static
    {
        return $this->state(fn (array $attributes) => [
            'feature_type' => 'core',
        ]);
    }

    /**
     * Indicate that the feature is a premium feature.
     */
    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'feature_type' => 'premium',
        ]);
    }

    /**
     * Indicate that the feature is an addon feature.
     */
    public function addon(): static
    {
        return $this->state(fn (array $attributes) => [
            'feature_type' => 'addon',
        ]);
    }

    /**
     * Indicate that the feature has configuration.
     */
    public function withConfig(array $config = null): static
    {
        return $this->state(fn (array $attributes) => [
            'config' => $config ?? [
                'max_users' => $this->faker->numberBetween(10, 1000),
                'storage_limit' => $this->faker->numberBetween(1, 100) . 'GB',
                'api_rate_limit' => $this->faker->numberBetween(100, 10000),
            ],
        ]);
    }
}
