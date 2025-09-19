<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Auth\Access\Response;

class TenantPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Only admin can view all tenants
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Tenant $tenant): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all tenants
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view their own tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenant->id) {
            return true;
        }

        // Users can view their own tenant (limited info)
        return $user->tenant_id === $tenant->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create tenants
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Tenant $tenant): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all tenants
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update their own tenant (limited fields)
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenant->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Tenant $tenant): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can delete tenants
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Tenant $tenant): bool
    {
        return $this->delete($user, $tenant);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Tenant $tenant): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete tenants
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can manage tenant quotas.
     */
    public function manageQuotas(User $user, Tenant $tenant): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can manage quotas for all tenants
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view quotas for their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $tenant->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can suspend/activate the tenant.
     */
    public function suspend(User $user, Tenant $tenant): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can suspend/activate tenants
        return in_array('admin', $userRoles);
    }
}