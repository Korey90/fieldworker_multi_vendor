<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // User management
            ['name' => 'View Users', 'key' => 'users.view', 'permission_key' => 'users_view', 'permission_group' => 'users', 'slug' => 'users-view', 'description' => 'View users'],
            ['name' => 'Create Users', 'key' => 'users.create', 'permission_key' => 'users_create', 'permission_group' => 'users', 'slug' => 'users-create', 'description' => 'Create users'],
            ['name' => 'Edit Users', 'key' => 'users.edit', 'permission_key' => 'users_edit', 'permission_group' => 'users', 'slug' => 'users-edit', 'description' => 'Edit users'],
            ['name' => 'Delete Users', 'key' => 'users.delete', 'permission_key' => 'users_delete', 'permission_group' => 'users', 'slug' => 'users-delete', 'description' => 'Delete users'],
            
            // Worker management
            ['name' => 'View Workers', 'key' => 'workers.view', 'permission_key' => 'workers_view', 'permission_group' => 'workers', 'slug' => 'workers-view', 'description' => 'View workers'],
            ['name' => 'Create Workers', 'key' => 'workers.create', 'permission_key' => 'workers_create', 'permission_group' => 'workers', 'slug' => 'workers-create', 'description' => 'Create workers'],
            ['name' => 'Edit Workers', 'key' => 'workers.edit', 'permission_key' => 'workers_edit', 'permission_group' => 'workers', 'slug' => 'workers-edit', 'description' => 'Edit workers'],
            ['name' => 'Delete Workers', 'key' => 'workers.delete', 'permission_key' => 'workers_delete', 'permission_group' => 'workers', 'slug' => 'workers-delete', 'description' => 'Delete workers'],
            
            // Job management
            ['name' => 'View Jobs', 'key' => 'jobs.view', 'permission_key' => 'jobs_view', 'permission_group' => 'jobs', 'slug' => 'jobs-view', 'description' => 'View jobs'],
            ['name' => 'Create Jobs', 'key' => 'jobs.create', 'permission_key' => 'jobs_create', 'permission_group' => 'jobs', 'slug' => 'jobs-create', 'description' => 'Create jobs'],
            ['name' => 'Edit Jobs', 'key' => 'jobs.edit', 'permission_key' => 'jobs_edit', 'permission_group' => 'jobs', 'slug' => 'jobs-edit', 'description' => 'Edit jobs'],
            ['name' => 'Delete Jobs', 'key' => 'jobs.delete', 'permission_key' => 'jobs_delete', 'permission_group' => 'jobs', 'slug' => 'jobs-delete', 'description' => 'Delete jobs'],
            ['name' => 'Assign Jobs', 'key' => 'jobs.assign', 'permission_key' => 'jobs_assign', 'permission_group' => 'jobs', 'slug' => 'jobs-assign', 'description' => 'Assign jobs to workers'],
            
            // Asset management
            ['name' => 'View Assets', 'key' => 'assets.view', 'permission_key' => 'assets_view', 'permission_group' => 'assets', 'slug' => 'assets-view', 'description' => 'View assets'],
            ['name' => 'Create Assets', 'key' => 'assets.create', 'permission_key' => 'assets_create', 'permission_group' => 'assets', 'slug' => 'assets-create', 'description' => 'Create assets'],
            ['name' => 'Edit Assets', 'key' => 'assets.edit', 'permission_key' => 'assets_edit', 'permission_group' => 'assets', 'slug' => 'assets-edit', 'description' => 'Edit assets'],
            ['name' => 'Delete Assets', 'key' => 'assets.delete', 'permission_key' => 'assets_delete', 'permission_group' => 'assets', 'slug' => 'assets-delete', 'description' => 'Delete assets'],
            
            // Location management
            ['name' => 'View Locations', 'key' => 'locations.view', 'permission_key' => 'locations_view', 'permission_group' => 'locations', 'slug' => 'locations-view', 'description' => 'View locations'],
            ['name' => 'Create Locations', 'key' => 'locations.create', 'permission_key' => 'locations_create', 'permission_group' => 'locations', 'slug' => 'locations-create', 'description' => 'Create locations'],
            ['name' => 'Edit Locations', 'key' => 'locations.edit', 'permission_key' => 'locations_edit', 'permission_group' => 'locations', 'slug' => 'locations-edit', 'description' => 'Edit locations'],
            ['name' => 'Delete Locations', 'key' => 'locations.delete', 'permission_key' => 'locations_delete', 'permission_group' => 'locations', 'slug' => 'locations-delete', 'description' => 'Delete locations'],
            
            // Form management
            ['name' => 'View Forms', 'key' => 'forms.view', 'permission_key' => 'forms_view', 'permission_group' => 'forms', 'slug' => 'forms-view', 'description' => 'View forms'],
            ['name' => 'Create Forms', 'key' => 'forms.create', 'permission_key' => 'forms_create', 'permission_group' => 'forms', 'slug' => 'forms-create', 'description' => 'Create forms'],
            ['name' => 'Edit Forms', 'key' => 'forms.edit', 'permission_key' => 'forms_edit', 'permission_group' => 'forms', 'slug' => 'forms-edit', 'description' => 'Edit forms'],
            ['name' => 'Delete Forms', 'key' => 'forms.delete', 'permission_key' => 'forms_delete', 'permission_group' => 'forms', 'slug' => 'forms-delete', 'description' => 'Delete forms'],
            
            // Reports and analytics
            ['name' => 'View Reports', 'key' => 'reports.view', 'permission_key' => 'reports_view', 'permission_group' => 'reports', 'slug' => 'reports-view', 'description' => 'View reports'],
            ['name' => 'Export Reports', 'key' => 'reports.export', 'permission_key' => 'reports_export', 'permission_group' => 'reports', 'slug' => 'reports-export', 'description' => 'Export reports'],
            
            // System administration
            ['name' => 'System Settings', 'key' => 'admin.settings', 'permission_key' => 'admin_settings', 'permission_group' => 'admin', 'slug' => 'admin-settings', 'description' => 'Manage system settings'],
            ['name' => 'Roles Management', 'key' => 'admin.roles', 'permission_key' => 'admin_roles', 'permission_group' => 'admin', 'slug' => 'admin-roles', 'description' => 'Manage roles and permissions'],
            ['name' => 'Audit Logs', 'key' => 'admin.audit', 'permission_key' => 'admin_audit', 'permission_group' => 'admin', 'slug' => 'admin-audit', 'description' => 'View audit logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}
