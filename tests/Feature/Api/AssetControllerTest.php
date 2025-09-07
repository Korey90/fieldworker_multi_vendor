<?php

namespace Tests\Feature\Api;

use App\Models\Asset;
use App\Models\Tenant;
use App\Models\Location;
use App\Models\Worker;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class AssetControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private Tenant $testTenant;
    private Location $location;

    protected function setUp(): void
    {
        parent::setUp();

        // Create tenant with active status
        $this->testTenant = Tenant::factory()->active()->create();

        // Create admin role and user
        $adminRole = Role::factory()->create(['name' => 'Admin', 'slug' => 'admin']);
        $this->adminUser = User::factory()->create(['tenant_id' => $this->testTenant->id]);
        $this->adminUser->roles()->attach($adminRole);

        // Create location for assets (simple setup)
        $this->location = Location::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'sector_id' => null,
        ]);
    }

    public function test_admin_can_list_assets()
    {
        Sanctum::actingAs($this->adminUser);

        // Create some assets
        Asset::factory(2)->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson('/api/v1/assets');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'asset_type',
                            'status',
                        ]
                    ],
                    'meta' => []
                ]);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_admin_can_create_asset()
    {
        Sanctum::actingAs($this->adminUser);

        $assetData = [
            'name' => 'Test Laptop',
            'description' => 'A test laptop for development',
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'asset_type' => 'Laptop',
            'serial_number' => 'LP001',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/v1/assets', $assetData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'asset_type',
                        'status',
                    ]
                ]);

        $this->assertDatabaseHas('assets', [
            'name' => 'Test Laptop',
            'asset_type' => 'Laptop',
            'tenant_id' => $this->testTenant->id,
        ]);
    }

    public function test_admin_can_view_asset()
    {
        Sanctum::actingAs($this->adminUser);

        $asset = Asset::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
        ]);

        $response = $this->getJson("/api/v1/assets/{$asset->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'asset_type',
                        'status',
                    ]
                ]);
    }

    public function test_admin_can_update_asset()
    {
        Sanctum::actingAs($this->adminUser);

        $asset = Asset::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
        ]);

        $updateData = [
            'name' => 'Updated Asset Name',
            'status' => 'maintenance',
        ];

        $response = $this->putJson("/api/v1/assets/{$asset->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'status',
                    ]
                ]);

        $this->assertDatabaseHas('assets', [
            'id' => $asset->id,
            'name' => 'Updated Asset Name',
            'status' => 'maintenance',
        ]);
    }

    public function test_admin_can_delete_unassigned_asset()
    {
        Sanctum::actingAs($this->adminUser);

        $asset = Asset::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'location_id' => $this->location->id,
            'assigned_to' => null,
        ]);

        $response = $this->deleteJson("/api/v1/assets/{$asset->id}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Asset deleted successfully'
                ]);

        $this->assertSoftDeleted('assets', ['id' => $asset->id]);
    }

    public function test_unauthenticated_user_cannot_access_assets()
    {
        $response = $this->getJson('/api/v1/assets');

        $response->assertStatus(401);
    }
}
