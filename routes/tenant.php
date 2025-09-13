<?php

use App\Http\Controllers\Tenant\NotificationController;
use App\Http\Controllers\Tenant\DashboardController;
use Illuminate\Support\Facades\Route;

// Tenant Admin Routes - for users managing their own tenant/organization
Route::middleware(['auth', App\Http\Middleware\TenantAdminMiddleware::class])
    ->prefix('tenant')
    ->name('tenant.')
    ->group(function () {

    // Tenant Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Tenant Notifications Management (scoped to tenant)
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])
            ->name('index');
        Route::get('/create', [NotificationController::class, 'create'])
            ->name('create');
        Route::post('/', [NotificationController::class, 'store'])
            ->name('store');
        Route::get('/{notification}', [NotificationController::class, 'show'])
            ->name('show');
        Route::get('/{notification}/edit', [NotificationController::class, 'edit'])
            ->name('edit');
        Route::put('/{notification}', [NotificationController::class, 'update'])
            ->name('update');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])
            ->name('destroy');
        Route::post('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])
            ->name('markAsRead');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])
            ->name('markAllAsRead');
    });

});