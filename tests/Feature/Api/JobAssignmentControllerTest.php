<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Worker;
use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JobAssignmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $workerUser;
    protected Tenant $tenant;
    protected Worker $worker;
    protected Job $job;
    protected JobAssignment $activeAssignment;
    protected JobAssignment $completedAssignment;

    protected function setUp(): void
    {
        parent::setUp();

        // Create tenant
        $this->tenant = Tenant::factory()->active()->create();

        // Create admin role and user
        $adminRole = Role::factory()->create(['name' => 'Admin', 'slug' => 'admin']);
        $this->adminUser = User::factory()->create([
            'tenant_id' => $this->tenant->id,
        ]);
        $this->adminUser->roles()->attach($adminRole);

        // Create worker role and user
        $workerRole = Role::factory()->create(['name' => 'Worker', 'slug' => 'worker']);
        $this->workerUser = User::factory()->create([
            'tenant_id' => $this->tenant->id,
        ]);
        $this->workerUser->roles()->attach($workerRole);
        
        $this->worker = Worker::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->workerUser->id,
            'status' => 'active',
        ]);

        // Create job
        $this->job = Job::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'open',
        ]);

        // Create job assignments
        $this->activeAssignment = JobAssignment::factory()->create([
            'job_id' => $this->job->id,
            'worker_id' => $this->worker->id,
            'status' => 'assigned',
        ]);

        $this->completedAssignment = JobAssignment::factory()->completed()->create([
            'job_id' => $this->job->id,
            'worker_id' => Worker::factory()->create(['tenant_id' => $this->tenant->id])->id,
        ]);
    }

    public function test_can_list_all_job_assignments(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/job-assignments');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'job_id',
                            'worker_id',
                            'role',
                            'status',
                            'assigned_at',
                            'completed_at',
                            'notes',
                            'data',
                            'created_at',
                            'updated_at',
                            'worker',
                            'job',
                            'is_completed',
                        ]
                    ],
                    'meta' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                    ]
                ]);
    }

    public function test_can_filter_assignments_by_status(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        // Create specific assignments with known status using different workers
        $worker2 = Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        $worker3 = Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        
        $assignedAssignment = JobAssignment::factory()->assigned()->create([
            'job_id' => $this->job->id,
            'worker_id' => $worker2->id,
        ]);
        $completedAssignment = JobAssignment::factory()->completed()->create([
            'job_id' => $this->job->id,
            'worker_id' => $worker3->id,
        ]);

        $response = $this->getJson('/api/v1/system/job-assignments?status=assigned');

        $response->assertStatus(200)
                ->assertJsonFragment(['status' => 'assigned'])
                ->assertJsonMissing(['status' => 'completed']);

        $response = $this->getJson('/api/v1/system/job-assignments?status=completed');

        $response->assertStatus(200)
                ->assertJsonFragment(['status' => 'completed'])
                ->assertJsonMissing(['status' => 'assigned']);
    }

    public function test_can_filter_assignments_by_job(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/job-assignments?job_id={$this->job->id}");

        $response->assertStatus(200)
                ->assertJsonFragment(['job_id' => $this->job->id]);
    }

    public function test_can_filter_assignments_by_worker(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/job-assignments?worker_id={$this->worker->id}");

        $response->assertStatus(200)
                ->assertJsonFragment(['worker_id' => $this->worker->id]);
    }

    public function test_admin_can_create_job_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $newWorker = Worker::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'active',
        ]);

        $assignmentData = [
            'job_id' => $this->job->id,
            'worker_id' => $newWorker->id,
            'role' => 'specialist',
            'status' => 'assigned',
            'notes' => 'Important assignment',
        ];

        $response = $this->postJson('/api/v1/system/job-assignments', $assignmentData);

        $response->assertStatus(201)
                ->assertJsonFragment([
                    'job_id' => $this->job->id,
                    'worker_id' => $newWorker->id,
                    'role' => 'specialist',
                    'status' => 'assigned',
                    'notes' => 'Important assignment',
                ]);

        $this->assertDatabaseHas('job_assignments', [
            'job_id' => $this->job->id,
            'worker_id' => $newWorker->id,
            'role' => 'specialist',
            'status' => 'assigned',
            'notes' => 'Important assignment',
        ]);
    }

    public function test_admin_can_view_job_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'job_id',
                        'worker_id',
                        'role',
                        'status',
                        'assigned_at',
                        'completed_at',
                        'notes',
                        'data',
                        'created_at',
                        'updated_at',
                        'worker',
                        'job',
                        'is_completed',
                    ]
                ])
                ->assertJsonFragment(['id' => $this->activeAssignment->id]);
    }

    public function test_admin_can_update_job_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $updateData = [
            'status' => 'in_progress',
            'notes' => 'Assignment in progress',
        ];

        $response = $this->putJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'status' => 'in_progress',
                    'notes' => 'Assignment in progress',
                ]);

        $this->assertDatabaseHas('job_assignments', [
            'id' => $this->activeAssignment->id,
            'status' => 'in_progress',
            'notes' => 'Assignment in progress',
        ]);
    }

    public function test_admin_can_delete_assignment_not_completed(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->deleteJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}");

        $response->assertStatus(200)
                ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('job_assignments', ['id' => $this->activeAssignment->id]);
    }

    public function test_cannot_delete_completed_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->deleteJson("/api/v1/system/job-assignments/{$this->completedAssignment->id}");

        $response->assertStatus(422)
                ->assertJsonFragment(['error' => 'Cannot delete completed assignment']);

        $this->assertDatabaseHas('job_assignments', ['id' => $this->completedAssignment->id]);
    }

    public function test_admin_can_start_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->patchJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}/start");

        $response->assertStatus(200)
                ->assertJsonFragment(['status' => 'in_progress'])
                ->assertJsonStructure(['message', 'data']);

        $this->assertDatabaseHas('job_assignments', [
            'id' => $this->activeAssignment->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_admin_can_complete_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        // First start the assignment
        $this->activeAssignment->update(['status' => 'in_progress']);

        $completionData = [
            'completion_notes' => 'Task completed successfully',
        ];

        $response = $this->patchJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}/complete", $completionData);

        $response->assertStatus(200)
                ->assertJsonFragment(['status' => 'completed'])
                ->assertJsonStructure(['message', 'data']);

        $this->assertDatabaseHas('job_assignments', [
            'id' => $this->activeAssignment->id,
            'status' => 'completed',
            'notes' => 'Task completed successfully',
        ]);
    }

    public function test_admin_can_cancel_assignment(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $cancellationData = [
            'cancellation_reason' => 'Worker unavailable',
        ];

        $response = $this->patchJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}/cancel", $cancellationData);

        $response->assertStatus(200)
                ->assertJsonFragment(['status' => 'cancelled'])
                ->assertJsonStructure(['message', 'data']);

        $this->assertDatabaseHas('job_assignments', [
            'id' => $this->activeAssignment->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_cannot_assign_worker_to_same_job_twice(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $assignmentData = [
            'job_id' => $this->job->id,
            'worker_id' => $this->worker->id,
            'role' => 'assistant',
            'status' => 'assigned',
        ];

        $response = $this->postJson('/api/v1/system/job-assignments', $assignmentData);

        $response->assertStatus(422)
                ->assertJsonFragment(['worker_id' => ['This worker is already assigned to this job.']]);
    }

    public function test_cannot_assign_inactive_worker(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $inactiveWorker = Worker::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'inactive',
        ]);

        $assignmentData = [
            'job_id' => $this->job->id,
            'worker_id' => $inactiveWorker->id,
            'role' => 'specialist',
            'status' => 'assigned',
        ];

        $response = $this->postJson('/api/v1/system/job-assignments', $assignmentData);

        $response->assertStatus(422)
                ->assertJsonFragment(['worker_id' => ['This worker is not available for assignment.']]);
    }

    public function test_validates_status_transitions(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        // Try to complete assignment without starting it
        $updateData = ['status' => 'completed'];

        $response = $this->putJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}", $updateData);

        $response->assertStatus(422)
                ->assertJsonFragment(['error' => 'Cannot change status from assigned to completed']);
    }

    public function test_can_get_assignments_by_worker(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/job-assignments/worker/{$this->worker->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'job_id',
                            'worker_id',
                            'status',
                            'job',
                        ]
                    ],
                    'meta'
                ])
                ->assertJsonFragment(['worker_id' => $this->worker->id]);
    }

    public function test_can_get_assignments_by_job(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/job-assignments/job/{$this->job->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'job_id',
                            'worker_id',
                            'status',
                            'worker',
                        ]
                    ]
                ])
                ->assertJsonFragment(['job_id' => $this->job->id]);
    }

    public function test_can_get_assignment_stats(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/job-assignments/stats/overview');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'total',
                        'by_status',
                        'completion_rate',
                        'average_completion_time',
                    ]
                ]);
    }

    public function test_unauthenticated_user_cannot_access_job_assignments(): void
    {
        $response = $this->getJson('/api/v1/system/job-assignments');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/system/job-assignments', []);
        $response->assertStatus(401);

        $response = $this->getJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}");
        $response->assertStatus(401);

        $response = $this->putJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}", []);
        $response->assertStatus(401);

        $response = $this->deleteJson("/api/v1/system/job-assignments/{$this->activeAssignment->id}");
        $response->assertStatus(401);
    }

    public function test_worker_cannot_access_admin_job_assignments(): void
    {
        $this->actingAs($this->workerUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/job-assignments');
        $response->assertStatus(403);

        $response = $this->postJson('/api/v1/system/job-assignments', []);
        $response->assertStatus(403);
    }
}


