<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\CheckPermissionsMiddleware;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Sanctum\Sanctum;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Tests\Unit\Middleware\MiddlewareTestCase;

class CheckPermissionsMiddlewareTest extends MiddlewareTestCase
{
    private CheckPermissionsMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new CheckPermissionsMiddleware();
    }

    public function test_middleware_allows_user_with_required_permission()
    {
        // Arrange
        $permission = Permission::factory()->create([
            'key' => 'users.view',
            'description' => 'View users permission'
        ]);

        $role = Role::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Test Administrator 1',
            'slug' => 'test-administrator-1',
        ]);

        $role->permissions()->attach($permission->id);

        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->roles()->attach($role->id);
        
        Sanctum::actingAs($user);

        $request = Request::create('/api/v1/users');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users.view', 'sanctum');

        // Assert
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_middleware_denies_user_without_required_permission()
    {
        // Arrange
        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        Sanctum::actingAs($user);
        
        $request = Request::create('/api/v1/admin/settings');

        // Assert
        $this->expectException(HttpException::class);

        // Act
        $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'admin.settings', 'sanctum');
    }

    public function test_middleware_allows_user_with_multiple_permissions()
    {
        // Arrange
        $permission1 = Permission::factory()->create([
            'key' => 'users.view',
            'description' => 'View users permission'
        ]);

        $permission2 = Permission::factory()->create([
            'key' => 'users.edit',
            'description' => 'Edit users permission'
        ]);

        $role = Role::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Manager'
        ]);

        $role->permissions()->attach([$permission1->id, $permission2->id]);

        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->roles()->attach($role->id);
        
        Sanctum::actingAs($user);

        $request = Request::create('/api/v1/users');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users.view|users.edit', 'sanctum');

        // Assert
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_middleware_denies_unauthenticated_user()
    {
        // Arrange
        $request = Request::create('/api/v1/admin/settings');

        // Assert
        $this->expectException(HttpException::class);

        // Act
        $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'admin.settings', 'sanctum');
    }

    public function test_middleware_handles_super_admin_access()
    {
        // Arrange - Administrator should have access to everything
        $role = Role::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Administrator',
            'slug' => 'administrator',
        ]);

        $user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user->roles()->attach($role->id);
        
        Sanctum::actingAs($user);

        $request = Request::create('/api/v1/admin/settings');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'any.permission', 'sanctum');

        // Assert
        $this->assertEquals(200, $response->getStatusCode());
    }
}
