<?php

namespace Database\Factories;

use App\Models\JobAssignment;
use App\Models\Job;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JobAssignment>
 */
class JobAssignmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = JobAssignment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $assignedAt = $this->faker->dateTimeBetween('-2 months', 'now');
        $status = $this->faker->randomElement(['assigned', 'in_progress', 'completed', 'cancelled']);
        
        return [
            'job_id' => Job::factory(),
            'worker_id' => Worker::factory(),
            'role' => $this->faker->randomElement(['lead', 'assistant', 'specialist', 'supervisor']),
            'status' => $status,
            'assigned_at' => $assignedAt,
            'completed_at' => $status === 'completed' ? $this->faker->dateTimeBetween($assignedAt, 'now') : null,
            'notes' => $this->faker->optional(0.7)->sentence(),
            'data' => $this->faker->optional(0.5)->passthrough([
                'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
                'estimated_hours' => $this->faker->numberBetween(1, 40),
                'skills_required' => $this->faker->randomElements(['technical', 'soft', 'certification'], $this->faker->numberBetween(1, 3)),
            ]),
        ];
    }

    /**
     * Indicate that the assignment is assigned.
     */
    public function assigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'assigned',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the assignment is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'completed_at' => null,
            'data' => array_merge($attributes['data'] ?? [], [
                'started_at' => $this->faker->dateTimeBetween($attributes['assigned_at'] ?? '-1 week', 'now'),
            ]),
        ]);
    }

    /**
     * Indicate that the assignment is completed.
     */
    public function completed(): static
    {
        $assignedAt = $this->faker->dateTimeBetween('-1 month', '-1 week');
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'assigned_at' => $assignedAt,
            'completed_at' => $this->faker->dateTimeBetween($assignedAt, 'now'),
            'data' => array_merge($attributes['data'] ?? [], [
                'started_at' => $this->faker->dateTimeBetween($assignedAt, '-3 days'),
                'completed_by' => $this->faker->uuid(),
            ]),
        ]);
    }

    /**
     * Indicate that the assignment is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'completed_at' => null,
            'data' => array_merge($attributes['data'] ?? [], [
                'cancelled_at' => $this->faker->dateTimeBetween($attributes['assigned_at'] ?? '-1 week', 'now'),
                'cancellation_reason' => $this->faker->sentence(),
            ]),
        ]);
    }
}
