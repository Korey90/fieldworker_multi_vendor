<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();
        $permissions = Permission::all();


        // Admin role - all permissions
        $adminRole = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Full system access and administration'
        ]);

        // Manager role - most permissions except system admin
        $managerRole = Role::create([
            'name' => 'Manager',
            'slug' => 'manager',
            'description' => 'Manage workers, jobs, and operations'
        ]);

        // Supervisor role - limited management permissions
        $supervisorRole = Role::create([
            'name' => 'Supervisor',
            'slug' => 'supervisor',
            'description' => 'Supervise workers and assign jobs'
        ]);

        // Worker role - basic permissions
        $workerRole = Role::create([
            'name' => 'Worker',
            'slug' => 'worker',
            'description' => 'Field worker with basic access'
        ]);

        // Client role - read-only access for external clients
        $clientRole = Role::create([
            'name' => 'Client',
            'slug' => 'client',
            'description' => 'Read-only access for clients'
        ]);

foreach (Role::all() as $role) {
    $permissions = Permission::all();

    switch ($role->slug) {
        case 'admin':
            $role->permissions()->sync($permissions);
            break;

        case 'manager':
            $managerPermissions = $permissions->filter(fn($p) => !str_starts_with($p->key, 'admin.'));
            $role->permissions()->sync($managerPermissions);
            break;

        case 'supervisor':
            $supervisorPermissions = $permissions->filter(fn($p) =>
                in_array(explode('.', $p->key)[0], ['workers', 'jobs']) &&
                !str_ends_with($p->key, '.delete')
            );
            $role->permissions()->sync($supervisorPermissions);
            break;

        case 'worker':
            $workerPermissions = $permissions->filter(fn($p) =>
                in_array($p->key, ['jobs.view','forms.view','assets.view','locations.view'])
            );
            $role->permissions()->sync($workerPermissions);
            break;

        case 'client':
            $clientPermissions = $permissions->filter(fn($p) =>
                str_ends_with($p->key, '.view') &&
                in_array(explode('.', $p->key)[0], ['jobs', 'reports'])
            );
            $role->permissions()->sync($clientPermissions);
            break;
    }
}

    }
}
