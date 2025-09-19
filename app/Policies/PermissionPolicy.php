<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Permission;
use Illuminate\Auth\Access\Response;

class PermissionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Only admin can view permissions
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can view permissions
        if (in_array('admin', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create permissions
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can update permissions
        if (in_array('admin', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can delete permissions
        if (in_array('admin', $userRoles)) {
            // Cannot delete core system permissions
            $corePermissions = [
                'users.view', 'users.create', 'users.update', 'users.delete',
                'roles.view', 'roles.create', 'roles.update', 'roles.delete',
                'permissions.view', 'permissions.create', 'permissions.update', 'permissions.delete',
                'tenants.view', 'tenants.create', 'tenants.update', 'tenants.delete',
                'jobs.view', 'jobs.create', 'jobs.update', 'jobs.delete',
                'workers.view', 'workers.create', 'workers.update', 'workers.delete'
            ];
            
            return !in_array($permission->name, $corePermissions);
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Permission $permission): bool
    {
        return $this->delete($user, $permission);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete permissions
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign permission to roles.
     */
    public function assign(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can assign permissions to roles
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can revoke permission from roles.
     */
    public function revoke(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can revoke permissions from roles
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can sync permissions.
     */
    public function sync(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can sync permissions
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can view permission usage analytics.
     */
    public function viewAnalytics(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can view permission analytics
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can export permission data.
     */
    public function export(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can export permission data
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can manage permission groups.
     */
    public function manageGroups(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can manage permission groups
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can check permission dependencies.
     */
    public function checkDependencies(User $user, Permission $permission): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can check permission dependencies
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can validate permission conflicts.
     */
    public function validateConflicts(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can validate permission conflicts
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can create permission templates.
     */
    public function createTemplate(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can create permission templates
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can audit permission changes.
     */
    public function audit(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can audit permission changes
        return in_array('admin', $userRoles);
    }
}