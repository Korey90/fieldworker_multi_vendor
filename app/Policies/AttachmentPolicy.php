<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Attachment;
use Illuminate\Auth\Access\Response;

class AttachmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view attachments
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
    public function view(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all attachments from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view attachments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Supervisors can view attachments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Workers can view attachments in their tenant or uploaded by them
        if (in_array('worker', $userRoles) && 
            ($user->tenant_id === $attachment->tenant_id || $attachment->uploaded_by === $user->id)) {
            return true;
        }

        // Clients can view attachments in their tenant (read-only)
        if (in_array('client', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // All authenticated users can create attachments
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles) ||
               in_array('worker', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all attachments from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update attachments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Supervisors can update attachments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Workers can update their own attachments (metadata only)
        if (in_array('worker', $userRoles) && $attachment->uploaded_by === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all attachments from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete attachments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Supervisors can delete attachments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Workers can delete their own attachments
        if (in_array('worker', $userRoles) && $attachment->uploaded_by === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Attachment $attachment): bool
    {
        return $this->delete($user, $attachment);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete attachments from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can download the attachment.
     */
    public function download(User $user, Attachment $attachment): bool
    {
        // Same permissions as viewing
        return $this->view($user, $attachment);
    }

    /**
     * Determine whether the user can approve attachment (for sensitive content).
     */
    public function approve(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can approve all attachments
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can approve attachments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Supervisors can approve attachments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can share attachment with external parties.
     */
    public function share(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can share all attachments
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can share attachments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Supervisors can share attachments in their tenant (with approval)
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return false; // Requires manager approval
        }

        return false;
    }

    /**
     * Determine whether the user can move attachment to different category/folder.
     */
    public function move(User $user, Attachment $attachment): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can move all attachments
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can move attachments in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Supervisors can move attachments in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $attachment->tenant_id) {
            return true;
        }

        // Workers can move their own attachments
        if (in_array('worker', $userRoles) && $attachment->uploaded_by === $user->id) {
            return true;
        }

        return false;
    }
}