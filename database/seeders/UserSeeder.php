<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $roles = Role::where('tenant_id', $tenant->id)->get();
            
            // Create admin user
            $admin = User::create([
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'email' => 'admin@' . strtolower(str_replace(' ', '', $tenant->name)) . '.com',
                'password' => Hash::make('password'),
                'name' => 'System Administrator',
                'phone' => '+1-555-' . rand(1000, 9999),
                'is_active' => true,
                'data' => [
                    'department' => 'IT',
                    'hire_date' => '2023-01-01',
                    'employee_id' => 'ADM-001'
                ]
            ]);
            $adminRole = $roles->where('name', 'Admin')->first();
            if ($adminRole) {
                $admin->roles()->attach($adminRole);
            }

            // Create manager user
            $manager = User::create([
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'email' => 'manager@' . strtolower(str_replace(' ', '', $tenant->name)) . '.com',
                'password' => Hash::make('password'),
                'name' => 'Operations Manager',
                'phone' => '+1-555-' . rand(1000, 9999),
                'is_active' => true,
                'data' => [
                    'department' => 'Operations',
                    'hire_date' => '2023-02-01',
                    'employee_id' => 'MGR-001'
                ]
            ]);
            $managerRole = $roles->where('name', 'Manager')->first();
            if ($managerRole) {
                $manager->roles()->attach($managerRole);
            }

            // Create supervisors
            for ($i = 1; $i <= 2; $i++) {
                $supervisor = User::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'email' => "supervisor{$i}@" . strtolower(str_replace(' ', '', $tenant->name)) . '.com',
                    'password' => Hash::make('password'),
                    'name' => "Field Supervisor {$i}",
                    'phone' => '+1-555-' . rand(1000, 9999),
                    'is_active' => true,
                    'data' => [
                        'department' => 'Field Operations',
                        'hire_date' => '2023-' . str_pad($i + 2, 2, '0', STR_PAD_LEFT) . '-01',
                        'employee_id' => "SUP-" . str_pad($i, 3, '0', STR_PAD_LEFT)
                    ]
                ]);
                $supervisorRole = $roles->where('name', 'Supervisor')->first();
                if ($supervisorRole) {
                    $supervisor->roles()->attach($supervisorRole);
                }
            }

            // Create workers
            $workerNames = [
                'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson',
                'David Brown', 'Lisa Davis', 'Robert Miller', 'Emily Garcia',
                'Michael Rodriguez', 'Ashley Martinez', 'Christopher Lee',
                'Amanda Anderson', 'Daniel Taylor', 'Jessica Thomas'
            ];

            foreach (array_slice($workerNames, 0, rand(5, 10)) as $index => $name) {
                $worker = User::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'email' => strtolower(str_replace(' ', '.', $name)) . '@' . 
                              strtolower(str_replace(' ', '', $tenant->name)) . '.com',
                    'password' => Hash::make('password'),
                    'name' => $name,
                    'phone' => '+1-555-' . rand(1000, 9999),
                    'is_active' => rand(1, 10) > 1, // 90% active
                    'data' => [
                        'department' => 'Field Operations',
                        'hire_date' => '2023-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . 
                                      str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                        'employee_id' => "WRK-" . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                        'emergency_contact' => '+1-555-' . rand(1000, 9999)
                    ]
                ]);
                $workerRole = $roles->where('name', 'Worker')->first();
                if ($workerRole) {
                    $worker->roles()->attach($workerRole);
                }
            }

            // Create client user
            $client = User::create([
                'id' => Str::uuid(),
                'tenant_id' => $tenant->id,
                'email' => 'client@' . strtolower(str_replace(' ', '', $tenant->name)) . '.com',
                'password' => Hash::make('password'),
                'name' => 'Client Representative',
                'phone' => '+1-555-' . rand(1000, 9999),
                'is_active' => true,
                'data' => [
                    'department' => 'External',
                    'company' => 'Client Company Ltd.',
                    'access_level' => 'read_only'
                ]
            ]);
            $clientRole = $roles->where('name', 'Client')->first();
            if ($clientRole) {
                $client->roles()->attach($clientRole);
            }
        }
    }
}
