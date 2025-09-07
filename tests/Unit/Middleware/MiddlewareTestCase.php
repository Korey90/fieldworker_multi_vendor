<?php

namespace Tests\Unit\Middleware;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase as BaseTestCase;

abstract class MiddlewareTestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Tworzymy domyślny tenant dla testów middleware bez basic roles
        $this->tenant = Tenant::factory()->create([
            'name' => 'Test Tenant',
            'slug' => 'test-tenant-' . uniqid(),
            'sector' => 'construction',
            'data' => json_encode([
                'status' => 'active',
                'max_users' => 100,
                'max_storage' => 5000,
                'features' => [
                    'advanced_reporting' => true,
                    'api_access' => true,
                    'custom_branding' => false,
                ]
            ])
        ]);
        
        // Ustawiamy tenant w globalnym kontekście
        app()->instance('tenant.current', $this->tenant);
        
        // NIE tworzymy basic roles - testy middleware będą tworzyć własne
    }
}
