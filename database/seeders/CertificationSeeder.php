<?php

namespace Database\Seeders;

use App\Models\Certification;
use Illuminate\Database\Seeder;

class CertificationSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first tenant (or create one if needed)
        $tenant = \App\Models\Tenant::first();
        
        if (!$tenant) {
            $tenant = \App\Models\Tenant::factory()->create();
        }
        
        $this->command->info("Using tenant: {$tenant->name} (ID: {$tenant->id})");
        
        $certifications = [
            [
                'name' => 'First Aid Certificate',
                'authority' => 'Red Cross',
                'validity_period_months' => 24,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Electrical License',
                'authority' => 'Electrical Safety Authority',
                'validity_period_months' => 60,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Forklift Operator License',
                'authority' => 'OSHA',
                'validity_period_months' => 36,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Confined Space Entry',
                'authority' => 'Safety Training Institute',
                'validity_period_months' => 12,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Height Safety Training',
                'authority' => 'Work Safe Authority',
                'validity_period_months' => 24,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Crane Operator License',
                'authority' => 'National Commission for Crane Operators',
                'validity_period_months' => 60,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Welding Certification',
                'authority' => 'American Welding Society',
                'validity_period_months' => 36,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Hazmat Handler License',
                'authority' => 'Department of Transportation',
                'validity_period_months' => 24,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Fire Safety Training',
                'authority' => 'Fire Department',
                'validity_period_months' => 12,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Commercial Driver License',
                'authority' => 'Department of Motor Vehicles',
                'validity_period_months' => 48,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'HVAC Technician License',
                'authority' => 'HVAC Excellence',
                'validity_period_months' => 60,
                'tenant_id' => $tenant->id,
            ],
            [
                'name' => 'Plumbing License',
                'authority' => 'Master Plumbers Association',
                'validity_period_months' => 60,
                'tenant_id' => $tenant->id,
            ]
        ];

        foreach ($certifications as $certification) {
            Certification::create($certification);
        }
    }
}
