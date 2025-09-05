<?php

namespace Tests;

use App\Models\Tenat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Tworzymy domyślny tenant dla testów
        $this->tenant = Tenat::factory()->create([
            'name' => 'Test Tenant',
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
    }

    /**
     * Utworzenie i uwierzytelnienie użytkownika dla testów
     */
    protected function actingAsUser($roleName = 'Worker', $tenant = null): User
    {
        $tenant = $tenant ?? $this->tenant;
        
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        // Przypisanie roli
        $roleModel = \App\Models\Role::where('name', $roleName)
                                     ->where('tenant_id', $tenant->id)
                                     ->first();
        if ($roleModel) {
            $user->roles()->attach($roleModel->id);
        }

        Sanctum::actingAs($user);

        return $user;
    }

    /**
     * Utworzenie dodatkowego tenanta dla testów izolacji
     */
    protected function createSecondTenant(): Tenat
    {
        return Tenat::factory()->create([
            'name' => 'Second Tenant',
            'slug' => 'second-tenant',
            'status' => 'active'
        ]);
    }
}
