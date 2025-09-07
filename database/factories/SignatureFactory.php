<?php

namespace Database\Factories;

use App\Models\Signature;
use App\Models\User;
use App\Models\FormResponse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Signature>
 */
class SignatureFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Signature::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'form_response_id' => FormResponse::factory(),
            'user_id' => User::factory(),
            'signatory_name' => $this->faker->name(),
            'signatory_role' => $this->faker->randomElement(['Manager', 'Supervisor', 'Worker', 'Contractor', 'Client']),
            'name' => $this->faker->name(), // Legacy field
            'role' => $this->faker->randomElement(['Manager', 'Supervisor', 'Worker']), // Legacy field
            'signature_image_path' => 'signatures/' . $this->faker->uuid() . '.png',
            'signature_path' => 'signatures/' . $this->faker->uuid() . '.png',
            'document_hash' => $this->faker->sha256(),
            'signed_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'metadata' => [
                'ip_address' => $this->faker->ipv4(),
                'user_agent' => $this->faker->userAgent(),
                'location' => [
                    'lat' => $this->faker->latitude(),
                    'lng' => $this->faker->longitude(),
                ]
            ],
        ];
    }

    /**
     * Indicate that the signature was signed recently.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'signed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Indicate that the signature is for a manager.
     */
    public function manager(): static
    {
        return $this->state(fn (array $attributes) => [
            'signatory_role' => 'Manager',
            'role' => 'Manager',
        ]);
    }

    /**
     * Indicate that the signature is for a worker.
     */
    public function worker(): static
    {
        return $this->state(fn (array $attributes) => [
            'signatory_role' => 'Worker',
            'role' => 'Worker',
        ]);
    }
}
