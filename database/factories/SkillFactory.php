<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Skill>
 */
class SkillFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Skill::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $skillTypes = ['technical', 'soft', 'certification', 'safety'];
        $categories = ['Equipment', 'Software', 'Communication', 'Safety', 'Management'];
        
        return [
            'name' => $this->faker->words(2, true),
            'category' => $this->faker->randomElement($categories),
            'description' => $this->faker->sentence(),
            'skill_type' => $this->faker->randomElement($skillTypes),
            'is_active' => true,
        ];
    }

    public function technical(): static
    {
        return $this->state(fn (array $attributes) => [
            'skill_type' => 'technical',
            'category' => $this->faker->randomElement(['Equipment', 'Software', 'Machinery']),
        ]);
    }

    public function soft(): static
    {
        return $this->state(fn (array $attributes) => [
            'skill_type' => 'soft',
            'category' => $this->faker->randomElement(['Communication', 'Leadership', 'Problem Solving']),
        ]);
    }

    public function certification(): static
    {
        return $this->state(fn (array $attributes) => [
            'skill_type' => 'certification',
            'category' => $this->faker->randomElement(['Safety', 'Technical', 'Professional']),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
