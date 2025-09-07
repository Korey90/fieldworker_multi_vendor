<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    public function test_user_can_register()
    {
        // Arrange
        $userData = [
            'name' => 'John Doe',
            'email' => 'john.doe.test@testdomain.example',
            'password' => 'TestPassword123!SecureUnique',
            'password_confirmation' => 'TestPassword123!SecureUnique',
            'tenant_slug' => $this->tenant->slug
        ];

        // Act
        $response = $this->postJson('/api/v1/auth/register-in-tenant', $userData);

        // Assert
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'data' => ['user', 'token'],
                    'message'
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe.test@testdomain.example',
            'tenant_id' => $this->tenant->id
        ]);
    }

    public function test_user_can_login()
    {
        // Arrange
        $user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'is_active' => true
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'password123'
        ];

        // Act
        $response = $this->postJson('/api/v1/auth/login', $loginData);

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => ['user', 'token'],
                    'message'
                ]);
    }

    public function test_user_cannot_login_with_wrong_credentials()
    {
        // Arrange
        $user = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => 'john@example.com',
            'password' => bcrypt('password123'),
            'is_active' => true
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'wrongpassword'
        ];

        // Act
        $response = $this->postJson('/api/v1/auth/login', $loginData);

        // Assert
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_logout()
    {
        // Arrange
        $user = $this->actingAsUser();

        // Act
        $response = $this->postJson('/api/v1/auth/logout');

        // Assert
        $response->assertStatus(200);
    }

    public function test_user_can_get_profile()
    {
        // Arrange
        $user = $this->actingAsUser();

        // Act
        $response = $this->getJson('/api/v1/auth/profile');

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => ['id', 'name', 'email', 'tenant']
                ]);
    }
}
