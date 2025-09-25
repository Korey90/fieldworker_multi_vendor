<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Role;
use App\Models\Worker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Ma za zadanie wygenerować uzytkowników dla kazdego z tenantów oraz ma stworzyc konto 
     * admina dla (dewelopera), oraz konta managera, supervisorów, pracowników dla tenantów.
     * 
     */
    public function run(): void
    {
        $tenants = Tenant::all();
        $roles = Role::all();



        // Create admin user
        $admin = User::create([
            'id' => Str::uuid(),
            'tenant_id' => null,
            'email' => 'text@email.com',
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
        $adminRole = $roles->where('slug', 'admin')->first();
        if ($adminRole) {
            $admin->roles()->attach($adminRole);
        }

        // Create users for each tenant
        foreach ($tenants as $tenant) {
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

        }
    }
}
