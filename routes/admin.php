<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\WorkerController;
use App\Http\Controllers\Admin\JobController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\QuotaController;
use App\Http\Controllers\Admin\AssetController;
use App\Http\Controllers\Admin\SectorController;
use App\Http\Controllers\Admin\FormController;
use App\Http\Controllers\Admin\FormResponseController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\SkillController;
use App\Http\Controllers\Admin\CertificationController;
use App\Http\Controllers\Admin\NotificationController;

use Illuminate\Support\Facades\Route;
//inertia
use Inertia\Inertia;


Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

    // Admin/Manager Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin/Manager Workers Management
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
    });

    // Admin/Manager Jobs Management
    Route::prefix('jobs')->name('jobs.')->group(function () {
        Route::get('/', [JobController::class, 'index'])
            ->name('index');
        Route::get('/create', [JobController::class, 'create'])
            ->name('create');
        Route::post('/', [JobController::class, 'store'])
            ->name('store');
        Route::get('/kanban', [JobController::class, 'kanban'])
            ->name('kanban');
        Route::get('/calendar', [JobController::class, 'calendar'])
            ->name('calendar');
        Route::get('/{job}', [JobController::class, 'show'])
            ->name('show');
        Route::get('/{job}/edit', [JobController::class, 'edit'])
            ->name('edit');
        Route::put('/{job}', [JobController::class, 'update'])
            ->name('update');
        Route::delete('/{job}', [JobController::class, 'destroy'])
            ->name('destroy');
        
        // Worker assignment routes
        Route::post('/{job}/assign-worker', [JobController::class, 'assignWorker'])
            ->name('assign-worker');
        Route::delete('/{job}/assignments/{assignment}', [JobController::class, 'unassignWorker'])
            ->name('unassign-worker');
    });

    // Admin/Manager Tenants Management
    Route::prefix('tenants')->name('tenants.')->group(function () {
        Route::get('/', [TenantController::class, 'index'])
            ->name('index');
        Route::get('/create', [TenantController::class, 'create'])
            ->name('create');
        Route::post('/', [TenantController::class, 'store'])
            ->name('store');
        Route::get('/{tenant}', [TenantController::class, 'show'])
            ->name('show');
        Route::get('/{tenant}/edit', [TenantController::class, 'edit'])
            ->name('edit');
        Route::put('/{tenant}', [TenantController::class, 'update'])
            ->name('update');
        Route::delete('/{tenant}', [TenantController::class, 'destroy'])
            ->name('destroy');
        Route::post('/{tenant}/suspend', [TenantController::class, 'suspend'])
            ->name('suspend');
        Route::post('/{tenant}/activate', [TenantController::class, 'activate'])
            ->name('activate');
        Route::get('/{tenant}/quotas', [TenantController::class, 'quotas'])
            ->name('quotas');
    });

    // Admin/Manager Users Management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])
            ->name('index');
        Route::get('/create', [UserController::class, 'create'])
            ->name('create');
        Route::post('/', [UserController::class, 'store'])
            ->name('store');
        Route::get('/{user}', [UserController::class, 'show'])
            ->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])
            ->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])
            ->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])
            ->name('destroy');
        
        // Role assignment routes
        Route::post('/{user}/assign-role', [UserController::class, 'assignRole'])
            ->name('assign-role');
        Route::delete('/{user}/remove-role', [UserController::class, 'removeRole'])
            ->name('remove-role');
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus'])
            ->name('toggle-status');
    });

    // Admin/Manager Roles Management
    Route::prefix('roles')->name('roles.')->group(function () {
        Route::get('/', [RoleController::class, 'index'])
            ->name('index');
        Route::get('/create', [RoleController::class, 'create'])
            ->name('create');
        Route::post('/', [RoleController::class, 'store'])
            ->name('store');
        Route::get('/{role}', [RoleController::class, 'show'])
            ->name('show');
        Route::get('/{role}/edit', [RoleController::class, 'edit'])
            ->name('edit');
        Route::put('/{role}', [RoleController::class, 'update'])
            ->name('update');
        Route::delete('/{role}', [RoleController::class, 'destroy'])
            ->name('destroy');
        
        // Permission assignment routes
        Route::post('/{role}/assign-permission', [RoleController::class, 'assignPermission'])
            ->name('assign-permission');
        Route::delete('/{role}/remove-permission', [RoleController::class, 'removePermission'])
            ->name('remove-permission');
    });

    // Admin/Manager Permissions Management
    Route::prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/', [PermissionController::class, 'index'])
            ->name('index');
        Route::get('/create', [PermissionController::class, 'create'])
            ->name('create');
        Route::post('/', [PermissionController::class, 'store'])
            ->name('store');
        Route::get('/{permission}', [PermissionController::class, 'show'])
            ->name('show');
        Route::get('/{permission}/edit', [PermissionController::class, 'edit'])
            ->name('edit');
        Route::put('/{permission}', [PermissionController::class, 'update'])
            ->name('update');
        Route::delete('/{permission}', [PermissionController::class, 'destroy'])
            ->name('destroy');
        Route::patch('/{permission}/toggle-status', [PermissionController::class, 'toggleStatus'])
            ->name('toggle-status');
    });

    // Admin/Manager Quota Management
    Route::prefix('quotas')->name('quotas.')->group(function () {
        Route::get('/', [QuotaController::class, 'index'])
            ->name('index');
        Route::get('/tenant/{tenant}', [QuotaController::class, 'show'])
            ->name('show');
        Route::put('/tenant/{tenant}', [QuotaController::class, 'update'])
            ->name('update');
        Route::post('/tenant/{tenant}', [QuotaController::class, 'store'])
            ->name('store');
        Route::put('/{quota}/usage', [QuotaController::class, 'updateUsage'])
            ->name('update-usage');
        Route::post('/{quota}/reset', [QuotaController::class, 'reset'])
            ->name('reset');
        Route::post('/tenant/{tenant}/sync/{quotaType}', [QuotaController::class, 'sync'])
            ->name('sync');
        Route::post('/bulk-update', [QuotaController::class, 'bulkUpdate'])
            ->name('bulk-update');
        Route::get('/tenant/{tenant}/recommendations', [QuotaController::class, 'recommendations'])
            ->name('recommendations');
    });

    // Admin/Manager Assets Management
    Route::prefix('assets')->name('assets.')->group(function () {
        Route::get('/', [AssetController::class, 'index'])
            ->name('index');
        Route::get('/create', [AssetController::class, 'create'])
            ->name('create');
        Route::post('/', [AssetController::class, 'store'])
            ->name('store');
        Route::get('/{asset}', [AssetController::class, 'show'])
            ->name('show');
        Route::get('/{asset}/edit', [AssetController::class, 'edit'])
            ->name('edit');
        Route::put('/{asset}', [AssetController::class, 'update'])
            ->name('update');
        Route::delete('/{asset}', [AssetController::class, 'destroy'])
            ->name('destroy');
        
        // Asset assignment routes
        Route::post('/{asset}/assign', [AssetController::class, 'assign'])
            ->name('assign');
        Route::post('/{asset}/unassign', [AssetController::class, 'unassign'])
            ->name('unassign');
        Route::patch('/{asset}/toggle-status', [AssetController::class, 'toggleStatus'])
            ->name('toggle-status');
    });

    // Admin/Manager Sectors Management
    Route::prefix('sectors')->name('sectors.')->group(function () {
        Route::get('/', [SectorController::class, 'index'])
            ->name('index');
        Route::get('/create', [SectorController::class, 'create'])
            ->name('create');
        Route::post('/', [SectorController::class, 'store'])
            ->name('store');
        Route::get('/{sector}', [SectorController::class, 'show'])
            ->name('show');
        Route::get('/{sector}/edit', [SectorController::class, 'edit'])
            ->name('edit');
        Route::put('/{sector}', [SectorController::class, 'update'])
            ->name('update');
        Route::delete('/{sector}', [SectorController::class, 'destroy'])
            ->name('destroy');
    });

    // Admin/Manager Forms Management
    Route::prefix('forms')->name('forms.')->group(function () {
        Route::get('/', [FormController::class, 'index'])
            ->name('index');
        Route::get('/create', [FormController::class, 'create'])
            ->name('create');
        Route::get('/builder', function () {
            $formId = request('form_id');
            $form = null;
            $tenants = \App\Models\Tenant::all();
            
            if ($formId) {
                $form = \App\Models\Form::with('tenant')->find($formId);
            }
            
            return Inertia::render('admin/forms/builder', [
                'form' => $form,
                'tenants' => $tenants
            ]);
        })->name('builder');
        Route::post('/', [FormController::class, 'store'])
            ->name('store');
        Route::get('/{form}/preview', [FormController::class, 'preview'])
            ->name('preview');
        Route::get('/{form}', [FormController::class, 'show'])
            ->name('show');
        Route::get('/{form}/edit', [FormController::class, 'edit'])
            ->name('edit');
        Route::put('/{form}', [FormController::class, 'update'])
            ->name('update');
        Route::delete('/{form}', [FormController::class, 'destroy'])
            ->name('destroy');
        Route::post('/{form}/duplicate', [FormController::class, 'duplicate'])
            ->name('duplicate');
    });

    // Admin/Manager Form Responses Management
    Route::prefix('form-responses')->name('form-responses.')->group(function () {
        Route::get('/', [FormResponseController::class, 'index'])
            ->name('index');
        Route::get('/create', [FormResponseController::class, 'create'])
            ->name('create');
        Route::get('/create-new', [FormResponseController::class, 'createNew'])
            ->name('create-new');
        Route::post('/', [FormResponseController::class, 'store'])
            ->name('store');
        Route::get('/{formResponse}', [FormResponseController::class, 'show'])
            ->name('show');
        Route::get('/{formResponse}/edit', [FormResponseController::class, 'edit'])
            ->name('edit');
        Route::put('/{formResponse}', [FormResponseController::class, 'update'])
            ->name('update');
        Route::delete('/{formResponse}', [FormResponseController::class, 'destroy'])
            ->name('destroy');
        Route::post('/{formResponse}/submit', [FormResponseController::class, 'submit'])
            ->name('submit');
    });

    // Admin/Manager Locations Management
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
        
        // Additional location routes
        Route::get('/{location}/workers', [LocationController::class, 'workers'])
            ->name('workers');
        Route::get('/{location}/assets', [LocationController::class, 'assets'])
            ->name('assets');
        Route::get('/{location}/jobs', [LocationController::class, 'jobs'])
            ->name('jobs');
    });

    // Admin/Manager Skills Management
    Route::prefix('skills')->name('skills.')->group(function () {
        Route::get('/', [SkillController::class, 'index'])
            ->name('index');
        Route::get('/create', [SkillController::class, 'create'])
            ->name('create');
        Route::post('/', [SkillController::class, 'store'])
            ->name('store');
        Route::get('/{skill}', [SkillController::class, 'show'])
            ->name('show');
        Route::get('/{skill}/edit', [SkillController::class, 'edit'])
            ->name('edit');
        Route::put('/{skill}', [SkillController::class, 'update'])
            ->name('update');
        Route::delete('/{skill}', [SkillController::class, 'destroy'])
            ->name('destroy');
    });

    // Admin/Manager Certifications Management
    Route::prefix('certifications')->name('certifications.')->group(function () {
        Route::get('/', [CertificationController::class, 'index'])
            ->name('index');
        Route::get('/create', [CertificationController::class, 'create'])
            ->name('create');
        Route::post('/', [CertificationController::class, 'store'])
            ->name('store');
        Route::get('/{certification}', [CertificationController::class, 'show'])
            ->name('show');
        Route::get('/{certification}/edit', [CertificationController::class, 'edit'])
            ->name('edit');
        Route::put('/{certification}', [CertificationController::class, 'update'])
            ->name('update');
        Route::delete('/{certification}', [CertificationController::class, 'destroy'])
            ->name('destroy');
    });

    // Admin/Manager Notifications Management
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
        
        // Additional notification routes
        Route::post('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])
            ->name('mark-as-read');
        Route::post('/{notification}/mark-as-unread', [NotificationController::class, 'markAsUnread'])
            ->name('mark-as-unread');
        Route::post('/bulk-delete', [NotificationController::class, 'bulkDelete'])
            ->name('bulk-delete');
    });

});
