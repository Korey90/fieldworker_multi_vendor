<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\RoleMiddleware;
use App\Models\Role;
use App\Models\User;
use App\Models\Tenat;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    private RoleMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new RoleMiddleware();
    }

    public function test_middleware_allows_user_with_correct_role()
    {
        // Arrange
        $tenant = Tenat::factory()->create();
        $role = Role::factory()->create(['name' => 'admin', 'tenant_id' => $tenant->id]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->roles()->attach($role);
        
        Auth::login($user);
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'admin');

        // Assert
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_middleware_allows_user_with_one_of_multiple_roles()
    {
        // Arrange
        $tenant = Tenat::factory()->create();
        $role = Role::factory()->create(['name' => 'manager', 'tenant_id' => $tenant->id]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->roles()->attach($role);
        
        Auth::login($user);
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'admin|manager'); // używamy | zamiast , bo middleware używa explode('|')

        // Assert
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_middleware_denies_user_without_required_role()
    {
        // Arrange
        $tenant = Tenat::factory()->create();
        $role = Role::factory()->create(['name' => 'worker', 'tenant_id' => $tenant->id]);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->roles()->attach($role);
        
        Auth::login($user);
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'admin');

        // Assert - middleware zwraca JSON z kodem 403, nie rzuca wyjątku
        $this->assertEquals(403, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Insufficient role privileges', $responseData['message']);
        $this->assertContains('admin', $responseData['required_roles']);
        $this->assertContains('worker', $responseData['user_roles']);
    }

    public function test_middleware_denies_unauthenticated_user()
    {
        // Arrange
        Auth::logout(); // upewniamy się, że user nie jest zalogowany
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'admin');

        // Assert - middleware zwraca JSON z kodem 401, nie rzuca wyjątku
        $this->assertEquals(401, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Unauthenticated', $responseData['message']);
    }
}
