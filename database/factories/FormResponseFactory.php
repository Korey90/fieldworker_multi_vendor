<?php

namespace Database\Factories;

use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Job;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FormResponse>
 */
class FormResponseFactory extends Factory
{
    protected $model = FormResponse::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'form_id' => Form::factory(),
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'job_id' => null, // Optional
            'response_data' => [
                'name' => $this->faker->name,
                'email' => $this->faker->email,
                'feedback' => $this->faker->sentence,
                'rating' => $this->faker->numberBetween(1, 5),
            ],
            'is_submitted' => false,
            'submitted_at' => null,
        ];
    }

    /**
     * Make the response submitted
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_submitted' => true,
            'submitted_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Make the response a draft
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_submitted' => false,
            'submitted_at' => null,
        ]);
    }

    /**
     * With job assignment
     */
    public function withJob(): static
    {
        return $this->state(fn (array $attributes) => [
            'job_id' => Job::factory(),
        ]);
    }
}
