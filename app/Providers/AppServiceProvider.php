<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

// Models
use App\Models\Asset;
use App\Models\Attachment;
use App\Models\AuditLog;
use App\Models\Certification;
use App\Models\Feature;
use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Sector;
use App\Models\Signature;
use App\Models\Skill;
use App\Models\Tenant;
use App\Models\TenantQuota;
use App\Models\User;
use App\Models\Worker;

// Policies
use App\Policies\AssetPolicy;
use App\Policies\AttachmentPolicy;
use App\Policies\AuditLogPolicy;
use App\Policies\CertificationPolicy;
use App\Policies\FeaturePolicy;
use App\Policies\FormPolicy;
use App\Policies\FormResponsePolicy;
use App\Policies\JobPolicy;
use App\Policies\JobAssignmentPolicy;
use App\Policies\LocationPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\PermissionPolicy;
use App\Policies\RolePolicy;
use App\Policies\SectorPolicy;
use App\Policies\SignaturePolicy;
use App\Policies\SkillPolicy;
use App\Policies\TenantPolicy;
use App\Policies\TenantQuotaPolicy;
use App\Policies\UserPolicy;
use App\Policies\WorkerPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Asset::class => AssetPolicy::class,
        Attachment::class => AttachmentPolicy::class,
        AuditLog::class => AuditLogPolicy::class,
        Certification::class => CertificationPolicy::class,
        Feature::class => FeaturePolicy::class,
        Form::class => FormPolicy::class,
        FormResponse::class => FormResponsePolicy::class,
        Job::class => JobPolicy::class,
        JobAssignment::class => JobAssignmentPolicy::class,
        Location::class => LocationPolicy::class,
        Notification::class => NotificationPolicy::class,
        Permission::class => PermissionPolicy::class,
        Role::class => RolePolicy::class,
        Sector::class => SectorPolicy::class,
        Signature::class => SignaturePolicy::class,
        Skill::class => SkillPolicy::class,
        Tenant::class => TenantPolicy::class,
        TenantQuota::class => TenantQuotaPolicy::class,
        User::class => UserPolicy::class,
        Worker::class => WorkerPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies explicitly (optional, Laravel 12 auto-discovers)
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}
