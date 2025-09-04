<?php

namespace Database\Seeders;

use App\Models\Tenat;
use App\Models\Feature;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'id' => Str::uuid(),
                'name' => 'BuildTech Solutions',
                'sector' => 'CONST',
                'data' => [
                    'company_size' => 'large',
                    'founded' => '2010',
                    'specialization' => 'Commercial construction',
                    'website' => 'https://buildtech.example.com'
                ]
            ],
            [
                'id' => Str::uuid(),
                'name' => 'ServicePro Maintenance',
                'sector' => 'MAINT',
                'data' => [
                    'company_size' => 'medium',
                    'founded' => '2015',
                    'specialization' => 'Equipment maintenance',
                    'website' => 'https://servicepro.example.com'
                ]
            ],
            [
                'id' => Str::uuid(),
                'name' => 'QualityCheck Inspections',
                'sector' => 'INSP',
                'data' => [
                    'company_size' => 'small',
                    'founded' => '2018',
                    'specialization' => 'Safety inspections',
                    'website' => 'https://qualitycheck.example.com'
                ]
            ],
            [
                'id' => Str::uuid(),
                'name' => 'TechField Services',
                'sector' => 'SERV',
                'data' => [
                    'company_size' => 'medium',
                    'founded' => '2012',
                    'specialization' => 'IT field services',
                    'website' => 'https://techfield.example.com'
                ]
            ],
            [
                'id' => Str::uuid(),
                'name' => 'LogiMove Transport',
                'sector' => 'LOG',
                'data' => [
                    'company_size' => 'large',
                    'founded' => '2008',
                    'specialization' => 'Last-mile delivery',
                    'website' => 'https://logimove.example.com'
                ]
            ]
        ];

        foreach ($tenants as $tenantData) {
            $tenant = Tenat::create($tenantData);
            
            // Assign random features to each tenant
            $allFeatures = Feature::all();
            $randomFeatures = $allFeatures->random(rand(3, 7));
            $tenant->features()->attach($randomFeatures);
        }
    }
}
