<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Skill;
use App\Models\Worker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Skill $technicalSkill;
    private Skill $softSkill;
    private Skill $inactiveSkill;

    protected function setUp(): void
    {
        parent::setUp();

        // Use the tenant from parent TestCase (which has roles created)
        $this->adminUser = $this->actingAsUser('admin', $this->tenant);
        
        $this->technicalSkill = Skill::factory()->technical()->create([
            'name' => 'Equipment Maintenance',
            'category' => 'Equipment',
            'description' => 'Technical skill for equipment maintenance',
            'is_active' => true,
        ]);
        
        $this->softSkill = Skill::factory()->soft()->create([
            'name' => 'Team Leadership',
            'category' => 'Leadership',
            'description' => 'Soft skill for team leadership',
            'is_active' => true,
        ]);
        
        $this->inactiveSkill = Skill::factory()->inactive()->create([
            'name' => 'Deprecated Process',
            'category' => 'Legacy',
            'description' => 'Inactive skill for legacy processes',
        ]);
    }

    public function test_can_list_all_skills(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/skills');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'category',
                            'description',
                            'skill_type',
                            'is_active',
                            'created_at',
                            'updated_at',
                            'workers_count',
                            'is_technical',
                            'is_soft',
                            'is_certification',
                        ]
                    ]
                ])
                ->assertJsonFragment(['name' => 'Equipment Maintenance'])
                ->assertJsonFragment(['name' => 'Team Leadership'])
                ->assertJsonFragment(['name' => 'Deprecated Process']);
    }

    public function test_can_filter_skills_by_active_status(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/skills?is_active=1');

        $response->assertStatus(200)
                ->assertJsonFragment(['name' => 'Equipment Maintenance'])
                ->assertJsonFragment(['name' => 'Team Leadership'])
                ->assertJsonMissing(['name' => 'Deprecated Process']);

        $response = $this->getJson('/api/v1/system/skills?is_active=0');

        $response->assertStatus(200)
                ->assertJsonFragment(['name' => 'Deprecated Process'])
                ->assertJsonMissing(['name' => 'Equipment Maintenance'])
                ->assertJsonMissing(['name' => 'Team Leadership']);
    }

    public function test_can_filter_skills_by_skill_type(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/skills?skill_type=technical');

        $response->assertStatus(200)
                ->assertJsonFragment(['name' => 'Equipment Maintenance'])
                ->assertJsonMissing(['name' => 'Team Leadership']);

        $response = $this->getJson('/api/v1/system/skills?skill_type=soft');

        $response->assertStatus(200)
                ->assertJsonFragment(['name' => 'Team Leadership'])
                ->assertJsonMissing(['name' => 'Equipment Maintenance']);
    }

    public function test_can_search_skills(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/skills?search=Equipment');

        $response->assertStatus(200)
                ->assertJsonFragment(['name' => 'Equipment Maintenance'])
                ->assertJsonMissing(['name' => 'Team Leadership']);
    }

    public function test_admin_can_create_skill(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $skillData = [
            'name' => 'Safety Training',
            'description' => 'Essential safety training skill',
            'skill_type' => 'certification',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/system/skills', $skillData);

        $response->assertStatus(201)
                ->assertJsonFragment([
                    'name' => 'Safety Training',
                    'category' => 'certification', // category is an alias for skill_type in response
                    'description' => 'Essential safety training skill',
                    'skill_type' => 'certification',
                    'is_active' => true,
                    'is_technical' => false,
                    'is_soft' => false,
                    'is_certification' => true,
                ]);

        $this->assertDatabaseHas('skills', [
            'name' => 'Safety Training',
            'description' => 'Essential safety training skill',
            'skill_type' => 'certification',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_skill(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/skills/{$this->technicalSkill->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'category',
                        'description',
                        'skill_type',
                        'is_active',
                        'created_at',
                        'updated_at',
                        'workers_count',
                        'is_technical',
                        'is_soft',
                        'is_certification',
                    ]
                ])
                ->assertJsonFragment(['name' => 'Equipment Maintenance']);
    }

    public function test_admin_can_update_skill(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $updateData = [
            'name' => 'Advanced Equipment Maintenance',
            'description' => 'Updated technical skill description',
            'skill_type' => 'technical',
            'is_active' => false,
        ];

        $response = $this->putJson("/api/v1/system/skills/{$this->technicalSkill->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'name' => 'Advanced Equipment Maintenance',
                    'category' => 'technical', // category is an alias for skill_type in response
                    'description' => 'Updated technical skill description',
                    'skill_type' => 'technical',
                    'is_active' => false,
                    'is_technical' => true,
                    'is_soft' => false,
                    'is_certification' => false,
                ]);

        $this->assertDatabaseHas('skills', array_merge(['id' => $this->technicalSkill->id], $updateData));
    }

    public function test_admin_can_delete_skill_without_workers(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->deleteJson("/api/v1/system/skills/{$this->technicalSkill->id}");

        $response->assertStatus(200)
                ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('skills', ['id' => $this->technicalSkill->id]);
    }

    public function test_cannot_delete_skill_with_associated_workers(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        // Create a worker and associate with the skill
        $worker = Worker::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->technicalSkill->workers()->attach($worker->id);

        $response = $this->deleteJson("/api/v1/system/skills/{$this->technicalSkill->id}");

        $response->assertStatus(422)
                ->assertJsonFragment(['error' => 'SKILL_HAS_WORKERS']);

        $this->assertDatabaseHas('skills', ['id' => $this->technicalSkill->id]);
    }

    public function test_cannot_create_skill_with_duplicate_name(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $skillData = [
            'name' => 'Equipment Maintenance', // Already exists
            'category' => 'Equipment',
            'description' => 'Should fail due to duplicate name',
            'skill_type' => 'technical',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/system/skills', $skillData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name']);
    }

    public function test_validates_skill_type_on_create(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $skillData = [
            'name' => 'Invalid Skill',
            'category' => 'Test',
            'description' => 'Should fail due to invalid skill type',
            'skill_type' => 'invalid_type', // Invalid skill type
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/system/skills', $skillData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['skill_type']);
    }

    public function test_unauthenticated_user_cannot_access_skills(): void
    {
        // Start fresh test with no authentication
        $this->refreshApplication();
        
        $response = $this->getJson('/api/v1/system/skills');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/system/skills', []);
        $response->assertStatus(401);

        $response = $this->getJson("/api/v1/system/skills/{$this->technicalSkill->id}");
        $response->assertStatus(401);

        $response = $this->putJson("/api/v1/system/skills/{$this->technicalSkill->id}", []);
        $response->assertStatus(401);

        $response = $this->deleteJson("/api/v1/system/skills/{$this->technicalSkill->id}");
        $response->assertStatus(401);
    }
}
