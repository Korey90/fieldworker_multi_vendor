<?php

namespace Tests\Feature\Api;

use App\Models\Job;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Location;
use App\Models\Worker;
use App\Models\JobAssignment;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JobControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $manager;
    private User $worker;
    private Tenant $testTenant;
    private Location $location;
    private Worker $testWorker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create active tenant
        $this->testTenant = Tenant::factory()->active()->create();

        // Create location
        $this->location = Location::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        // Create roles and permissions
        $adminRole = Role::factory()->create(['name' => 'admin', 'slug' => 'admin']);
        $managerRole = Role::factory()->create(['name' => 'manager', 'slug' => 'manager']);
        $workerRole = Role::factory()->create(['name' => 'worker', 'slug' => 'worker']);

        $jobPermission = Permission::factory()->create([
            'key' => 'job.manage',
            'description' => 'Manage Jobs'
        ]);

        // Assign permission to admin and manager roles
        $adminRole->permissions()->attach($jobPermission->id);
        $managerRole->permissions()->attach($jobPermission->id);

        // Create users
        $this->admin = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $this->admin->roles()->attach($adminRole->id);

        $this->manager = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $this->manager->roles()->attach($managerRole->id);

        $this->worker = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $this->worker->roles()->attach($workerRole->id);

        // Create worker
        $this->testWorker = Worker::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'user_id' => $this->worker->id
        ]);
    }

    public function test_admin_can_list_jobs()
    {
        Sanctum::actingAs($this->admin);

        // Create jobs
        $job1 = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);
        $job2 = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        $response = $this->getJson('/api/v1/jobs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'description',
                        'status',
                        'scheduled_at',
                        'created_at',
                        'updated_at'
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);
    }

    public function test_admin_can_create_job()
    {
        Sanctum::actingAs($this->admin);

        $jobData = [
            'title' => 'Test Job',
            'description' => 'Test job description',
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'scheduled_at' => now()->addDays(1)->toISOString(),
            'status' => 'pending',
            'data' => ['priority' => 'high']
        ];

        $response = $this->postJson('/api/v1/jobs', $jobData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Job created successfully',
                'data' => [
                    'title' => 'Test Job',
                    'description' => 'Test job description',
                    'status' => 'pending'
                ]
            ]);

        $this->assertDatabaseHas('tenant_jobs', [
            'title' => 'Test Job',
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);
    }

    public function test_admin_can_view_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        $response = $this->getJson("/api/v1/jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'description',
                    'status',
                    'scheduled_at',
                    'created_at',
                    'updated_at'
                ]
            ])
            ->assertJson([
                'data' => [
                    'id' => $job->id,
                    'title' => $job->title
                ]
            ]);
    }

    public function test_admin_can_update_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'pending'
        ]);

        $updateData = [
            'title' => 'Updated Job Title',
            'status' => 'active'
        ];

        $response = $this->putJson("/api/v1/jobs/{$job->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Job updated successfully',
                'data' => [
                    'title' => 'Updated Job Title',
                    'status' => 'active'
                ]
            ]);

        $this->assertDatabaseHas('tenant_jobs', [
            'id' => $job->id,
            'title' => 'Updated Job Title',
            'status' => 'active'
        ]);
    }

    public function test_admin_can_delete_pending_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'pending'
        ]);

        $response = $this->deleteJson("/api/v1/jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Job deleted successfully'
            ]);

        $this->assertSoftDeleted('tenant_jobs', [
            'id' => $job->id
        ]);
    }

    public function test_admin_cannot_delete_active_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'active'
        ]);

        $response = $this->deleteJson("/api/v1/jobs/{$job->id}");

        $response->assertStatus(422)
            ->assertJson([
                'error' => 'Cannot delete active or completed job'
            ]);

        $this->assertDatabaseHas('tenant_jobs', [
            'id' => $job->id
        ]);
    }

    public function test_admin_can_assign_workers_to_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        $assignData = [
            'worker_ids' => [$this->testWorker->id],
            'notes' => 'Assigned for testing'
        ];

        $response = $this->patchJson("/api/v1/jobs/{$job->id}/assign", $assignData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Workers assigned successfully'
            ]);

        $this->assertDatabaseHas('job_assignments', [
            'job_id' => $job->id,
            'worker_id' => $this->testWorker->id,
            'status' => 'assigned'
        ]);
    }

    public function test_admin_can_complete_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'active'
        ]);

        // Create assignment
        JobAssignment::factory()->create([
            'job_id' => $job->id,
            'worker_id' => $this->testWorker->id,
            'status' => 'assigned'
        ]);

        $completeData = [
            'completion_notes' => 'Job completed successfully'
        ];

        $response = $this->patchJson("/api/v1/jobs/{$job->id}/complete", $completeData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Job completed successfully'
            ]);

        $this->assertDatabaseHas('tenant_jobs', [
            'id' => $job->id,
            'status' => 'completed'
        ]);

        $this->assertDatabaseHas('job_assignments', [
            'job_id' => $job->id,
            'worker_id' => $this->testWorker->id,
            'status' => 'completed'
        ]);
    }

    public function test_admin_can_cancel_job()
    {
        Sanctum::actingAs($this->admin);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'pending'
        ]);

        $cancelData = [
            'cancellation_reason' => 'Client cancelled the job'
        ];

        $response = $this->patchJson("/api/v1/jobs/{$job->id}/cancel", $cancelData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Job cancelled successfully'
            ]);

        $this->assertDatabaseHas('tenant_jobs', [
            'id' => $job->id,
            'status' => 'cancelled'
        ]);
    }

    public function test_manager_can_access_job_management()
    {
        Sanctum::actingAs($this->manager);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        $response = $this->getJson('/api/v1/jobs');
        $response->assertStatus(200);

        $response = $this->getJson("/api/v1/jobs/{$job->id}");
        $response->assertStatus(200);
    }

    public function test_worker_cannot_create_jobs()
    {
        Sanctum::actingAs($this->worker);

        $jobData = [
            'title' => 'Test Job',
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'scheduled_at' => now()->addDays(1)->toISOString(),
            'status' => 'pending'
        ];

        $response = $this->postJson('/api/v1/jobs', $jobData);
        $response->assertStatus(403);
    }

    public function test_worker_can_view_assigned_jobs()
    {
        Sanctum::actingAs($this->worker);

        $job = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        // Assign job to worker
        JobAssignment::factory()->create([
            'job_id' => $job->id,
            'worker_id' => $this->testWorker->id
        ]);

        $response = $this->getJson('/api/v1/jobs');
        $response->assertStatus(200);

        $response = $this->getJson("/api/v1/jobs/{$job->id}");
        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_jobs()
    {
        $response = $this->getJson('/api/v1/jobs');
        $response->assertStatus(401);
    }

    public function test_job_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/jobs', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'tenant_id', 'location_id', 'scheduled_at', 'status']);
    }

    public function test_job_creation_validates_future_scheduled_date()
    {
        Sanctum::actingAs($this->admin);

        $jobData = [
            'title' => 'Test Job',
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'scheduled_at' => now()->subDays(1)->toISOString(), // Past date
            'status' => 'pending'
        ];

        $response = $this->postJson('/api/v1/jobs', $jobData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scheduled_at']);
    }

    public function test_job_search_functionality()
    {
        Sanctum::actingAs($this->admin);

        $searchableJob = Job::factory()->create([
            'title' => 'Searchable Job Title',
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        $response = $this->getJson('/api/v1/jobs?search=Searchable');

        $response->assertStatus(200);
        
        $responseData = $response->json('data');
        $this->assertNotEmpty($responseData);
        
        $found = collect($responseData)->contains(function ($job) use ($searchableJob) {
            return $job['id'] === $searchableJob->id;
        });
        
        $this->assertTrue($found, 'Searchable job should be found in results');
    }

    public function test_job_filtering_by_status()
    {
        Sanctum::actingAs($this->admin);

        $pendingJob = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'pending'
        ]);

        $activeJob = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'status' => 'active'
        ]);

        $response = $this->getJson('/api/v1/jobs?status=pending');

        $response->assertStatus(200);
        
        $responseData = $response->json('data');
        
        // All jobs should have pending status
        foreach ($responseData as $job) {
            $this->assertEquals('pending', $job['status']);
        }
    }

    public function test_job_filtering_by_location()
    {
        Sanctum::actingAs($this->admin);

        $location2 = Location::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $job1 = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id
        ]);

        $job2 = Job::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $location2->id
        ]);

        $response = $this->getJson("/api/v1/jobs?location_id={$this->location->id}");

        $response->assertStatus(200);
        
        $responseData = $response->json('data');
        
        // All jobs should belong to the filtered location
        foreach ($responseData as $job) {
            $this->assertEquals($this->location->id, $job['location']['id']);
        }
    }
}
