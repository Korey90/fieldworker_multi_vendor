<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Worker;
use Illuminate\Auth\Access\Response;

class WorkerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and managers can view all workers
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Worker $worker): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all workers from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view workers in their tenant
        if (in_array('tenant', $userRoles) && $user->tenant_id === $worker->tenant_id) {
            return true;
        }

        // Workers can view their own profile
        return $user->id === $worker->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin and managers can create workers
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Worker $worker): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all workers from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update workers in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $worker->tenant_id) {
            return true;
        }

        // Workers can update their own basic info (limited fields)
        return $user->id === $worker->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Worker $worker): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all workers from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete workers in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $worker->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Worker $worker): bool
    {
        return $this->delete($user, $worker);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Worker $worker): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete workers from any tenant
        return in_array('admin', $userRoles);
    }
}
