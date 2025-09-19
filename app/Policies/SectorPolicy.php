<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Sector;
use Illuminate\Auth\Access\Response;

class SectorPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view sectors
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles) ||
               in_array('client', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all sectors from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view sectors in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        // Supervisors can view sectors in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        // Workers can view sectors in their tenant
        if (in_array('worker', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        // Clients can view sectors in their tenant
        if (in_array('client', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers can create sectors
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all sectors from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update sectors in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all sectors from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete sectors in their tenant (if not used)
        if (in_array('manager', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            // Check if sector is used in any jobs or workers
            $hasJobs = \App\Models\Job::where('sector_id', $sector->id)->exists();
            $hasWorkers = \App\Models\Worker::where('sector_id', $sector->id)->exists();
            return !$hasJobs && !$hasWorkers;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Sector $sector): bool
    {
        return $this->delete($user, $sector);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete sectors from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign sector to jobs/workers.
     */
    public function assign(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can assign sectors to all jobs/workers
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign sectors in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        // Supervisors can assign sectors in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can configure sector settings.
     */
    public function configure(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can configure all sectors
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can configure sectors in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view sector analytics.
     */
    public function viewAnalytics(User $user, Sector $sector): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view analytics for all sectors
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view analytics for sectors in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        // Supervisors can view basic analytics for sectors in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        // Clients can view basic analytics for sectors in their tenant
        if (in_array('client', $userRoles) && $user->tenant_id === $sector->tenant_id) {
            return true;
        }

        return false;
    }
}