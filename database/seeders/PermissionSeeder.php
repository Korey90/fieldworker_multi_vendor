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
            ['key' => 'users.view', 'slug' => 'users-view', 'description' => 'View users'],
            ['key' => 'users.create', 'slug' => 'users-create', 'description' => 'Create users'],
            ['key' => 'users.edit', 'slug' => 'users-edit', 'description' => 'Edit users'],
            ['key' => 'users.delete', 'slug' => 'users-delete', 'description' => 'Delete users'],
            
            // Worker management
            ['key' => 'workers.view', 'slug' => 'workers-view', 'description' => 'View workers'],
            ['key' => 'workers.create', 'slug' => 'workers-create', 'description' => 'Create workers'],
            ['key' => 'workers.edit', 'slug' => 'workers-edit', 'description' => 'Edit workers'],
            ['key' => 'workers.delete', 'slug' => 'workers-delete', 'description' => 'Delete workers'],
            
            // Job management
            ['key' => 'jobs.view', 'slug' => 'jobs-view', 'description' => 'View jobs'],
            ['key' => 'jobs.create', 'slug' => 'jobs-create', 'description' => 'Create jobs'],
            ['key' => 'jobs.edit', 'slug' => 'jobs-edit', 'description' => 'Edit jobs'],
            ['key' => 'jobs.delete', 'slug' => 'jobs-delete', 'description' => 'Delete jobs'],
            ['key' => 'jobs.assign', 'slug' => 'jobs-assign', 'description' => 'Assign jobs to workers'],
            
            // Asset management
            ['key' => 'assets.view', 'slug' => 'assets-view', 'description' => 'View assets'],
            ['key' => 'assets.create', 'slug' => 'assets-create', 'description' => 'Create assets'],
            ['key' => 'assets.edit', 'slug' => 'assets-edit', 'description' => 'Edit assets'],
            ['key' => 'assets.delete', 'slug' => 'assets-delete', 'description' => 'Delete assets'],
            
            // Location management
            ['key' => 'locations.view', 'slug' => 'locations-view', 'description' => 'View locations'],
            ['key' => 'locations.create', 'slug' => 'locations-create', 'description' => 'Create locations'],
            ['key' => 'locations.edit', 'slug' => 'locations-edit', 'description' => 'Edit locations'],
            ['key' => 'locations.delete', 'slug' => 'locations-delete', 'description' => 'Delete locations'],
            
            // Form management
            ['key' => 'forms.view', 'slug' => 'forms-view', 'description' => 'View forms'],
            ['key' => 'forms.create', 'slug' => 'forms-create', 'description' => 'Create forms'],
            ['key' => 'forms.edit', 'slug' => 'forms-edit', 'description' => 'Edit forms'],
            ['key' => 'forms.delete', 'slug' => 'forms-delete', 'description' => 'Delete forms'],
            
            // Reports and analytics
            ['key' => 'reports.view', 'slug' => 'reports-view', 'description' => 'View reports'],
            ['key' => 'reports.export', 'slug' => 'reports-export', 'description' => 'Export reports'],
            
            // System administration
            ['key' => 'admin.settings', 'slug' => 'admin-settings', 'description' => 'Manage system settings'],
            ['key' => 'admin.roles', 'slug' => 'admin-roles', 'description' => 'Manage roles and permissions'],
            ['key' => 'admin.audit', 'slug' => 'admin-audit', 'description' => 'View audit logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}
