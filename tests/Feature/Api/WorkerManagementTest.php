<?php

namespace Tests\Feature\Api;

use App\Models\Worker;
use Tests\TestCase;

class WorkerManagementTest extends TestCase
{
    public function test_admin_can_create_worker()
    {
        // Arrange
        $admin = $this->actingAsUser('admin');
        
        // Utwórz użytkownika dla worker
        $workerUser = \App\Models\User::factory()->create([
            'tenant_id' => $this->tenant->id,
        ]);
        
        $workerData = [
            'user_id' => $workerUser->id,
            'tenant_id' => $this->tenant->id,
            'employee_number' => 'EMP001',
            'hire_date' => '2024-01-01',
            'job_title' => 'Construction Worker',
            'status' => 'active',
        ];

        // Act
        $response = $this->postJson('/api/v1/workers', $workerData);

        // Assert
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'data' => ['id', 'employee_number', 'status']
                ]);

        $this->assertDatabaseHas('workers', [
            'employee_number' => 'EMP001',
            'tenant_id' => $this->tenant->id
        ]);
    }

    public function test_worker_cannot_create_worker()
    {
        // Arrange
        $user = $this->actingAsUser('worker');
        
        $workerData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'worker@example.com',
            'phone' => '+1234567890',
            'status' => 'active',
            'hire_date' => '2024-01-01'
        ];

        // Act
        $response = $this->postJson('/api/v1/workers', $workerData);

        // Assert
        $response->assertStatus(403);
    }

    public function test_admin_can_view_workers_list()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        Worker::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);

        // Act
        $response = $this->getJson('/api/v1/workers');

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => ['*' => ['id', 'employee_number', 'status', 'data', 'created_at']],
                    'meta'
                ]);

        $this->assertEquals(3, count($response->json('data')));
    }

    public function test_worker_isolation_between_tenants()
    {
        // Arrange
        $secondTenant = $this->createSecondTenant();
        $user = $this->actingAsUser('admin');

        // Tworzenie pracowników w różnych tenantach
        Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        Worker::factory()->create(['tenant_id' => $secondTenant->id]);

        // Act
        $response = $this->getJson('/api/v1/workers');

        // Assert
        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data'))); // tylko 1 z tego tenanta
    }

    public function test_admin_can_update_worker()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        $worker = Worker::factory()->create(['tenant_id' => $this->tenant->id]);

        $updateData = [
            'employee_number' => 'EMP-UPDATED',
            'status' => 'inactive'
        ];

        // Act
        $response = $this->patchJson("/api/v1/workers/{$worker->id}", $updateData);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('workers', [
            'id' => $worker->id,
            'employee_number' => 'EMP-UPDATED',
            'status' => 'inactive'
        ]);
    }

    public function test_admin_can_delete_worker()
    {
        // Arrange
        $user = $this->actingAsUser('admin');
        $worker = Worker::factory()->create(['tenant_id' => $this->tenant->id]);

        // Act
        $response = $this->deleteJson("/api/v1/workers/{$worker->id}");

        // Assert
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message'
                ]);
        $this->assertSoftDeleted('workers', ['id' => $worker->id]);
    }
}
