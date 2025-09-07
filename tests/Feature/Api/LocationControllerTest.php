<?php

namespace Tests\Feature\Api;

use App\Models\Location;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Sector;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LocationControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private Tenant $testTenant;
    private User $admin;
    private Sector $testSector;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test tenant with active status
        $this->testTenant = Tenant::factory()->active()->create();

        // Create roles and permissions for locations
        $adminRole = Role::factory()->create(['name' => 'admin', 'slug' => 'admin']);
        
        $locationPermission = Permission::factory()->create([
            'key' => 'location.manage',
            'description' => 'Manage Locations'
        ]);

        // Assign permission to admin role
        $adminRole->permissions()->attach($locationPermission->id);

        // Create admin user for the tenant
        $this->admin = User::factory()->create([
            'tenant_id' => $this->testTenant->id,
            'email' => 'admin@test.com'
        ]);
        $this->admin->roles()->attach($adminRole->id);

        // Create a test sector (without tenant_id since schema doesn't have it)
        $this->testSector = Sector::factory()->create();
    }

    public function test_admin_can_list_locations()
    {
        Sanctum::actingAs($this->admin);

        // Create a few locations for the tenant
        Location::factory()->count(3)->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson('/api/v1/locations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'address',
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

    public function test_admin_can_create_location()
    {
        Sanctum::actingAs($this->admin);

        $locationData = [
            'name' => 'Test Location',
            'address' => '123 Test Street',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '12345',
            'country' => 'Test Country',
            'tenant_id' => $this->testTenant->id,
            'sector_id' => $this->testSector->id,
            'location_type' => 'office'
        ];

        $response = $this->postJson('/api/v1/locations', $locationData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Location created successfully',
                'data' => [
                    'name' => 'Test Location',
                    'address' => '123 Test Street'
                ]
            ]);

        $this->assertDatabaseHas('locations', [
            'name' => 'Test Location',
            'tenant_id' => $this->testTenant->id
        ]);
    }

    public function test_admin_can_view_location()
    {
        Sanctum::actingAs($this->admin);

        $location = Location::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->getJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'address',
                    'created_at',
                    'updated_at'
                ]
            ])
            ->assertJson([
                'data' => [
                    'id' => $location->id,
                    'name' => $location->name
                ]
            ]);
    }

    public function test_admin_can_update_location()
    {
        Sanctum::actingAs($this->admin);

        $location = Location::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $updateData = [
            'name' => 'Updated Location Name',
            'address' => 'Updated Address',
            'city' => 'Updated City',
            'state' => 'Updated State',
            'postal_code' => '54321',
            'country' => 'Updated Country',
            'tenant_id' => $this->testTenant->id,
            'sector_id' => $this->testSector->id,
            'location_type' => 'warehouse'
        ];

        $response = $this->putJson("/api/v1/locations/{$location->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Location updated successfully',
                'data' => [
                    'name' => 'Updated Location Name',
                    'address' => 'Updated Address'
                ]
            ]);

        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'name' => 'Updated Location Name',
            'address' => 'Updated Address'
        ]);
    }

    public function test_admin_can_delete_location()
    {
        Sanctum::actingAs($this->admin);

        $location = Location::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);

        $response = $this->deleteJson("/api/v1/locations/{$location->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Location deleted successfully'
            ]);

        $this->assertSoftDeleted('locations', [
            'id' => $location->id
        ]);
    }

    public function test_admin_cannot_create_location_with_invalid_data()
    {
        Sanctum::actingAs($this->admin);

        $invalidData = [
            'name' => '' // missing required fields
        ];

        $response = $this->postJson('/api/v1/locations', $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'address', 'city', 'state', 'postal_code', 'country', 'tenant_id', 'sector_id', 'location_type']);
    }

    public function test_non_admin_cannot_access_locations()
    {
        $regularRole = Role::factory()->create(['name' => 'worker', 'slug' => 'worker']);
        
        $regularUser = User::factory()->create([
            'tenant_id' => $this->testTenant->id
        ]);
        $regularUser->roles()->attach($regularRole->id);

        Sanctum::actingAs($regularUser);

        $response = $this->getJson('/api/v1/locations');

        $response->assertStatus(403);
    }
}
