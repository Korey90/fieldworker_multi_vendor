<?php

use App\Http\Controllers\Tenant\NotificationController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\JobController;
use App\Http\Controllers\Tenant\WorkerController;
use App\Http\Controllers\Tenant\LocationController;
use App\Http\Controllers\Tenant\FormController;
use App\Http\Controllers\Tenant\FormResponseController;
use App\Http\Controllers\Tenant\AssetController;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

// Tenant Admin Routes - for users managing their own tenant/organization
Route::middleware(['auth', 'role:tenant,admin'])
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

    // Tenant Jobs Management (scoped to tenant)
    Route::prefix('jobs')->name('jobs.')->group(function () {
        Route::get('/', [JobController::class, 'index'])
            ->name('index');
        Route::get('/create', [JobController::class, 'create'])
            ->name('create');
        Route::post('/', [JobController::class, 'store'])
            ->name('store');
        Route::get('/{job}', [JobController::class, 'show'])
            ->name('show');
        Route::get('/{job}/edit', [JobController::class, 'edit'])
            ->name('edit');
        Route::put('/{job}', [JobController::class, 'update'])
            ->name('update');
        Route::delete('/{job}', [JobController::class, 'destroy'])
            ->name('destroy');
        
        // Additional job actions
        Route::post('/{job}/assign-workers', [JobController::class, 'assignWorkers'])
            ->name('assignWorkers');
        Route::patch('/{job}/status', [JobController::class, 'updateStatus'])
            ->name('updateStatus');
    });

    // Tenant Workers Management (scoped to tenant)
    Route::prefix('workers')->name('workers.')->group(function () {
        Route::get('/', [WorkerController::class, 'index'])
            ->name('index');
        Route::get('/create', [WorkerController::class, 'create'])
            ->name('create');
        Route::post('/', [WorkerController::class, 'store'])
            ->name('store');
        Route::get('/{worker}', [WorkerController::class, 'show'])
            ->name('show');
        Route::get('/{worker}/edit', [WorkerController::class, 'edit'])
            ->name('edit');
        Route::put('/{worker}', [WorkerController::class, 'update'])
            ->name('update');
        Route::delete('/{worker}', [WorkerController::class, 'destroy'])
            ->name('destroy');
        
        // Additional worker actions
        Route::get('/stats', [WorkerController::class, 'stats'])
            ->name('stats');
    });

    // Tenant Locations Management (scoped to tenant)
    Route::prefix('locations')->name('locations.')->group(function () {
        Route::get('/', [LocationController::class, 'index'])
            ->name('index');
        Route::get('/create', [LocationController::class, 'create'])
            ->name('create');
        Route::post('/', [LocationController::class, 'store'])
            ->name('store');
        Route::get('/{location}', [LocationController::class, 'show'])
            ->name('show');
        Route::get('/{location}/edit', [LocationController::class, 'edit'])
            ->name('edit');
        Route::put('/{location}', [LocationController::class, 'update'])
            ->name('update');
        Route::delete('/{location}', [LocationController::class, 'destroy'])
            ->name('destroy');
        
        // Additional location actions
        Route::get('/stats', [LocationController::class, 'stats'])
            ->name('stats');
    });

    // Tenant Forms Management (scoped to tenant)
    Route::prefix('forms')->name('forms.')->group(function () {
        Route::get('/', [FormController::class, 'index'])
            ->name('index');
        Route::get('/builder', function () {
            $formId = request('form_id');
            $form = null;
            $tenant = \App\Models\Tenant::where('id', auth()->user()->tenant_id)->first();            
            if ($formId) {
                $form = \App\Models\Form::with('tenant')->find($formId);
            }

            return Inertia::render('tenant/forms/builder', [
                'tenant' => $tenant,
                'form' => $form,
            ]);
        })->name('builder');
        Route::get('/create', [FormController::class, 'create'])
            ->name('create');
        Route::post('/', [FormController::class, 'store'])
            ->name('store');
        Route::get('/{form}', [FormController::class, 'show'])
            ->name('show');
        Route::get('/{form}/edit', [FormController::class, 'edit'])
            ->name('edit');
        Route::put('/{form}', [FormController::class, 'update'])
            ->name('update');
        Route::delete('/{form}', [FormController::class, 'destroy'])
            ->name('destroy');
    });

    // Form Responses Management (scoped to tenant and form)
    Route::prefix('forms/{form}/responses')->name('form-responses.')->group(function () {
        Route::get('/', [FormResponseController::class, 'index'])
            ->name('index');
        Route::get('/create', [FormResponseController::class, 'create'])
            ->name('create');
        Route::post('/', [FormResponseController::class, 'store'])
            ->name('store');
        Route::get('/export', [FormResponseController::class, 'export'])
            ->name('export');
        Route::get('/{response}', [FormResponseController::class, 'show'])
            ->name('show');
        Route::get('/{response}/edit', [FormResponseController::class, 'edit'])
            ->name('edit');
        Route::put('/{response}', [FormResponseController::class, 'update'])
            ->name('update');
        Route::delete('/{response}', [FormResponseController::class, 'destroy'])
            ->name('destroy');
    });

    // Assets Management (scoped to tenant)
    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/', [AssetController::class, 'index'])
            ->name('index');
        Route::get('/create', [AssetController::class, 'create'])
            ->name('create');
        Route::post('/', [AssetController::class, 'store'])
            ->name('store');
        Route::get('/export', [AssetController::class, 'export'])
            ->name('export');
        Route::get('/{asset}', [AssetController::class, 'show'])
            ->name('show');
        Route::get('/{asset}/edit', [AssetController::class, 'edit'])
            ->name('edit');
        Route::put('/{asset}', [AssetController::class, 'update'])
            ->name('update');
        Route::delete('/{asset}', [AssetController::class, 'destroy'])
            ->name('destroy');
    });


});

