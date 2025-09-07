<?php

namespace Database\Factories;

use App\Models\Asset;
use App\Models\Tenant;
use App\Models\Location;
use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset>
 */
class AssetFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Asset::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $assetTypes = ['Laptop', 'Tablet', 'Phone', 'Tool', 'Vehicle', 'Equipment', 'Camera', 'Safety Gear'];
        $purchaseDate = $this->faker->dateTimeBetween('-5 years', '-1 month');
        $purchaseCost = $this->faker->randomFloat(2, 100, 10000);
        
        return [
            'tenant_id' => Tenant::factory(),
            'location_id' => Location::factory(),
            'name' => $this->faker->words(3, true) . ' ' . $this->faker->randomElement($assetTypes),
            'description' => $this->faker->sentence(),
            'asset_type' => $this->faker->randomElement($assetTypes),
            'serial_number' => strtoupper($this->faker->bothify('??###??###')),
            'purchase_date' => $purchaseDate,
            'purchase_cost' => $purchaseCost,
            'current_value' => $purchaseCost * $this->faker->randomFloat(2, 0.3, 0.9), // Depreciated value
            'status' => $this->faker->randomElement(['active', 'inactive', 'maintenance', 'retired']),
            'assigned_to' => null, // Will be set by state methods
            'data' => [
                'warranty_expires' => $this->faker->dateTimeBetween('now', '+2 years')->format('Y-m-d'),
                'vendor' => $this->faker->company(),
                'model' => $this->faker->word() . ' ' . $this->faker->randomNumber(4),
                'condition' => $this->faker->randomElement(['Excellent', 'Good', 'Fair', 'Poor']),
            ],
        ];
    }

    /**
     * Indicate that the asset is assigned to a worker.
     */
    public function assigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_to' => Worker::factory(),
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the asset is unassigned.
     */
    public function unassigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate that the asset is in maintenance.
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'maintenance',
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate that the asset is retired.
     */
    public function retired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'retired',
            'assigned_to' => null,
        ]);
    }
}
