<?php

namespace Tests;

use App\Models\Tenant;
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
        $this->tenant = Tenant::factory()->create([
            'name' => 'Test Tenant',
            'slug' => 'test-tenant',
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
        
        // Tworzymy podstawowe role
        $this->createBasicRoles();
    }

    /**
     * Tworzy podstawowe role dla testów
     */
    protected function createBasicRoles(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Full system access'
            ],
            [
                'name' => 'Manager', 
                'slug' => 'manager',
                'description' => 'Manage operations'
            ],
            [
                'name' => 'Worker',
                'slug' => 'worker', 
                'description' => 'Basic worker access'
            ]
        ];

        foreach ($roles as $roleData) {
            \App\Models\Role::create([
                'tenant_id' => $this->tenant->id,
                'name' => $roleData['name'],
                'slug' => $roleData['slug'],
                'description' => $roleData['description']
            ]);
        }
    }

    /**
     * Utworzenie i uwierzytelnienie użytkownika dla testów
     */
    protected function actingAsUser($roleName = 'worker', $tenant = null): User
    {
        $tenant = $tenant ?? $this->tenant;
        
        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        // Przypisanie roli - szukaj po slug
        $roleModel = \App\Models\Role::where('slug', $roleName)
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
    protected function createSecondTenant(): Tenant
    {
        return Tenant::factory()->create([
            'name' => 'Second Tenant',
            'slug' => 'second-tenant',
            'status' => 'active'
        ]);
    }
}
