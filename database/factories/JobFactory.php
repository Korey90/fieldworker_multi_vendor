<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Job>
 */
class JobFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Job::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => $this->faker->uuid(),
            'tenant_id' => Tenant::factory(),
            'location_id' => Location::factory(),
            'assigned_user_id' => User::factory(),
            'title' => $this->faker->jobTitle(),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['open', 'pending', 'in_progress', 'completed', 'cancelled']),
            'scheduled_at' => $this->faker->optional()->dateTimeBetween('now', '+1 month'),
            'completed_at' => $this->faker->optional()->dateTimeBetween('-1 month', 'now'),
            'data' => json_encode([
                'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
                'requirements' => $this->faker->optional()->sentence(),
                'notes' => $this->faker->optional()->text(100),
            ]),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the job is open.
     */
    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'open',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the job is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the job is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the job is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the job is for a specific tenant.
     */
    public function forTenant(string $tenantId): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => $tenantId,
        ]);
    }

    /**
     * Indicate that the job is assigned to a specific user.
     */
    public function assignedTo(string $userId): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_user_id' => $userId,
        ]);
    }
}
