<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = [
            'created', 'updated', 'deleted', 'viewed', 'assigned', 'unassigned',
            'logged_in', 'logged_out', 'password_changed', 'role_changed',
            'permission_granted', 'permission_revoked', 'form_submitted',
            'signature_created', 'file_uploaded', 'export_generated'
        ];

        $modelTypes = [
            'App\Models\User', 'App\Models\Worker', 'App\Models\Job', 
            'App\Models\Asset', 'App\Models\Location', 'App\Models\Form',
            'App\Models\Notification', 'App\Models\Signature'
        ];

        $oldValues = $this->faker->optional(0.7)->randomElement([
            ['name' => $this->faker->name, 'status' => 'active'],
            ['title' => $this->faker->sentence, 'description' => $this->faker->paragraph],
            ['email' => $this->faker->email, 'role' => 'worker'],
        ]);

        $newValues = $this->faker->optional(0.8)->randomElement([
            ['name' => $this->faker->name, 'status' => 'inactive'],
            ['title' => $this->faker->sentence, 'description' => $this->faker->paragraph],
            ['email' => $this->faker->email, 'role' => 'manager'],
        ]);

        return [
            'tenant_id' => Tenant::factory(),
            'user_id' => User::factory(),
            'action' => $this->faker->randomElement($actions),
            'entity_type' => $this->faker->optional(0.8)->randomElement($modelTypes),
            'entity_id' => $this->faker->optional(0.8)->uuid,
            'model_type' => $this->faker->optional(0.8)->randomElement($modelTypes),
            'model_id' => $this->faker->optional(0.8)->numberBetween(1, 1000),
            'changes' => $this->faker->optional(0.6)->randomElement([
                ['field' => 'status', 'old' => 'active', 'new' => 'inactive'],
                ['field' => 'name', 'old' => 'Old Name', 'new' => 'New Name'],
            ]),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $this->faker->ipv4,
            'user_agent' => $this->faker->userAgent,
            'metadata' => $this->faker->optional(0.5)->randomElement([
                ['session_id' => $this->faker->uuid, 'source' => 'web'],
                ['api_version' => '1.0', 'client' => 'mobile'],
                ['batch_id' => $this->faker->uuid, 'operation' => 'bulk_update'],
            ]),
        ];
    }

    /**
     * Create a login audit log.
     */
    public function login(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'logged_in',
            'entity_type' => null,
            'entity_id' => null,
            'model_type' => null,
            'model_id' => null,
            'old_values' => null,
            'new_values' => ['login_time' => now()->toISOString()],
            'metadata' => ['login_method' => 'email'],
        ]);
    }

    /**
     * Create a logout audit log.
     */
    public function logout(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'logged_out',
            'entity_type' => null,
            'entity_id' => null,
            'model_type' => null,
            'model_id' => null,
            'old_values' => null,
            'new_values' => ['logout_time' => now()->toISOString()],
            'metadata' => ['session_duration' => $this->faker->numberBetween(300, 7200)],
        ]);
    }

    /**
     * Create a model creation audit log.
     */
    public function created(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'created',
            'old_values' => null,
            'new_values' => [
                'id' => $this->faker->uuid,
                'name' => $this->faker->name,
                'created_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Create a model update audit log.
     */
    public function updated(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'updated',
            'old_values' => [
                'name' => 'Old Name',
                'status' => 'active',
            ],
            'new_values' => [
                'name' => 'New Name', 
                'status' => 'inactive',
            ],
        ]);
    }

    /**
     * Create a model deletion audit log.
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'deleted',
            'old_values' => [
                'id' => $this->faker->uuid,
                'name' => $this->faker->name,
                'status' => 'active',
            ],
            'new_values' => null,
        ]);
    }
}
