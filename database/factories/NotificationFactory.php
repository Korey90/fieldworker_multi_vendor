<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['emergency', 'urgent', 'warning', 'info'];
        
        return [
            'user_id' => User::factory(),
            'tenant_id' => Tenant::factory(),
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement($types),
            'is_read' => $this->faker->boolean(30), // 30% chance of being read
            'read_at' => $this->faker->optional(0.3)->dateTimeBetween('-1 month', 'now'),
            'data' => $this->faker->optional(0.5)->randomElement([
                ['action' => 'view_document', 'document_id' => $this->faker->uuid],
                ['url' => $this->faker->url],
                ['priority' => $this->faker->numberBetween(1, 5)],
                []
            ]),
        ];
    }

    /**
     * Indicate that the notification is unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    /**
     * Indicate that the notification is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'read_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Create an emergency notification.
     */
    public function emergency(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'emergency',
            'title' => 'EMERGENCY: ' . $this->faker->sentence(2),
        ]);
    }

    /**
     * Create an urgent notification.
     */
    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'urgent',
            'title' => 'URGENT: ' . $this->faker->sentence(2),
        ]);
    }
}
