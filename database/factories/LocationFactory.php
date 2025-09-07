<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Tenant;
use App\Models\Sector;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Location::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'sector_id' => \App\Models\Sector::factory(),
            'name' => $this->faker->company() . ' - ' . $this->faker->city(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'location_type' => $this->faker->randomElement(['office', 'warehouse', 'retail', 'factory', 'field']),
            'is_active' => $this->faker->boolean(85), // 85% chance of being active
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'data' => [
                'contact_info' => [
                    'phone' => $this->faker->phoneNumber(),
                    'email' => $this->faker->safeEmail(),
                    'contact_person' => $this->faker->name()
                ],
                'capacity' => $this->faker->numberBetween(10, 500),
                'facilities' => $this->faker->randomElements(['parking', 'wifi', 'kitchen', 'meeting_room'], $this->faker->numberBetween(1, 3))
            ],
        ];
    }

    /**
     * Indicate that the location is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the location is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the location is for a specific tenant.
     */
    public function forTenant(string $tenantId): static
    {
        return $this->state(fn (array $attributes) => [
            'tenant_id' => $tenantId,
        ]);
    }
}
