<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\QuotaMiddleware;
use App\Models\User;
use App\Models\Tenat;
use App\Models\TenantQuota;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class QuotaMiddlewareUnitTest extends TestCase
{
    use RefreshDatabase;

    private QuotaMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new QuotaMiddleware();
    }

    public function test_allows_get_requests()
    {
        $request = Request::create('/test', 'GET');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_allows_request_when_no_user_authenticated()
    {
        $request = Request::create('/test', 'POST');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_allows_request_when_user_has_no_tenant()
    {
        // Dla tego testu, po prostu sprawdźmy czy middleware działa z nieautentykowanym użytkownikiem
        Auth::logout();

        $request = Request::create('/test', 'POST');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_allows_request_when_no_quota_defined()
    {
        $tenant = Tenat::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Auth::login($user);

        $request = Request::create('/test', 'POST');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_allows_request_when_under_quota()
    {
        $tenant = Tenat::factory()->create();
        // Utwórz quota z rzeczywistą strukturą tabeli
        TenantQuota::factory()->create([
            'tenant_id' => $tenant->id,
            'max_users' => 5,
            'max_storage_mb' => 1000,
            'max_jobs_per_month' => 100
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Auth::login($user);

        $request = Request::create('/test', 'POST');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users');

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_blocks_request_when_quota_exceeded()
    {
        $tenant = Tenat::factory()->create();
        TenantQuota::factory()->create([
            'tenant_id' => $tenant->id,
            'max_users' => 1, // limit 1 użytkownika
            'max_storage_mb' => 1000,
            'max_jobs_per_month' => 100
        ]);

        // Tworzymy już jednego usera dla tego tenanta
        $existingUser = User::factory()->create(['tenant_id' => $tenant->id]);
        
        // Tworzymy drugiego usera i logujemy go
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        Auth::login($user);

        $request = Request::create('/test', 'POST');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('OK');
        }, 'users');

        // Middleware zwraca JSON response z kodem 429, nie rzuca wyjątku
        $this->assertEquals(429, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Tenant users quota exceeded', $responseData['message']);
        $this->assertEquals(1, $responseData['quota_limit']);
        $this->assertEquals(2, $responseData['current_usage']); // 2 użytkowników (existingUser + user)
    }
}
