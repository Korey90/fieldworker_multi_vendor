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
        TenantQuota::factory()->create([
            'tenant_id' => $this->tenant->id,
            'quota_type' => 'users',
            'limit_value' => 2,
            'current_usage' => 2 // już na limicie
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
        
        TenantQuota::factory()->create([
            'tenant_id' => $this->tenant->id,
            'quota_type' => 'users',
            'limit_value' => 10,
            'current_usage' => 5
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
        
        TenantQuota::factory()->create([
            'tenant_id' => $this->tenant->id,
            'quota_type' => 'users',
            'limit_value' => -1, // unlimited
            'current_usage' => 1000
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
        
        $quota = TenantQuota::factory()->create([
            'tenant_id' => $this->tenant->id,
            'quota_type' => 'users',
            'limit_value' => 10,
            'current_usage' => 5
        ]);

        // Act
        $response = $this->getJson('/api/v1/tenant-quotas/usage/tenant');

        // Assert
        $response->assertStatus(200)
                ->assertJsonFragment([
                    'quota_type' => 'users',
                    'current_usage' => 5,
                    'limit_value' => 10,
                    'percentage_used' => 50
                ]);
    }
}
