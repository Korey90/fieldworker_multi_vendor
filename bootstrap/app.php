<?php

use App\Http\Middleware\CheckPermissionsMiddleware;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\QuotaMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\TenantMiddleware;
use App\Http\Middleware\TenantAdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Aliasy middleware
        $middleware->alias([
            'tenant' => TenantMiddleware::class,
            'tenant.admin' => TenantAdminMiddleware::class,
            'permission' => CheckPermissionsMiddleware::class,
            'role' => RoleMiddleware::class,
            'quota' => QuotaMiddleware::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Globalne middleware dla API - usuwamy TenantMiddleware z globalnych
        // TenantMiddleware będzie stosowane wybiórczo w routes
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
