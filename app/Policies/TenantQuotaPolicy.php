<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TenantQuota;
use Illuminate\Auth\Access\Response;

class TenantQuotaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and managers can view tenant quotas
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all tenant quotas
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view quotas for their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        // Supervisors can view basic quota info for their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create tenant quotas
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can update tenant quotas
        if (in_array('admin', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can delete tenant quotas
        if (in_array('admin', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TenantQuota $tenantQuota): bool
    {
        return $this->delete($user, $tenantQuota);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete tenant quotas
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can check quota usage.
     */
    public function checkUsage(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can check usage for all tenant quotas
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can check usage for their tenant quotas
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        // Supervisors can check basic usage for their tenant quotas
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can reset quota usage.
     */
    public function resetUsage(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can reset quota usage
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can increase quota limits.
     */
    public function increaseLimits(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can increase quota limits
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can view quota analytics.
     */
    public function viewAnalytics(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view analytics for all tenant quotas
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view analytics for their tenant quotas
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can configure quota alerts.
     */
    public function configureAlerts(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can configure alerts for all tenant quotas
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can configure alerts for their tenant quotas
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can request quota increase.
     */
    public function requestIncrease(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Managers can request quota increase for their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenantQuota->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can approve quota increase requests.
     */
    public function approveIncrease(User $user, TenantQuota $tenantQuota): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can approve quota increase requests
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can export quota data.
     */
    public function export(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can export all quota data
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can export quota data for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can monitor quota violations.
     */
    public function monitorViolations(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can monitor all quota violations
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can monitor violations for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create quota templates.
     */
    public function createTemplate(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can create quota templates
        return in_array('admin', $userRoles);
    }
}