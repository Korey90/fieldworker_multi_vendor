<?php

namespace Database\Factories;

use App\Models\Worker;
use App\Models\User;
use App\Models\Tenat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Worker>
 */
class WorkerFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Worker::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'tenant_id' => function (array $attributes) {
                return User::find($attributes['user_id'])->tenant_id;
            },
            'employee_id' => $this->faker->unique()->bothify('EMP-####'),
            'hire_date' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'hourly_rate' => $this->faker->randomFloat(2, 15, 50),
            'status' => $this->faker->randomElement(['active', 'inactive', 'terminated']),
            'data' => json_encode([
                'emergency_contact' => [
                    'name' => $this->faker->name(),
                    'phone' => $this->faker->phoneNumber(),
                    'relationship' => $this->faker->randomElement(['spouse', 'parent', 'sibling', 'friend']),
                ],
                'qualifications' => $this->faker->words(3),
                'notes' => $this->faker->optional()->sentence(),
            ]),
        ];
    }

    /**
     * Indicate that the worker is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the worker is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the worker is terminated.
     */
    public function terminated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'terminated',
        ]);
    }
}
