<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Feature;
use Illuminate\Auth\Access\Response;

class FeaturePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view features
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
    public function view(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all features from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Check if feature is enabled for user's tenant
        if ($user->tenant_id && $feature->tenant_id && $user->tenant_id !== $feature->tenant_id) {
            return false;
        }

        // Managers can view features available to their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        // Supervisors can view features available to their tenant
        if (in_array('supervisor', $userRoles)) {
            return true;
        }

        // Workers can view features available to their tenant
        if (in_array('worker', $userRoles)) {
            return true;
        }

        // Clients can view features available to their tenant
        if (in_array('client', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create features
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can update features
        if (in_array('admin', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can delete features
        if (in_array('admin', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Feature $feature): bool
    {
        return $this->delete($user, $feature);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete features
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can enable/disable feature.
     */
    public function toggle(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can toggle all features
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can toggle features for their tenant (if allowed by feature config)
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $feature->tenant_id && 
            $feature->is_tenant_configurable) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can configure feature settings.
     */
    public function configure(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can configure all features
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can configure features for their tenant (if allowed)
        if (in_array('manager', $userRoles) && 
            $user->tenant_id === $feature->tenant_id && 
            $feature->is_tenant_configurable) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can access feature.
     */
    public function access(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Feature must be enabled
        if (!$feature->is_enabled) {
            return false;
        }
        
        // Admin can access all features
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Check if feature is available for user's tenant
        if ($user->tenant_id && $feature->tenant_id && $user->tenant_id !== $feature->tenant_id) {
            return false;
        }
        
        // Check role-based access
        $allowedRoles = $feature->allowed_roles ?? [];
        if (empty($allowedRoles)) {
            return true; // No role restriction
        }
        
        return !empty(array_intersect($userRoles, $allowedRoles));
    }

    /**
     * Determine whether the user can assign feature to tenants.
     */
    public function assign(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can assign features to tenants
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can view feature usage analytics.
     */
    public function viewAnalytics(User $user, Feature $feature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view analytics for all features
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view analytics for features in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $feature->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can request new features.
     */
    public function request(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Managers and supervisors can request new features
        return in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }
}