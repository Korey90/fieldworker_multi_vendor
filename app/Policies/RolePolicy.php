<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Access\Response;

class RolePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers can view roles
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all roles from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view roles in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $role->tenant_id) {
            return true;
        }

        // Supervisors can view basic role info for their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $role->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create roles
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all roles from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update custom roles in their tenant (not system roles)
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $role->tenant_id && 
            !in_array($role->slug, ['admin', 'manager', 'supervisor', 'worker', 'client'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Cannot delete system roles
        if (in_array($role->slug, ['admin', 'manager', 'supervisor', 'worker', 'client'])) {
            return false;
        }
        
        // Admin can delete custom roles from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete custom roles in their tenant (if not assigned to users)
        if (in_array('manager', $userRoles) && $user->tenant_id === $role->tenant_id) {
            // Check if role is assigned to any users
            $hasUsers = $role->users()->exists();
            return !$hasUsers;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Role $role): bool
    {
        return $this->delete($user, $role);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete roles from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign role to users.
     */
    public function assign(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can assign all roles
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign roles in their tenant (except admin and manager roles)
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $role->tenant_id &&
            !in_array($role->slug, ['admin', 'manager'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can revoke role from users.
     */
    public function revoke(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can revoke all roles
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can revoke roles in their tenant (except admin and manager roles)
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $role->tenant_id &&
            !in_array($role->slug, ['admin', 'manager'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can manage permissions for role.
     */
    public function managePermissions(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can manage permissions for all roles
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can manage permissions for custom roles in their tenant
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $role->tenant_id &&
            !in_array($role->slug, ['admin', 'manager', 'supervisor', 'worker', 'client'])) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can duplicate role.
     */
    public function duplicate(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can duplicate all roles
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can duplicate roles in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $role->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view role analytics.
     */
    public function viewAnalytics(User $user, Role $role): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view analytics for all roles
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view analytics for roles in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $role->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can export role data.
     */
    public function export(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can export all role data
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can export role data for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }
}