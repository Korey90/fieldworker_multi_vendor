<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Form;
use Illuminate\Auth\Access\Response;

class FormPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view forms
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
    public function view(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all forms from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view forms in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Supervisors can view forms in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Workers can view forms in their tenant
        if (in_array('worker', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Clients can view forms in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create forms
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all forms from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update forms in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Supervisors can update forms in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all forms from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete forms in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Supervisors can delete forms in their tenant (if no responses exist)
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $form->tenant_id) {
            // Check if form has any responses
            $hasResponses = \App\Models\FormResponse::where('form_id', $form->id)->exists();
            return !$hasResponses;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Form $form): bool
    {
        return $this->delete($user, $form);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete forms from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can publish/unpublish the form.
     */
    public function publish(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can publish all forms
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can publish forms in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Supervisors can publish forms in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can fill out the form (create responses).
     */
    public function fill(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Form must be published and active
        if (!$form->is_published || !$form->is_active) {
            return false;
        }
        
        // Admin can fill all forms
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Workers can fill forms in their tenant
        if (in_array('worker', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Supervisors and managers can fill forms in their tenant
        if ((in_array('supervisor', $userRoles) || in_array('manager', $userRoles)) && 
            $user->tenant_id === $form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view form responses.
     */
    public function viewResponses(User $user, Form $form): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all form responses
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view responses to forms in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Supervisors can view responses to forms in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        // Clients can view responses to forms in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $form->tenant_id) {
            return true;
        }

        return false;
    }
}