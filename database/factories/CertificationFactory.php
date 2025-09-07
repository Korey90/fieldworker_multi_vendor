<?php

namespace Database\Factories;

use App\Models\Certification;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Certification>
 */
class CertificationFactory extends Factory
{
    protected $model = Certification::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $certificationTypes = [
            'First Aid',
            'CPR Certification', 
            'Safety Training',
            'Equipment Operation License',
            'Professional Certification',
            'Trade License',
            'Welding Certification',
            'Electrical License',
            'Driving License',
            'Forklift Operator License'
        ];

        $authorities = [
            'Red Cross',
            'OSHA',
            'Department of Transportation',
            'Professional Certification Board',
            'State Licensing Board',
            'American Welding Society',
            'National Safety Council',
            'International Association of Firefighters'
        ];

        return [
            'name' => $this->faker->randomElement($certificationTypes),
            'description' => $this->faker->paragraph(2),
            'authority' => $this->faker->randomElement($authorities),
            'validity_period_months' => $this->faker->optional(0.8)->randomElement([12, 24, 36, 48, 60]),
            'is_active' => $this->faker->boolean(85),
            'tenant_id' => Tenant::factory(),
        ];
    }

    /**
     * Indicate that the certification is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the certification is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the certification is permanent (no expiry).
     */
    public function permanent(): static
    {
        return $this->state(fn (array $attributes) => [
            'validity_period_months' => null,
        ]);
    }

    /**
     * Indicate that the certification expires in 1 year.
     */
    public function yearly(): static
    {
        return $this->state(fn (array $attributes) => [
            'validity_period_months' => 12,
        ]);
    }

    /**
     * Indicate that the certification expires in 2 years.
     */
    public function biennial(): static
    {
        return $this->state(fn (array $attributes) => [
            'validity_period_months' => 24,
        ]);
    }
}
