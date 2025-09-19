<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Asset;
use Illuminate\Auth\Access\Response;

class AssetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers, supervisors, and workers can view assets
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Asset $asset): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all assets from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view assets in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Supervisors can view assets in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Workers can view assets assigned to them or in their tenant
        if (in_array('worker', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Clients can view assets in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create assets
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Asset $asset): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all assets from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update assets in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Supervisors can update assets in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Asset $asset): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all assets from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete assets in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Supervisors can delete assets in their tenant (if not assigned to active jobs)
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Asset $asset): bool
    {
        return $this->delete($user, $asset);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Asset $asset): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete assets from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign asset to jobs.
     */
    public function assign(User $user, Asset $asset): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can assign assets to all jobs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign assets in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Supervisors can assign assets in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update asset status.
     */
    public function updateStatus(User $user, Asset $asset): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update status of all assets
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update status of assets in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Supervisors can update status of assets in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return true;
        }

        // Workers can update status of assets they're using
        if (in_array('worker', $userRoles) && $user->tenant_id === $asset->tenant_id) {
            return $asset->status !== 'maintenance'; // Can't change maintenance status
        }

        return false;
    }
}