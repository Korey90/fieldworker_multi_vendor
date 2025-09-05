<?php

namespace Tests\Unit\Models;

use App\Models\Tenat;
use App\Models\User;
use App\Models\Worker;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    public function test_user_only_sees_data_from_their_tenant()
    {
        // Arrange
        $secondTenant = $this->createSecondTenant();
        
        $userTenant1 = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $userTenant2 = User::factory()->create(['tenant_id' => $secondTenant->id]);

        // Act - symulujemy zalogowanego użytkownika z tenant 1
        $this->actingAs($userTenant1);
        app()->instance('tenant.current', $this->tenant);

        // Assert - użytkownik widzi tylko dane ze swojego tenanta
        $this->assertEquals(1, User::count()); // tylko userTenant1
        $this->assertEquals($userTenant1->id, User::first()->id);
    }

    public function test_worker_belongs_to_tenant()
    {
        // Arrange
        $secondTenant = $this->createSecondTenant();
        
        $workerTenant1 = Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        $workerTenant2 = Worker::factory()->create(['tenant_id' => $secondTenant->id]);

        // Act - ustawiamy kontekst pierwszego tenanta
        app()->instance('tenant.current', $this->tenant);

        // Assert
        $this->assertEquals(1, Worker::count());
        $this->assertEquals($workerTenant1->id, Worker::first()->id);
    }

    public function test_tenant_relationships()
    {
        // Arrange
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $worker = Worker::factory()->create(['tenant_id' => $this->tenant->id]);

        // Assert
        $this->assertTrue($user->tenant->is($this->tenant));
        $this->assertTrue($worker->tenant->is($this->tenant));
        $this->assertTrue($this->tenant->users->contains($user));
        $this->assertTrue($this->tenant->workers->contains($worker));
    }
}
