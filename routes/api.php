<?php
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkerController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormResponseController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\JobAssignmentController;
use App\Http\Controllers\Api\TenantQuotaController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\SignatureController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes (for authentication, etc.)
Route::group(['prefix' => 'v1'], function () {
    // Authentication routes
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('auth/verify-email', [AuthController::class, 'verifyEmail']);
});

// Protected API routes
Route::group(['prefix' => 'v1', 'middleware' => ['auth:sanctum', 'tenant']], function () {
    
    // Authentication routes - dostępne po zalogowaniu
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('auth/profile', [AuthController::class, 'profile']);
    
    // Tenants management - tylko admin
    Route::group(['middleware' => ['role:admin']], function () {
        Route::apiResource('tenants', TenantController::class);
        Route::get('tenants/{id}/stats', [TenantController::class, 'stats']);
    });
    
    // Users management - admin/manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::apiResource('users', UserController::class);
        Route::get('users/{id}/profile', [UserController::class, 'profile']);
        Route::patch('users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    });
    
    // Workers management - admin/manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::apiResource('workers', WorkerController::class);
        Route::get('workers/{id}/stats', [WorkerController::class, 'stats']);
        Route::get('workers/available', [WorkerController::class, 'available']);
    });
    
    // Jobs management - admin/manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::apiResource('jobs', JobController::class);
        Route::patch('jobs/{id}/assign', [JobController::class, 'assign']);
        Route::patch('jobs/{id}/complete', [JobController::class, 'complete']);
        Route::patch('jobs/{id}/cancel', [JobController::class, 'cancel']);
    });
    
    // Assets management - admin/manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::apiResource('assets', AssetController::class);
        Route::patch('assets/{id}/assign', [AssetController::class, 'assign']);
        Route::patch('assets/{id}/unassign', [AssetController::class, 'unassign']);
        Route::get('assets/{id}/history', [AssetController::class, 'history']);
    });
    
    // Locations management - admin/manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::apiResource('locations', LocationController::class);
        Route::get('locations/{id}/workers', [LocationController::class, 'workers']);
        Route::get('locations/{id}/assets', [LocationController::class, 'assets']);
        Route::get('locations/{id}/jobs', [LocationController::class, 'jobs']);
    });
    
    // Forms management - admin/manager
    Route::group(['middleware' => ['role:admin,manager,worker']], function () {
        Route::apiResource('forms', FormController::class);
        Route::get('forms/{id}/responses', [FormController::class, 'responses']);
        Route::post('forms/{id}/duplicate', [FormController::class, 'duplicate']);
    });
    
    // Form responses management - wszyscy zalogowani
    Route::apiResource('form-responses', FormResponseController::class);
    Route::patch('form-responses/{id}/submit', [FormResponseController::class, 'submit']);
    
    // Notifications management - wszyscy zalogowani
    Route::apiResource('notifications', NotificationController::class)->only(['index', 'show', 'destroy']);
    Route::patch('notifications/{id}/mark-read', [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('notifications/stats', [NotificationController::class, 'stats']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications', [NotificationController::class, 'create']);
    Route::delete('notifications/bulk-delete', [NotificationController::class, 'bulkDelete']);
    
    // Forms management - additional routes
    Route::get('forms/{id}/stats', [FormController::class, 'stats']);
    
    // System routes
    Route::group(['prefix' => 'system'], function () {
        Route::get('sectors', [\App\Http\Controllers\Api\SectorController::class, 'index']);
        Route::get('features', [\App\Http\Controllers\Api\FeatureController::class, 'index']);
        Route::get('roles', [\App\Http\Controllers\Api\RoleController::class, 'index']);
        Route::get('permissions', [\App\Http\Controllers\Api\PermissionController::class, 'index']);
        Route::get('skills', [\App\Http\Controllers\Api\SkillController::class, 'index']);
        Route::get('certifications', [\App\Http\Controllers\Api\CertificationController::class, 'index']);
    });
    
    // Dashboard and analytics
    Route::group(['prefix' => 'dashboard'], function () {
        Route::get('/', [\App\Http\Controllers\Api\DashboardController::class, 'index']);
        Route::get('stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);
        Route::get('recent-activity', [\App\Http\Controllers\Api\DashboardController::class, 'recentActivity']);
    });
    
    // Authentication routes (protected)
    Route::group(['prefix' => 'auth'], function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('change-password', [AuthController::class, 'changePassword']);
        Route::patch('update-profile', [AuthController::class, 'updateProfile']);
    });
    
    // Attachments management - wszyscy zalogowani
    Route::group(['prefix' => 'attachments'], function () {
        Route::get('/', [AttachmentController::class, 'index']);
        Route::post('/', [AttachmentController::class, 'store']);
        Route::get('{attachment}', [AttachmentController::class, 'show']);
        Route::delete('{attachment}', [AttachmentController::class, 'destroy']);
        Route::get('{attachment}/download', [AttachmentController::class, 'download']);
        Route::get('{attachment}/preview', [AttachmentController::class, 'preview']);
        
        // Admin/Manager only routes
        Route::group(['middleware' => ['role:admin,manager']], function () {
            Route::post('bulk-upload', [AttachmentController::class, 'bulkUpload']);
            Route::delete('bulk-delete', [AttachmentController::class, 'bulkDelete']);
            Route::get('stats/storage', [AttachmentController::class, 'storageStats']);
        });
    });
    
    // Job assignments management - admin/manager
    Route::group(['prefix' => 'job-assignments', 'middleware' => ['role:admin,manager,worker']], function () {
        Route::get('/', [JobAssignmentController::class, 'index']);
        Route::post('/', [JobAssignmentController::class, 'store']);
        Route::get('{jobAssignment}', [JobAssignmentController::class, 'show']);
        Route::patch('{jobAssignment}', [JobAssignmentController::class, 'update']);
        Route::delete('{jobAssignment}', [JobAssignmentController::class, 'destroy']);
        Route::patch('{jobAssignment}/accept', [JobAssignmentController::class, 'accept']);
        Route::patch('{jobAssignment}/reject', [JobAssignmentController::class, 'reject']);
        Route::patch('{jobAssignment}/start', [JobAssignmentController::class, 'start']);
        Route::patch('{jobAssignment}/complete', [JobAssignmentController::class, 'complete']);
        Route::patch('{jobAssignment}/cancel', [JobAssignmentController::class, 'cancel']);
        Route::get('worker/{workerId}/assignments', [JobAssignmentController::class, 'workerAssignments']);
        Route::get('job/{jobId}/assignments', [JobAssignmentController::class, 'jobAssignments']);
        Route::get('stats/overview', [JobAssignmentController::class, 'stats']);
        
        // Admin/Manager only routes
        Route::group(['middleware' => ['role:admin,manager']], function () {
            Route::post('bulk-assign', [JobAssignmentController::class, 'bulkAssign']);
        });
    });
    
    // Tenant quotas management - admin only
    Route::group(['prefix' => 'tenant-quotas', 'middleware' => ['role:admin', 'quota']], function () {
        Route::get('/', [TenantQuotaController::class, 'index']);
        Route::post('/', [TenantQuotaController::class, 'store']);
        Route::get('{tenantQuota}', [TenantQuotaController::class, 'show']);
        Route::patch('{tenantQuota}', [TenantQuotaController::class, 'update']);
        Route::delete('{tenantQuota}', [TenantQuotaController::class, 'destroy']);
        Route::get('usage/tenant', [TenantQuotaController::class, 'usage']);
        Route::patch('{tenantQuota}/reset', [TenantQuotaController::class, 'reset']);
        Route::patch('{tenantQuota}/increment', [TenantQuotaController::class, 'increment']);
        Route::get('alerts/overview', [TenantQuotaController::class, 'alerts']);
    });
    
    // Audit logs management - admin/manager
    Route::group(['prefix' => 'audit-logs', 'middleware' => ['role:admin,manager']], function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::post('/', [AuditLogController::class, 'store']);
        Route::get('{auditLog}', [AuditLogController::class, 'show']);
        Route::delete('{auditLog}', [AuditLogController::class, 'destroy']);
        Route::get('stats/overview', [AuditLogController::class, 'statistics']);
        Route::get('user/activity', [AuditLogController::class, 'userActivity']);
        Route::get('model/history', [AuditLogController::class, 'modelHistory']);
        Route::get('search/logs', [AuditLogController::class, 'search']);
    });
    
    // Digital signatures management - wszyscy zalogowani
    Route::group(['prefix' => 'signatures'], function () {
        Route::get('/', [SignatureController::class, 'index']);
        Route::post('/', [SignatureController::class, 'store']);
        Route::get('{signature}', [SignatureController::class, 'show']);
        Route::patch('{signature}', [SignatureController::class, 'update']);
        Route::delete('{signature}', [SignatureController::class, 'destroy']);
        Route::get('{signature}/download', [SignatureController::class, 'download']);
        Route::post('{signature}/verify', [SignatureController::class, 'verify']);
        Route::get('user/signatures', [SignatureController::class, 'userSignatures']);
        
        // Admin/Manager only routes
        Route::group(['middleware' => ['role:admin,manager']], function () {
            Route::get('stats/overview', [SignatureController::class, 'statistics']);
            Route::delete('bulk-delete', [SignatureController::class, 'bulkDelete']);
        });
    });
});
