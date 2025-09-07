<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Worker;
use App\Models\Job;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Models\Tenant;
use App\Models\Role;
use App\Models\JobAssignment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $managerUser;
    private User $workerUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Get existing roles from TestCase
        $adminRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'admin')->first();
        $managerRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'manager')->first();
        $workerRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'worker')->first();

        // Create users with different roles
        $this->adminUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->adminUser->roles()->attach($adminRole);

        $this->managerUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->managerUser->roles()->attach($managerRole);

        $this->workerUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->workerUser->roles()->attach($workerRole);
    }

    public function test_admin_can_access_dashboard_index()
    {
        Sanctum::actingAs($this->adminUser);

        // Create some test data
        Worker::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);
        Job::factory()->count(5)->create(['tenant_id' => $this->tenant->id]);
        Asset::factory()->count(4)->create(['tenant_id' => $this->tenant->id]);
        Notification::factory()->count(2)->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'overview' => [
                        'tenants',
                        'users',
                        'workers',
                        'jobs',
                        'assets',
                        'locations'
                    ],
                    'recent_jobs',
                    'recent_notifications',
                    'worker_status',
                    'asset_status'
                ]
            ]);
    }

    public function test_manager_can_access_dashboard_index()
    {
        Sanctum::actingAs($this->managerUser);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'overview',
                    'recent_jobs',
                    'recent_notifications',
                    'worker_status',
                    'asset_status'
                ]
            ]);
    }

    public function test_worker_can_access_dashboard_index()
    {
        Sanctum::actingAs($this->workerUser);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'overview',
                    'recent_jobs',
                    'recent_notifications',
                    'worker_status',
                    'asset_status'
                ]
            ]);
    }

    public function test_can_get_detailed_stats()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test data
        Worker::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);
        Job::factory()->count(5)->create(['tenant_id' => $this->tenant->id]);
        Asset::factory()->count(4)->create(['tenant_id' => $this->tenant->id]);
        Location::factory()->count(2)->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson('/api/v1/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'overview' => [
                        'tenants',
                        'users',
                        'workers',
                        'jobs',
                        'assets',
                        'locations'
                    ],
                    'jobs_by_status',
                    'jobs_by_date',
                    'worker_performance',
                    'asset_utilization',
                    'form_completion_rates'
                ]
            ]);
    }

    public function test_can_get_stats_with_custom_period()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/dashboard/stats?period=7');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'overview',
                    'jobs_by_status',
                    'jobs_by_date',
                    'worker_performance',
                    'asset_utilization',
                    'form_completion_rates'
                ]
            ]);
    }

    public function test_can_get_recent_activity()
    {
        Sanctum::actingAs($this->adminUser);

        // Create some audit logs
        AuditLog::factory()->count(3)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->adminUser->id
        ]);

        $response = $this->getJson('/api/v1/dashboard/recent-activity');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'action',
                        'model',
                        'model_id',
                        'user',
                        'created_at',
                        'description'
                    ]
                ]
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_get_recent_activity_with_custom_limit()
    {
        Sanctum::actingAs($this->adminUser);

        // Create more audit logs
        AuditLog::factory()->count(10)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->adminUser->id
        ]);

        $response = $this->getJson('/api/v1/dashboard/recent-activity?limit=5');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
    }

    public function test_overview_stats_include_correct_counts()
    {
        Sanctum::actingAs($this->adminUser);

        // Create specific counts of data
        Worker::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);
        Job::factory()->count(5)->create(['tenant_id' => $this->tenant->id]);
        Asset::factory()->count(7)->create(['tenant_id' => $this->tenant->id]);
        Location::factory()->count(2)->create(['tenant_id' => $this->tenant->id]);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200);

        $overview = $response->json('data.overview');
        $this->assertEquals(1, $overview['tenants']); // Should be 1 for current tenant
        $this->assertEquals(3, $overview['workers']);
        $this->assertEquals(5, $overview['jobs']);
        $this->assertEquals(7, $overview['assets']);
        $this->assertEquals(2, $overview['locations']);
    }

    public function test_worker_status_stats_group_by_status()
    {
        Sanctum::actingAs($this->adminUser);

        // Create workers with different statuses
        Worker::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'active']);
        Worker::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'active']);
        Worker::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'inactive']);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200);

        $workerStatus = $response->json('data.worker_status');
        $this->assertEquals(2, $workerStatus['active'] ?? 0);
        $this->assertEquals(1, $workerStatus['inactive'] ?? 0);
    }

    public function test_asset_status_stats_group_by_status()
    {
        Sanctum::actingAs($this->adminUser);

        // Create assets with different statuses
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'active']);
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'active']);
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'inactive']);
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'status' => 'maintenance']);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200);

        $assetStatus = $response->json('data.asset_status');
        $this->assertEquals(2, $assetStatus['active'] ?? 0);
        $this->assertEquals(1, $assetStatus['inactive'] ?? 0);
        $this->assertEquals(1, $assetStatus['maintenance'] ?? 0);
    }

    public function test_asset_utilization_calculates_correctly()
    {
        Sanctum::actingAs($this->adminUser);

        // Create workers for asset assignment
        $worker1 = Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        $worker2 = Worker::factory()->create(['tenant_id' => $this->tenant->id]);

        // Create assets - some assigned, some not
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'assigned_to' => null]);
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'assigned_to' => $worker1->id]);
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'assigned_to' => $worker2->id]);
        Asset::factory()->create(['tenant_id' => $this->tenant->id, 'assigned_to' => null]);

        $response = $this->getJson('/api/v1/dashboard/stats');

        $response->assertStatus(200);

        $utilization = $response->json('data.asset_utilization');
        $this->assertEquals(4, $utilization['total_assets']);
        $this->assertEquals(2, $utilization['assigned_assets']);
        $this->assertEquals(2, $utilization['available_assets']);
        $this->assertEquals(50.0, $utilization['utilization_rate']);
    }

    public function test_jobs_by_status_filters_by_period()
    {
        Sanctum::actingAs($this->adminUser);

        // Create jobs with different creation dates
        Job::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'pending',
            'created_at' => now()->subDays(5)
        ]);
        Job::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'completed',
            'created_at' => now()->subDays(10)
        ]);
        Job::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'pending',
            'created_at' => now()->subDays(40) // Outside 30 day period
        ]);

        $response = $this->getJson('/api/v1/dashboard/stats?period=30');

        $response->assertStatus(200);

        $jobsByStatus = $response->json('data.jobs_by_status');
        // Should only include jobs from last 30 days
        $this->assertEquals(1, $jobsByStatus['pending'] ?? 0);
        $this->assertEquals(1, $jobsByStatus['completed'] ?? 0);
    }

    public function test_unauthorized_user_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(401);
    }

    public function test_dashboard_data_is_tenant_isolated()
    {
        // Create another tenant with data
        $otherTenant = Tenant::factory()->create();
        Worker::factory()->count(5)->create(['tenant_id' => $otherTenant->id]);
        Job::factory()->count(10)->create(['tenant_id' => $otherTenant->id]);

        // Create data for current tenant
        Worker::factory()->count(2)->create(['tenant_id' => $this->tenant->id]);
        Job::factory()->count(3)->create(['tenant_id' => $this->tenant->id]);

        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200);

        $overview = $response->json('data.overview');
        // Should only see data from current tenant
        $this->assertEquals(2, $overview['workers']);
        $this->assertEquals(3, $overview['jobs']);
    }

    public function test_recent_activity_shows_correct_user_names()
    {
        Sanctum::actingAs($this->adminUser);

        // Create audit log with user (older)
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->adminUser->id,
            'action' => 'created',
            'model_type' => 'App\Models\Job',
            'model_id' => 1,
            'created_at' => now()->subMinutes(5)
        ]);

        // Create audit log without user (system action - newer)
        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => null,
            'action' => 'updated',
            'model_type' => 'App\Models\Worker',
            'model_id' => 2,
            'created_at' => now()
        ]);

        $response = $this->getJson('/api/v1/dashboard/recent-activity');

        $response->assertStatus(200);

        $activities = $response->json('data');
        $this->assertCount(2, $activities);

        // Check user names
        $this->assertEquals($this->adminUser->name, $activities[1]['user']); // Most recent first
        $this->assertEquals('System', $activities[0]['user']);
    }

    public function test_activity_descriptions_are_formatted_correctly()
    {
        Sanctum::actingAs($this->adminUser);

        AuditLog::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->adminUser->id,
            'action' => 'created',
            'model_type' => 'App\Models\Job',
            'model_id' => 123
        ]);

        $response = $this->getJson('/api/v1/dashboard/recent-activity');

        $response->assertStatus(200);

        $activity = $response->json('data.0');
        $this->assertEquals('Created Job #123', $activity['description']);
    }
}
