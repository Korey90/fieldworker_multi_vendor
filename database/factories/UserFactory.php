<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => \App\Models\Tenat::factory(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'is_active' => fake()->boolean(80),
            'data' => json_encode([
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'status' => fake()->randomElement(['active', 'inactive', 'suspended']),
                'last_login_at' => fake()->optional()->dateTimeBetween('-1 month'),
                'preferences' => [
                    'language' => 'en',
                    'timezone' => 'UTC',
                    'notifications' => true,
                ],
            ]),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
