<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Location;
use Illuminate\Auth\Access\Response;

class LocationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view locations
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
    public function view(User $user, Location $location): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all locations from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view locations in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Supervisors can view locations in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Workers can view locations in their tenant
        if (in_array('worker', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Clients can view locations in their tenant
        if (in_array('client', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create locations
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Location $location): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all locations from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update locations in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Supervisors can update locations in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Location $location): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all locations from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete locations in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Supervisors can delete locations in their tenant (if not used in active jobs)
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $location->tenant_id) {
            // Check if location is used in active jobs
            $hasActiveJobs = \App\Models\Job::where('location_id', $location->id)
                                          ->whereIn('status', ['pending', 'in_progress'])
                                          ->exists();
            return !$hasActiveJobs;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Location $location): bool
    {
        return $this->delete($user, $location);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Location $location): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete locations from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign location to jobs.
     */
    public function assign(User $user, Location $location): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can assign locations to all jobs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign locations in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Supervisors can assign locations in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update location coordinates.
     */
    public function updateCoordinates(User $user, Location $location): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update coordinates of all locations
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update coordinates of locations in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Supervisors can update coordinates of locations in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return true;
        }

        // Workers can update coordinates during field work (with approval)
        if (in_array('worker', $userRoles) && $user->tenant_id === $location->tenant_id) {
            return false; // Requires approval workflow
        }

        return false;
    }
}