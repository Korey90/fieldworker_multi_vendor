<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorSeeder extends Seeder
{
    public function run(): void
    {
        $sectors = [
            [
                'code' => 'CONST',
                'name' => 'Construction',
                'description' => 'Construction and building services'
            ],
            [
                'code' => 'MAINT',
                'name' => 'Maintenance',
                'description' => 'Equipment and facility maintenance'
            ],
            [
                'code' => 'INSP',
                'name' => 'Inspection',
                'description' => 'Quality control and safety inspections'
            ],
            [
                'code' => 'SERV',
                'name' => 'Field Services',
                'description' => 'On-site technical services'
            ],
            [
                'code' => 'LOG',
                'name' => 'Logistics',
                'description' => 'Transportation and delivery services'
            ],
            [
                'code' => 'UTIL',
                'name' => 'Utilities',
                'description' => 'Water, gas, electricity services'
            ],
            [
                'code' => 'TELE',
                'name' => 'Telecommunications',
                'description' => 'Network installation and maintenance'
            ],
            [
                'code' => 'CLEAN',
                'name' => 'Cleaning Services',
                'description' => 'Professional cleaning and sanitation'
            ]
        ];

        foreach ($sectors as $sector) {
            Sector::create($sector);
        }
    }
}
