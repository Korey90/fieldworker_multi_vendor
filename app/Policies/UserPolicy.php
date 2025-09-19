<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and managers can view users
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all users from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view users in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $model->tenant_id) {
            return true;
        }

        // Users can view their own profile
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin and managers can create users
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all users from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update users in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $model->tenant_id) {
            return true;
        }

        // Users can update their own basic info (limited fields)
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all users from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete users in their tenant (except themselves)
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $model->tenant_id && 
            $user->id !== $model->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $this->delete($user, $model);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete users from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign roles to the model.
     */
    public function assignRole(User $user, User $model): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin and managers can assign roles
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign roles to users in their tenant (except admin role)
        if (in_array('manager', $userRoles) && $user->tenant_id === $model->tenant_id) {
            return true;
        }

        return false;
    }
}