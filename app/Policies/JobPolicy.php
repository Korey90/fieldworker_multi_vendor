<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Job;
use Illuminate\Auth\Access\Response;

class JobPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers, supervisors, and workers can view jobs
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Job $job): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all jobs from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view jobs in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Supervisors can view jobs in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Workers can view jobs they're assigned to
        if (in_array('worker', $userRoles)) {
            return $job->assignments()->whereHas('worker', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->exists();
        }

        // Clients can view jobs in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create jobs
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Job $job): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all jobs from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update jobs in their tenant
        if (in_array('manager', $userRoles)) {
            return $user->tenant_id === $job->tenant_id;
        }

        // Supervisors can update jobs in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Workers can update status and basic fields of jobs they're assigned to
        if (in_array('worker', $userRoles)) {
            return $job->assignments()->whereHas('worker', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Job $job): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all jobs from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete jobs in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Supervisors can delete jobs in their tenant (if not started)
        if (in_array('supervisor', $userRoles) && 
            $user->tenant_id === $job->tenant_id && 
            $job->status === 'pending') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Job $job): bool
    {
        return $this->delete($user, $job);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Job $job): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete jobs from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign workers to the job.
     */
    public function assignWorkers(User $user, Job $job): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can assign workers to all jobs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign workers to jobs in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Supervisors can assign workers to jobs in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update job status.
     */
    public function updateStatus(User $user, Job $job): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update status of all jobs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update status of jobs in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Supervisors can update status of jobs in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $job->tenant_id) {
            return true;
        }

        // Workers can update status of jobs they're assigned to
        if (in_array('worker', $userRoles)) {
            return $job->assignments()->whereHas('worker', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->exists();
        }

        return false;
    }
}