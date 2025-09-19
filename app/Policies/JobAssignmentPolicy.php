<?php

namespace App\Policies;

use App\Models\User;
use App\Models\JobAssignment;
use Illuminate\Auth\Access\Response;

class JobAssignmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers, supervisors, and workers can view job assignments
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all job assignments from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view job assignments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        // Supervisors can view job assignments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        // Workers can view their own job assignments
        if (in_array('worker', $userRoles)) {
            return $jobAssignment->worker->user_id === $user->id;
        }

        // Clients can view job assignments in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create job assignments
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all job assignments from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update job assignments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        // Supervisors can update job assignments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        // Workers can update status and progress of their own assignments
        if (in_array('worker', $userRoles) && $jobAssignment->worker->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all job assignments from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete job assignments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        // Supervisors can delete job assignments in their tenant (if not started)
        if (in_array('supervisor', $userRoles) && 
            $user->tenant_id === $jobAssignment->job->tenant_id &&
            $jobAssignment->status === 'assigned') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, JobAssignment $jobAssignment): bool
    {
        return $this->delete($user, $jobAssignment);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete job assignments from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can accept job assignment.
     */
    public function accept(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Assignment must be in 'assigned' status
        if ($jobAssignment->status !== 'assigned') {
            return false;
        }
        
        // Workers can accept their own assignments
        if (in_array('worker', $userRoles) && $jobAssignment->worker->user_id === $user->id) {
            return true;
        }

        // Admin can accept any assignment
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can accept assignments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can reject job assignment.
     */
    public function reject(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Assignment must be in 'assigned' status
        if ($jobAssignment->status !== 'assigned') {
            return false;
        }
        
        // Workers can reject their own assignments
        if (in_array('worker', $userRoles) && $jobAssignment->worker->user_id === $user->id) {
            return true;
        }

        // Admin can reject any assignment
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can reject assignments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can start job assignment.
     */
    public function start(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Assignment must be in 'accepted' status
        if ($jobAssignment->status !== 'accepted') {
            return false;
        }
        
        // Workers can start their own assignments
        if (in_array('worker', $userRoles) && $jobAssignment->worker->user_id === $user->id) {
            return true;
        }

        // Admin can start any assignment
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers and supervisors can start assignments in their tenant
        if ((in_array('manager', $userRoles) || in_array('supervisor', $userRoles)) && 
            $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can complete job assignment.
     */
    public function complete(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Assignment must be in 'in_progress' status
        if ($jobAssignment->status !== 'in_progress') {
            return false;
        }
        
        // Workers can complete their own assignments
        if (in_array('worker', $userRoles) && $jobAssignment->worker->user_id === $user->id) {
            return true;
        }

        // Admin can complete any assignment
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers and supervisors can complete assignments in their tenant
        if ((in_array('manager', $userRoles) || in_array('supervisor', $userRoles)) && 
            $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update assignment progress.
     */
    public function updateProgress(User $user, JobAssignment $jobAssignment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Assignment must be in progress
        if ($jobAssignment->status !== 'in_progress') {
            return false;
        }
        
        // Workers can update progress of their own assignments
        if (in_array('worker', $userRoles) && $jobAssignment->worker->user_id === $user->id) {
            return true;
        }

        // Admin can update progress of any assignment
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers and supervisors can update progress of assignments in their tenant
        if ((in_array('manager', $userRoles) || in_array('supervisor', $userRoles)) && 
            $user->tenant_id === $jobAssignment->job->tenant_id) {
            return true;
        }

        return false;
    }
}