<?php

namespace Tests\Feature\Api;

use App\Models\TenantQuota;
use Tests\TestCase;

class QuotaEnforcementTest extends TestCase
{
    public function test_quota_enforcement_blocks_creation_over_limit()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        
        // Ustawiamy limit na 2 użytkowników
        TenantQuota::factory()->users(2, 2)->create([
            'tenant_id' => $this->tenant->id,
        ]);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/v1/users', $userData);

        // Assert
        $response->assertStatus(429); // Too Many Requests - quota exceeded
    }

    public function test_quota_enforcement_allows_creation_within_limit()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        
        TenantQuota::factory()->users(10, 5)->create([
            'tenant_id' => $this->tenant->id,
        ]);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/v1/users', $userData);

        // Assert
        $response->assertStatus(201);
    }

    public function test_unlimited_quota_allows_any_creation()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        
        TenantQuota::factory()->unlimited('users')->create([
            'tenant_id' => $this->tenant->id,
        ]);

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Act
        $response = $this->postJson('/api/v1/users', $userData);

        // Assert
        $response->assertStatus(201);
    }

    public function test_quota_usage_tracking()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        
        $quota = TenantQuota::factory()->users(10, 5)->create([
            'tenant_id' => $this->tenant->id,
        ]);

        // Act
        $response = $this->getJson('/api/v1/tenant-quotas/usage/tenant');

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'tenant_id',
                    'quotas' => [
                        '*' => [
                            'quota_type',
                            'limit',
                            'current_usage',
                            'usage_percentage',
                            'status',
                            'is_exceeded',
                        ]
                    ],
                    'total_quotas',
                    'exceeded_quotas',
                ]);
    }
}
