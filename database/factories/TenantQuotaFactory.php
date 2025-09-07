<?php

namespace Database\Factories;

use App\Models\TenantQuota;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TenantQuota>
 */
class TenantQuotaFactory extends Factory
{
    protected $model = TenantQuota::class;

    public function definition(): array
    {
        $quotaTypes = ['users', 'workers', 'jobs', 'assets', 'storage'];
        $quotaType = $this->faker->randomElement($quotaTypes);
        
        return [
            'tenant_id' => Tenant::factory(),
            'quota_type' => $quotaType,
            'quota_limit' => $this->getQuotaLimitByType($quotaType),
            'current_usage' => $this->faker->numberBetween(0, 50),
            'status' => $this->faker->randomElement(['active', 'warning']),
            'reset_date' => $quotaType === 'jobs' ? $this->faker->dateTimeBetween('now', '+1 month') : null,
            'metadata' => $this->getMetadataByType($quotaType),
        ];
    }

    /**
     * Get quota limit based on type
     */
    private function getQuotaLimitByType(string $type): int
    {
        return match($type) {
            'users' => $this->faker->numberBetween(10, 500),
            'workers' => $this->faker->numberBetween(5, 200),
            'jobs' => $this->faker->numberBetween(50, 1000),
            'assets' => $this->faker->numberBetween(20, 300),
            'storage' => $this->faker->numberBetween(1000, 50000), // MB
            default => $this->faker->numberBetween(10, 100),
        };
    }

    /**
     * Get metadata based on type
     */
    private function getMetadataByType(string $type): array
    {
        return match($type) {
            'storage' => [
                'unit' => 'MB',
                'auto_cleanup' => $this->faker->boolean(),
            ],
            'jobs' => [
                'type' => 'monthly',
                'auto_reset' => true,
            ],
            default => [],
        };
    }

    /**
     * Create users quota
     */
    public function users(int $limit = 100, int $usage = 0): static
    {
        return $this->state([
            'quota_type' => 'users',
            'quota_limit' => $limit,
            'current_usage' => $usage,
            'status' => 'active',
            'reset_date' => null,
            'metadata' => [],
        ]);
    }

    /**
     * Create workers quota
     */
    public function workers(int $limit = 50, int $usage = 0): static
    {
        return $this->state([
            'quota_type' => 'workers',
            'quota_limit' => $limit,
            'current_usage' => $usage,
            'status' => 'active',
            'reset_date' => null,
            'metadata' => [],
        ]);
    }

    /**
     * Create jobs quota (monthly)
     */
    public function jobs(int $limit = 200, int $usage = 0): static
    {
        return $this->state([
            'quota_type' => 'jobs',
            'quota_limit' => $limit,
            'current_usage' => $usage,
            'status' => 'active',
            'reset_date' => now()->addMonth(),
            'metadata' => ['type' => 'monthly', 'auto_reset' => true],
        ]);
    }

    /**
     * Create storage quota
     */
    public function storage(int $limit = 5000, int $usage = 0): static
    {
        return $this->state([
            'quota_type' => 'storage',
            'quota_limit' => $limit,
            'current_usage' => $usage,
            'status' => 'active',
            'reset_date' => null,
            'metadata' => ['unit' => 'MB'],
        ]);
    }

    /**
     * Unlimited quota
     */
    public function unlimited(string $type = 'users'): static
    {
        return $this->state([
            'quota_type' => $type,
            'quota_limit' => -1,
            'current_usage' => $this->faker->numberBetween(0, 1000),
            'status' => 'active',
            'reset_date' => null,
            'metadata' => [],
        ]);
    }

    /**
     * Exceeded quota
     */
    public function exceeded(string $type = 'users'): static
    {
        $limit = $this->faker->numberBetween(10, 100);
        return $this->state([
            'quota_type' => $type,
            'quota_limit' => $limit,
            'current_usage' => $limit + $this->faker->numberBetween(1, 50),
            'status' => 'exceeded',
            'reset_date' => null,
            'metadata' => [],
        ]);
    }
}
