<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Sector;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectorControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Sector $activeSector;
    private Sector $inactiveSector;

    protected function setUp(): void
    {
        parent::setUp();

        // Use the tenant from parent TestCase (which has roles created)
        $this->adminUser = $this->actingAsUser('admin', $this->tenant);
        
        $this->activeSector = Sector::factory()->create([
            'code' => 'TEST1',
            'name' => 'Construction Sector',
            'description' => 'This is a construction sector for testing',
            'is_active' => true,
        ]);
        
        $this->inactiveSector = Sector::factory()->inactive()->create([
            'code' => 'TEST2',
            'name' => 'Maintenance Sector',
            'description' => 'This is a maintenance sector for testing',
        ]);
    }

    public function test_can_list_all_sectors(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/sectors');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'code',
                            'name',
                            'description',
                            'is_active',
                            'created_at',
                            'updated_at',
                            'locations_count',
                            'tenants_count',
                        ]
                    ]
                ])
                ->assertJsonFragment(['code' => 'TEST1'])
                ->assertJsonFragment(['code' => 'TEST2']);
    }

    public function test_can_filter_sectors_by_active_status(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/sectors?is_active=1');

        $response->assertStatus(200)
                ->assertJsonFragment(['code' => 'TEST1'])
                ->assertJsonMissing(['code' => 'TEST2']);

        $response = $this->getJson('/api/v1/system/sectors?is_active=0');

        $response->assertStatus(200)
                ->assertJsonFragment(['code' => 'TEST2'])
                ->assertJsonMissing(['code' => 'TEST1']);
    }

    public function test_can_search_sectors(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson('/api/v1/system/sectors?search=Construction');

        $response->assertStatus(200)
                ->assertJsonFragment(['code' => 'TEST1'])
                ->assertJsonMissing(['code' => 'TEST2']);
    }

    public function test_admin_can_create_sector(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $sectorData = [
            'code' => 'NEW',
            'name' => 'New Sector',
            'description' => 'A new test sector',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/system/sectors', $sectorData);

        $response->assertStatus(201)
                ->assertJsonFragment($sectorData);

        $this->assertDatabaseHas('sectors', $sectorData);
    }

    public function test_admin_can_view_sector(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->getJson("/api/v1/system/sectors/{$this->activeSector->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'code',
                        'name',
                        'description',
                        'is_active',
                        'created_at',
                        'updated_at',
                        'locations_count',
                        'tenants_count',
                    ]
                ])
                ->assertJsonFragment(['code' => 'TEST1']);
    }

    public function test_admin_can_update_sector(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $updateData = [
            'code' => 'UPD',
            'name' => 'Updated Sector',
            'description' => 'Updated description',
            'is_active' => false,
        ];

        $response = $this->putJson("/api/v1/system/sectors/{$this->activeSector->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment($updateData);

        $this->assertDatabaseHas('sectors', array_merge(['id' => $this->activeSector->id], $updateData));
    }

    public function test_admin_can_delete_sector_without_associations(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->deleteJson("/api/v1/system/sectors/{$this->activeSector->id}");

        $response->assertStatus(200)
                ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('sectors', ['id' => $this->activeSector->id]);
    }

    public function test_cannot_delete_sector_with_associations(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        // Create a location associated with the sector
        Location::factory()->create([
            'tenant_id' => $this->tenant->id,
            'sector_id' => $this->activeSector->id,
        ]);

        $response = $this->deleteJson("/api/v1/system/sectors/{$this->activeSector->id}");

        $response->assertStatus(422)
                ->assertJsonFragment(['error' => 'SECTOR_HAS_ASSOCIATIONS']);

        $this->assertDatabaseHas('sectors', ['id' => $this->activeSector->id]);
    }

    public function test_cannot_create_sector_with_duplicate_code(): void
    {
        $this->actingAs($this->adminUser, 'sanctum');

        $sectorData = [
            'code' => 'TEST1', // Already exists
            'name' => 'Duplicate Code Sector',
            'description' => 'Should fail due to duplicate code',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/system/sectors', $sectorData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['code']);
    }

    public function test_unauthenticated_user_cannot_access_sectors(): void
    {
        // Start fresh test with no authentication
        $this->refreshApplication();
        
        $response = $this->getJson('/api/v1/system/sectors');
        $response->assertStatus(401);

        $response = $this->postJson('/api/v1/system/sectors', []);
        $response->assertStatus(401);

        $response = $this->getJson("/api/v1/system/sectors/{$this->activeSector->id}");
        $response->assertStatus(401);

        $response = $this->putJson("/api/v1/system/sectors/{$this->activeSector->id}", []);
        $response->assertStatus(401);

        $response = $this->deleteJson("/api/v1/system/sectors/{$this->activeSector->id}");
        $response->assertStatus(401);
    }
}
