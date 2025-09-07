<?php

namespace Tests\Feature;

use App\Models\Feature;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class FeatureControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Use existing admin role from TestCase
        $adminRole = Role::where('tenant_id', $this->tenant->id)->where('slug', 'admin')->first();

        $permission = Permission::factory()->create([
            'permission_key' => 'system.features.index',
            'name' => 'View Features',
            'slug' => 'system-features-index',
        ]);

        $adminRole->permissions()->attach($permission);

        // Create admin user
        $this->adminUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->adminUser->roles()->attach($adminRole);
    }

    public function test_can_list_features()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test features
        $features = Feature::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/system/features');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'feature_key',
                        'is_active',
                        'feature_type',
                        'config',
                        'created_at',
                        'updated_at',
                        'tenants',
                        'tenants_count',
                        'is_premium',
                        'is_addon',
                        'config_count',
                    ]
                ],
                'links',
                'meta'
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_can_filter_features_by_type()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->core()->create(['name' => 'Core Feature']);
        Feature::factory()->premium()->create(['name' => 'Premium Feature']);
        Feature::factory()->addon()->create(['name' => 'Addon Feature']);

        $response = $this->getJson('/api/v1/system/features?feature_type=premium');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('premium', $response->json('data.0.feature_type'));
    }

    public function test_can_filter_features_by_active_status()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->active()->create(['name' => 'Active Feature']);
        Feature::factory()->inactive()->create(['name' => 'Inactive Feature']);

        $response = $this->getJson('/api/v1/system/features?is_active=1');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertTrue($response->json('data.0.is_active'));
    }

    public function test_can_search_features()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->create([
            'name' => 'GPS Tracking',
            'description' => 'Track location',
            'feature_key' => 'gps-tracking'
        ]);
        Feature::factory()->create([
            'name' => 'Photo Upload',
            'description' => 'Upload photos',
            'feature_key' => 'photo-upload'
        ]);

        $response = $this->getJson('/api/v1/system/features?search=GPS');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('GPS Tracking', $response->json('data.0.name'));
    }

    public function test_can_sort_features()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->create(['name' => 'Zebra Feature']);
        Feature::factory()->create(['name' => 'Alpha Feature']);

        $response = $this->getJson('/api/v1/system/features?sort_by=name&sort_direction=asc');

        $response->assertStatus(200);
        $this->assertEquals('Alpha Feature', $response->json('data.0.name'));
        $this->assertEquals('Zebra Feature', $response->json('data.1.name'));
    }

    public function test_pagination_works()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->count(20)->create();

        $response = $this->getJson('/api/v1/system/features?per_page=5');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
        $this->assertEquals(4, $response->json('meta.last_page'));
    }

    public function test_feature_resource_includes_computed_fields()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->premium()->withConfig([
            'max_users' => 100,
            'storage_limit' => '50GB'
        ])->create();

        $response = $this->getJson('/api/v1/system/features');

        $response->assertStatus(200);
        $feature = $response->json('data.0');

        $this->assertTrue($feature['is_premium']);
        $this->assertFalse($feature['is_addon']);
        $this->assertEquals(2, $feature['config_count']);
    }

    public function test_unauthorized_user_cannot_access_features()
    {
        $response = $this->getJson('/api/v1/system/features');

        $response->assertStatus(401);
    }

    public function test_user_without_admin_role_cannot_access_features()
    {
        $regularUser = User::factory()->create();
        Sanctum::actingAs($regularUser);

        $response = $this->getJson('/api/v1/system/features');

        $response->assertStatus(403);
    }

    public function test_returns_empty_when_no_features_exist()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/system/features');

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    public function test_invalid_sort_field_uses_default()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->create(['name' => 'Test Feature']);

        $response = $this->getJson('/api/v1/system/features?sort_by=invalid_field');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_can_filter_by_multiple_criteria()
    {
        Sanctum::actingAs($this->adminUser);

        Feature::factory()->premium()->active()->create(['name' => 'Active Premium Feature']);
        Feature::factory()->premium()->inactive()->create(['name' => 'Inactive Premium Feature']);
        Feature::factory()->core()->active()->create(['name' => 'Active Core Feature']);

        $response = $this->getJson('/api/v1/system/features?feature_type=premium&is_active=1');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $feature = $response->json('data.0');
        $this->assertEquals('premium', $feature['feature_type']);
        $this->assertTrue($feature['is_active']);
    }
}
