<?php

namespace Database\Seeders;

use App\Models\Tenat;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenat::all();
        $permissions = Permission::all();

        foreach ($tenants as $tenant) {
            // Admin role - all permissions
            $adminRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'Admin',
                'description' => 'Full system access and administration'
            ]);
            $adminRole->permissions()->attach($permissions);

            // Manager role - most permissions except system admin
            $managerRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'Manager',
                'description' => 'Manage workers, jobs, and operations'
            ]);
            $managerPermissions = $permissions->filter(function ($permission) {
                return !str_starts_with($permission->key, 'admin.');
            });
            $managerRole->permissions()->attach($managerPermissions);

            // Supervisor role - limited management permissions
            $supervisorRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'Supervisor',
                'description' => 'Supervise workers and assign jobs'
            ]);
            $supervisorPermissions = $permissions->filter(function ($permission) {
                return in_array(explode('.', $permission->key)[0], ['workers', 'jobs']) &&
                       !str_ends_with($permission->key, '.delete');
            });
            $supervisorRole->permissions()->attach($supervisorPermissions);

            // Worker role - basic permissions
            $workerRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'Worker',
                'description' => 'Field worker with basic access'
            ]);
            $workerPermissions = $permissions->filter(function ($permission) {
                return in_array($permission->key, [
                    'jobs.view',
                    'forms.view',
                    'assets.view',
                    'locations.view'
                ]);
            });
            $workerRole->permissions()->attach($workerPermissions);

            // Client role - read-only access for external clients
            $clientRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'Client',
                'description' => 'Read-only access for clients'
            ]);
            $clientPermissions = $permissions->filter(function ($permission) {
                return str_ends_with($permission->key, '.view') &&
                       in_array(explode('.', $permission->key)[0], ['jobs', 'reports']);
            });
            $clientRole->permissions()->attach($clientPermissions);
        }
    }
}
