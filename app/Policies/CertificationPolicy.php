<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Certification;
use Illuminate\Auth\Access\Response;

class CertificationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view certifications
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
    public function view(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all certifications from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view certifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Supervisors can view certifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Workers can view their own certifications
        if (in_array('worker', $userRoles)) {
            // Check if certification belongs to worker's user
            $worker = \App\Models\Worker::where('user_id', $user->id)->first();
            if ($worker && $certification->worker_id === $worker->id) {
                return true;
            }
        }

        // Clients can view certifications in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create certifications
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all certifications from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update certifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Supervisors can update certifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Workers can update basic info of their own certifications (but not status)
        if (in_array('worker', $userRoles)) {
            $worker = \App\Models\Worker::where('user_id', $user->id)->first();
            if ($worker && $certification->worker_id === $worker->id && $certification->status === 'pending') {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all certifications from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete certifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Supervisors can delete certifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Workers can delete their own pending certifications
        if (in_array('worker', $userRoles)) {
            $worker = \App\Models\Worker::where('user_id', $user->id)->first();
            if ($worker && 
                $certification->worker_id === $worker->id && 
                $certification->status === 'pending') {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Certification $certification): bool
    {
        return $this->delete($user, $certification);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete certifications from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can approve/reject certifications.
     */
    public function approve(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Certification must be pending to be approved
        if ($certification->status !== 'pending') {
            return false;
        }
        
        // Admin can approve all certifications
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can approve certifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Supervisors can approve certifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can verify certifications.
     */
    public function verify(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can verify all certifications
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can verify certifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Supervisors can verify certifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can renew certifications.
     */
    public function renew(User $user, Certification $certification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Certification must be approved and near expiry to be renewed
        if ($certification->status !== 'approved') {
            return false;
        }
        
        // Admin can renew all certifications
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can renew certifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Supervisors can renew certifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $certification->tenant_id) {
            return true;
        }

        // Workers can request renewal of their own certifications
        if (in_array('worker', $userRoles)) {
            $worker = \App\Models\Worker::where('user_id', $user->id)->first();
            if ($worker && $certification->worker_id === $worker->id) {
                return true;
            }
        }

        return false;
    }
}