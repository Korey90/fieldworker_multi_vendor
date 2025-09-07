<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\TenantMiddleware;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class TenantMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    private TenantMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new TenantMiddleware();
    }

    public function test_middleware_sets_tenant_context_for_authenticated_user()
    {
        // Arrange
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Auth::login($user);
        
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        });

        // Assert
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($tenant->id, app('current_tenant')->id);
        $this->assertEquals($tenant->id, $request->input('current_tenant_id'));
    }

    public function test_middleware_denies_unauthenticated_requests()
    {
        // Arrange
        Auth::logout(); // upewniamy się, że nie ma zalogowanego użytkownika
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        });

        // Assert - middleware zwraca JSON z kodem 403, nie pozwala na nieuwierzytelnione żądania
        $this->assertEquals(403, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('No tenant associated with user', $responseData['message']);
    }

    public function test_middleware_fails_for_inactive_tenant()
    {
        // Arrange
        $inactiveTenant = Tenant::factory()->create(['status' => 'inactive']);
        $user = User::factory()->create(['tenant_id' => $inactiveTenant->id]);
        Auth::login($user);
        
        $request = Request::create('/api/v1/test');

        // Act
        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        });

        // Assert - middleware zwraca JSON z kodem 403, nie rzuca wyjątku
        $this->assertEquals(403, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Tenant account is not active', $responseData['message']);
    }
}
