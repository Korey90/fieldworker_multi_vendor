<?php

namespace Database\Seeders;

use App\Models\Certification;
use Illuminate\Database\Seeder;

class CertificationSeeder extends Seeder
{
    public function run(): void
    {
        $certifications = [
            [
                'name' => 'First Aid Certificate',
                'authority' => 'Red Cross',
                'validity_period_months' => 24
            ],
            [
                'name' => 'Electrical License',
                'authority' => 'Electrical Safety Authority',
                'validity_period_months' => 60
            ],
            [
                'name' => 'Forklift Operator License',
                'authority' => 'OSHA',
                'validity_period_months' => 36
            ],
            [
                'name' => 'Confined Space Entry',
                'authority' => 'Safety Training Institute',
                'validity_period_months' => 12
            ],
            [
                'name' => 'Height Safety Training',
                'authority' => 'Work Safe Authority',
                'validity_period_months' => 24
            ],
            [
                'name' => 'Crane Operator License',
                'authority' => 'National Commission for Crane Operators',
                'validity_period_months' => 60
            ],
            [
                'name' => 'Welding Certification',
                'authority' => 'American Welding Society',
                'validity_period_months' => 36
            ],
            [
                'name' => 'Hazmat Handler License',
                'authority' => 'Department of Transportation',
                'validity_period_months' => 24
            ],
            [
                'name' => 'Fire Safety Training',
                'authority' => 'Fire Department',
                'validity_period_months' => 12
            ],
            [
                'name' => 'Commercial Driver License',
                'authority' => 'Department of Motor Vehicles',
                'validity_period_months' => 48
            ],
            [
                'name' => 'HVAC Technician License',
                'authority' => 'HVAC Excellence',
                'validity_period_months' => 60
            ],
            [
                'name' => 'Plumbing License',
                'authority' => 'Master Plumbers Association',
                'validity_period_months' => 60
            ]
        ];

        foreach ($certifications as $certification) {
            Certification::create($certification);
        }
    }
}
