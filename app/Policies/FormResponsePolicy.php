<?php

namespace App\Policies;

use App\Models\User;
use App\Models\FormResponse;
use Illuminate\Auth\Access\Response;

class FormResponsePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers, supervisors can view form responses
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('client', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all form responses from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view form responses in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Supervisors can view form responses in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Workers can view their own form responses
        if (in_array('worker', $userRoles) && $user->id === $formResponse->user_id) {
            return true;
        }

        // Clients can view form responses in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create form responses (fill forms)
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all form responses from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update form responses in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Supervisors can update form responses in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Workers can update their own form responses (if not submitted/locked)
        if (in_array('worker', $userRoles) && 
            $user->id === $formResponse->user_id && 
            $formResponse->status !== 'submitted') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all form responses from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete form responses in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Supervisors can delete form responses in their tenant (if not submitted)
        if (in_array('supervisor', $userRoles) && 
            $user->tenant_id === $formResponse->form->tenant_id &&
            $formResponse->status !== 'submitted') {
            return true;
        }

        // Workers can delete their own draft form responses
        if (in_array('worker', $userRoles) && 
            $user->id === $formResponse->user_id && 
            $formResponse->status === 'draft') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, FormResponse $formResponse): bool
    {
        return $this->delete($user, $formResponse);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete form responses from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can submit the form response.
     */
    public function submit(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Form response must be in draft status and belong to the user
        if ($formResponse->status !== 'draft') {
            return false;
        }
        
        // Admin can submit all form responses
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Workers can submit their own form responses
        if (in_array('worker', $userRoles) && $user->id === $formResponse->user_id) {
            return true;
        }

        // Supervisors and managers can submit form responses in their tenant
        if ((in_array('supervisor', $userRoles) || in_array('manager', $userRoles)) && 
            $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can approve/reject the form response.
     */
    public function approve(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Form response must be submitted to be approved
        if ($formResponse->status !== 'submitted') {
            return false;
        }
        
        // Admin can approve all form responses
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can approve form responses in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Supervisors can approve form responses in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can export form responses.
     */
    public function export(User $user, FormResponse $formResponse): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can export all form responses
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can export form responses in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Supervisors can export form responses in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        // Clients can export form responses in their tenant
        if (in_array('client', $userRoles) && $user->tenant_id === $formResponse->form->tenant_id) {
            return true;
        }

        return false;
    }
}