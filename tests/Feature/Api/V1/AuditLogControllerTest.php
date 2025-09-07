<?php

namespace Tests\Feature\Api\V1;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditLogControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $tenant;
    protected $admin;
    protected $manager;
    protected $worker;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->active()->create();
        
        // Create users with different roles
        $this->admin = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->manager = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->worker = User::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Assign roles
        $adminRole = Role::where('slug', 'admin')->first();
        $managerRole = Role::where('slug', 'manager')->first();
        $workerRole = Role::where('slug', 'worker')->first();
        
        $this->admin->roles()->attach($adminRole);
        $this->manager->roles()->attach($managerRole);
        $this->worker->roles()->attach($workerRole);
    }

    public function test_admin_can_list_audit_logs()
    {
        Sanctum::actingAs($this->admin);
        
        AuditLog::factory(3)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id
        ]);

        $response = $this->getJson('/api/v1/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'action',
                        'old_values',
                        'new_values',
                        'ip_address',
                        'user_agent',
                        'created_at',
                        'updated_at'
                    ]
                ]
            ]);
    }

    public function test_manager_can_list_audit_logs()
    {
        Sanctum::actingAs($this->manager);
        
        AuditLog::factory(2)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->manager->id
        ]);

        $response = $this->getJson('/api/v1/audit-logs');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_worker_cannot_access_audit_logs()
    {
        Sanctum::actingAs($this->worker);

        $response = $this->getJson('/api/v1/audit-logs');

        $response->assertStatus(403);
    }

    public function test_can_show_single_audit_log()
    {
        Sanctum::actingAs($this->admin);
        
        $auditLog = AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id
        ]);

        $response = $this->getJson("/api/v1/audit-logs/{$auditLog->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $auditLog->id,
                    'action' => $auditLog->action
                ]
            ]);
    }

    public function test_cannot_show_audit_log_from_different_tenant()
    {
        Sanctum::actingAs($this->admin);
        
        $otherTenant = Tenant::factory()->active()->create();
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        
        $auditLog = AuditLog::factory()->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this->getJson("/api/v1/audit-logs/{$auditLog->id}");

        $response->assertStatus(404);
    }

    public function test_can_create_audit_log()
    {
        Sanctum::actingAs($this->admin);
        
        $auditData = [
            'action' => 'test_action',
            'model_type' => 'App\Models\User',
            'model_id' => '123',
            'old_values' => ['name' => 'Old Name'],
            'new_values' => ['name' => 'New Name'],
            'metadata' => ['source' => 'test']
        ];

        $response = $this->postJson('/api/v1/audit-logs', $auditData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'action' => 'test_action',
                    'model_type' => 'App\Models\User'
                ]
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'test_action',
            'model_type' => 'App\Models\User',
            'tenant_id' => $this->tenant->id
        ]);
    }

    public function test_admin_can_delete_audit_log()
    {
        Sanctum::actingAs($this->admin);
        
        $auditLog = AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id
        ]);

        $response = $this->deleteJson("/api/v1/audit-logs/{$auditLog->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('audit_logs', [
            'id' => $auditLog->id
        ]);

        // Should create a deletion log
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'deleted_audit_log',
            'user_id' => $this->admin->id
        ]);
    }

    public function test_manager_cannot_delete_audit_log()
    {
        Sanctum::actingAs($this->manager);
        
        $auditLog = AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->manager->id
        ]);

        $response = $this->deleteJson("/api/v1/audit-logs/{$auditLog->id}");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Only administrators can delete audit logs'
            ]);
    }

    public function test_can_get_audit_statistics()
    {
        Sanctum::actingAs($this->admin);
        
        AuditLog::factory(5)->create([
            'tenant_id' => $this->tenant->id,
            'action' => 'login',
            'created_at' => now()->subDays(2)
        ]);
        AuditLog::factory(3)->create([
            'tenant_id' => $this->tenant->id,
            'action' => 'logout',
            'created_at' => now()->subDays(1)
        ]);

        $response = $this->getJson('/api/v1/audit-logs/stats/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_logs',
                'unique_users',
                'unique_ips',
                'actions_breakdown',
                'models_breakdown',
                'daily_activity'
            ]);
    }

    public function test_can_get_user_activity()
    {
        Sanctum::actingAs($this->admin);
        
        $targetUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        
        AuditLog::factory(3)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $targetUser->id,
            'action' => 'login'
        ]);

        $response = $this->getJson("/api/v1/audit-logs/user/{$targetUser->id}/activity");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'action',
                        'description',
                        'user_id',
                        'tenant_id',
                        'created_at'
                    ]
                ]
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_get_model_history()
    {
        Sanctum::actingAs($this->admin);
        
        $modelType = 'User';
        $modelId = '123';
        
        AuditLog::factory(2)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id,
            'model_type' => $modelType,
            'model_id' => $modelId
        ]);

        $response = $this->getJson("/api/v1/audit-logs/model/{$modelType}/{$modelId}/history");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'action',
                        'model_type',
                        'model_id',
                        'user_id',
                        'tenant_id',
                        'created_at'
                    ]
                ]
            ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_can_search_audit_logs()
    {
        Sanctum::actingAs($this->admin);
        
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'action' => 'login_test_action',
            'user_id' => $this->admin->id
        ]);
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'action' => 'logout',
            'user_id' => $this->admin->id
        ]);

        $response = $this->getJson('/api/v1/audit-logs/search/logs?q=login_test_action');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertStringContainsString('login', $data[0]['action']);
    }

    public function test_validates_required_fields_on_create()
    {
        Sanctum::actingAs($this->admin);
        
        $response = $this->postJson('/api/v1/audit-logs', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['action']);
    }

    public function test_can_filter_logs_by_action()
    {
        Sanctum::actingAs($this->admin);
        
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id,
            'action' => 'login'
        ]);
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id,
            'action' => 'logout'
        ]);

        $response = $this->getJson('/api/v1/audit-logs/search/logs?action=login');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertEquals('login', $data[0]['action']);
    }

    public function test_can_filter_logs_by_user()
    {
        Sanctum::actingAs($this->admin);
        
        $targetUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $targetUser->id
        ]);
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id
        ]);

        $response = $this->getJson("/api/v1/audit-logs?user_id={$targetUser->id}");

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertEquals($targetUser->id, $data[0]['user']['id']);
    }

    public function test_requires_authentication()
    {
        $response = $this->getJson('/api/v1/audit-logs');
        $response->assertStatus(401);
    }

    public function test_lists_only_tenant_audit_logs()
    {
        Sanctum::actingAs($this->admin);
        
        // Create logs for current tenant
        AuditLog::factory(2)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id
        ]);

        // Create logs for other tenant
        $otherTenant = Tenant::factory()->active()->create();
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        AuditLog::factory(3)->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this->getJson('/api/v1/audit-logs');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        // Should only see logs from own tenant
        $this->assertCount(2, $data);
        foreach ($data as $log) {
            $this->assertEquals($this->tenant->id, $log['tenant_id']);
        }
    }

    public function test_update_returns_forbidden()
    {
        Sanctum::actingAs($this->admin);
        
        $auditLog = AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->admin->id
        ]);

        $response = $this->putJson("/api/v1/audit-logs/{$auditLog->id}", [
            'action' => 'updated_action'
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Audit logs cannot be modified to maintain data integrity'
            ]);
    }
}
