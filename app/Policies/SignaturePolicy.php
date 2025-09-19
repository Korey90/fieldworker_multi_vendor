<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Signature;
use Illuminate\Auth\Access\Response;

class SignaturePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers, supervisors, and workers can view signatures
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
    public function view(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all signatures from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view signatures in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Supervisors can view signatures in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Workers can view their own signatures
        if (in_array('worker', $userRoles) && $signature->user_id === $user->id) {
            return true;
        }

        // Clients can view signatures in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create signatures
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles) ||
               in_array('client', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all signatures from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update signatures in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Supervisors can update signatures in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Users can update their own signatures (but only metadata, not the signature itself)
        if ($signature->user_id === $user->id && !$signature->is_finalized) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all signatures from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete signatures in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Supervisors can delete signatures in their tenant (if not finalized)
        if (in_array('supervisor', $userRoles) && 
            $user->tenant_id === $signature->tenant_id &&
            !$signature->is_finalized) {
            return true;
        }

        // Users can delete their own signatures (if not finalized)
        if ($signature->user_id === $user->id && !$signature->is_finalized) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Signature $signature): bool
    {
        return $this->delete($user, $signature);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete signatures from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can finalize the signature.
     */
    public function finalize(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Signature must not be already finalized
        if ($signature->is_finalized) {
            return false;
        }
        
        // Admin can finalize all signatures
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Users can finalize their own signatures
        if ($signature->user_id === $user->id) {
            return true;
        }

        // Managers can finalize signatures in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Supervisors can finalize signatures in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can verify the signature.
     */
    public function verify(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can verify all signatures
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can verify signatures in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        // Supervisors can verify signatures in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can download signature document.
     */
    public function download(User $user, Signature $signature): bool
    {
        // Same permissions as viewing
        return $this->view($user, $signature);
    }

    /**
     * Determine whether the user can invalidate the signature.
     */
    public function invalidate(User $user, Signature $signature): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can invalidate all signatures
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can invalidate signatures in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $signature->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create signature templates.
     */
    public function createTemplate(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can create signature templates
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can create signature templates for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }
}