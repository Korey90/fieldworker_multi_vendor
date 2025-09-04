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
            ['key' => 'users.view', 'description' => 'View users'],
            ['key' => 'users.create', 'description' => 'Create users'],
            ['key' => 'users.edit', 'description' => 'Edit users'],
            ['key' => 'users.delete', 'description' => 'Delete users'],
            
            // Worker management
            ['key' => 'workers.view', 'description' => 'View workers'],
            ['key' => 'workers.create', 'description' => 'Create workers'],
            ['key' => 'workers.edit', 'description' => 'Edit workers'],
            ['key' => 'workers.delete', 'description' => 'Delete workers'],
            
            // Job management
            ['key' => 'jobs.view', 'description' => 'View jobs'],
            ['key' => 'jobs.create', 'description' => 'Create jobs'],
            ['key' => 'jobs.edit', 'description' => 'Edit jobs'],
            ['key' => 'jobs.delete', 'description' => 'Delete jobs'],
            ['key' => 'jobs.assign', 'description' => 'Assign jobs to workers'],
            
            // Asset management
            ['key' => 'assets.view', 'description' => 'View assets'],
            ['key' => 'assets.create', 'description' => 'Create assets'],
            ['key' => 'assets.edit', 'description' => 'Edit assets'],
            ['key' => 'assets.delete', 'description' => 'Delete assets'],
            
            // Location management
            ['key' => 'locations.view', 'description' => 'View locations'],
            ['key' => 'locations.create', 'description' => 'Create locations'],
            ['key' => 'locations.edit', 'description' => 'Edit locations'],
            ['key' => 'locations.delete', 'description' => 'Delete locations'],
            
            // Form management
            ['key' => 'forms.view', 'description' => 'View forms'],
            ['key' => 'forms.create', 'description' => 'Create forms'],
            ['key' => 'forms.edit', 'description' => 'Edit forms'],
            ['key' => 'forms.delete', 'description' => 'Delete forms'],
            
            // Reports and analytics
            ['key' => 'reports.view', 'description' => 'View reports'],
            ['key' => 'reports.export', 'description' => 'Export reports'],
            
            // System administration
            ['key' => 'admin.settings', 'description' => 'Manage system settings'],
            ['key' => 'admin.roles', 'description' => 'Manage roles and permissions'],
            ['key' => 'admin.audit', 'description' => 'View audit logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}
