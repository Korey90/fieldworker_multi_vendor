<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Auth\Access\Response;

class NotificationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view notifications
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
    public function view(User $user, Notification $notification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all notifications from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Users can view notifications sent to them
        if ($user->id === $notification->user_id) {
            return true;
        }

        // Managers can view notifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        // Supervisors can view notifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin, managers, and supervisors can create notifications
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Notification $notification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can update all notifications from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can update notifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        // Supervisors can update notifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        // Users can mark their own notifications as read
        if ($user->id === $notification->user_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Notification $notification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can delete all notifications from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can delete notifications in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        // Supervisors can delete notifications in their tenant
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        // Users can delete their own notifications
        if ($user->id === $notification->user_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Notification $notification): bool
    {
        return $this->delete($user, $notification);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Notification $notification): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete notifications from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can mark notification as read/unread.
     */
    public function markAsRead(User $user, Notification $notification): bool
    {
        // Users can mark their own notifications as read/unread
        if ($user->id === $notification->user_id) {
            return true;
        }

        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can mark any notification as read
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can mark notifications in their tenant as read
        if (in_array('manager', $userRoles) && $user->tenant_id === $notification->tenant_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can send notifications to other users.
     */
    public function send(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can send notifications to anyone
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can send notifications to users in their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        // Supervisors can send notifications to workers in their tenant
        if (in_array('supervisor', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can send bulk notifications.
     */
    public function sendBulk(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can send bulk notifications
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can send bulk notifications to users in their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view notification analytics.
     */
    public function viewAnalytics(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all notification analytics
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view notification analytics for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        // Supervisors can view basic notification analytics for their tenant
        if (in_array('supervisor', $userRoles)) {
            return true;
        }

        return false;
    }
}