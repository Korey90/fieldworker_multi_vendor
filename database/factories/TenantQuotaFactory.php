<?php

namespace Database\Factories;

use App\Models\TenantQuota;
use App\Models\Tenat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TenantQuota>
 */
class TenantQuotaFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TenantQuota::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenat::factory(),
            'max_users' => $this->faker->numberBetween(10, 500),
            'max_storage_mb' => $this->faker->numberBetween(1000, 50000),
            'max_jobs_per_month' => $this->faker->numberBetween(50, 1000),
        ];
    }

    /**
     * High user limit
     */
    public function highUserLimit(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_users' => 1000,
        ]);
    }

    /**
     * Low user limit
     */
    public function lowUserLimit(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_users' => 5,
        ]);
    }

    /**
     * Unlimited quota
     */
    public function unlimited(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_users' => null,
            'max_storage_mb' => null,
            'max_jobs_per_month' => null,
        ]);
    }
}
