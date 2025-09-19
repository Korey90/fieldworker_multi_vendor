<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Skill;
use Illuminate\Auth\Access\Response;

class SkillPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view skills
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
    public function view(User $user, Skill $skill): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all skills from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view skills in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Supervisors can view skills in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Workers can view skills in their tenant
        if (in_array('worker', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Clients can view skills in their tenant
        if (in_array('client', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create skills
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Skill $skill): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all skills from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update skills in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Supervisors can update skills in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Skill $skill): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all skills from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete skills in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Supervisors can delete skills in their tenant (if not assigned to workers)
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            // Check if skill is assigned to any workers
            $hasWorkers = \App\Models\Worker::whereJsonContains('skills', $skill->id)->exists();
            return !$hasWorkers;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Skill $skill): bool
    {
        return $this->delete($user, $skill);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Skill $skill): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete skills from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can assign skill to workers.
     */
    public function assign(User $user, Skill $skill): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can assign skills to all workers
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can assign skills to workers in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Supervisors can assign skills to workers in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can certify skill for workers.
     */
    public function certify(User $user, Skill $skill): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can certify skills for all workers
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can certify skills for workers in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        // Supervisors can certify skills for workers in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $skill->tenant_id) {
            return true;
        }

        return false;
    }
}