<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Auth\Access\Response;

class AuditLogPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, managers, and supervisors can view audit logs
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles) || 
               in_array('manager', $userRoles) || 
               in_array('supervisor', $userRoles);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AuditLog $auditLog): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all audit logs from any tenant
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view audit logs in their tenant
        if (in_array('manager', $userRoles) && $user->tenant_id === $auditLog->tenant_id) {
            return true;
        }

        // Supervisors can view audit logs in their tenant (limited scope)
        if (in_array('supervisor', $userRoles) && $user->tenant_id === $auditLog->tenant_id) {
            // Supervisors can only view logs related to operations they can perform
            return in_array($auditLog->event, [
                'job.created', 'job.updated', 'job.assigned',
                'worker.updated', 'form.created', 'form.updated'
            ]);
        }

        // Users can view their own action logs
        if ($auditLog->user_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Audit logs are created automatically by the system
        // Only admin can manually create audit logs for testing/migration purposes
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AuditLog $auditLog): bool
    {
        // Audit logs should never be updated to maintain integrity
        // Only admin can update in exceptional circumstances
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AuditLog $auditLog): bool
    {
        // Audit logs should rarely be deleted to maintain audit trail
        // Only admin can delete for data retention compliance
        $userRoles = $user->roles->pluck('slug')->toArray();
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AuditLog $auditLog): bool
    {
        return $this->delete($user, $auditLog);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AuditLog $auditLog): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can permanently delete audit logs from any tenant
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can export audit logs.
     */
    public function export(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can export all audit logs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can export audit logs for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view audit analytics.
     */
    public function viewAnalytics(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can view all audit analytics
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can view audit analytics for their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        // Supervisors can view basic audit analytics for their tenant
        if (in_array('supervisor', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can search audit logs.
     */
    public function search(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can search all audit logs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can search audit logs in their tenant
        if (in_array('manager', $userRoles)) {
            return true;
        }

        // Supervisors can search audit logs in their tenant (limited scope)
        if (in_array('supervisor', $userRoles)) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view system audit logs.
     */
    public function viewSystem(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can view system-level audit logs
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can configure audit settings.
     */
    public function configure(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Only admin can configure audit settings
        return in_array('admin', $userRoles);
    }

    /**
     * Determine whether the user can archive old audit logs.
     */
    public function archive(User $user): bool
    {
        $userRoles = $user->roles->pluck('slug')->toArray();
        
        // Admin can archive audit logs
        if (in_array('admin', $userRoles)) {
            return true;
        }
        
        // Managers can archive audit logs for their tenant (with retention rules)
        if (in_array('manager', $userRoles)) {
            return true;
        }

        return false;
    }
}