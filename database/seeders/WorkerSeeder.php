<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Worker;
use App\Models\Skill;
use App\Models\Certification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();
        $skills = Skill::all();
        $certifications = Certification::all();

        foreach ($tenants as $tenant) {
            // Get worker users for this tenant
            $workerUsers = User::where('tenant_id', $tenant->id)
                ->whereHas('roles', function ($query) {
                    $query->where('name', 'Worker');
                })
                ->get();

            foreach ($workerUsers as $user) {
                $worker = Worker::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                    'employee_number' => $user->data['employee_id'] ?? 'WRK-' . rand(100, 999),
                    'status' => rand(1, 10) > 2 ? 'active' : (rand(1, 2) == 1 ? 'inactive' : 'on_leave'),
                    'data' => [
                        'start_date' => $user->data['hire_date'] ?? '2023-01-01',
                        'hourly_rate' => rand(20, 50),
                        'specialization' => $this->getRandomSpecialization($tenant->sector),
                        'vehicle_assigned' => rand(1, 3) == 1,
                        'license_plate' => rand(1, 3) == 1 ? $this->generateLicensePlate() : null,
                        'uniform_size' => ['S', 'M', 'L', 'XL', 'XXL'][rand(0, 4)],
                        'preferred_shift' => ['morning', 'afternoon', 'evening', 'night'][rand(0, 3)]
                    ]
                ]);

                // Assign random skills (2-8 skills per worker)
                $workerSkills = $skills->random(rand(2, 8));
                $worker->skills()->attach($workerSkills);

                // Assign random certifications (1-4 certifications per worker)
                $workerCertifications = $certifications->random(rand(1, 4));
                foreach ($workerCertifications as $certification) {
                    $issuedAt = Carbon::now()->subDays(rand(30, 730)); // Issued 1 month to 2 years ago
                    $expiresAt = $certification->validity_period_months ? 
                        $issuedAt->copy()->addMonths($certification->validity_period_months) : 
                        null;

                    $worker->certifications()->attach($certification, [
                        'issued_at' => $issuedAt->format('Y-m-d'),
                        'expires_at' => $expiresAt?->format('Y-m-d')
                    ]);
                }
            }
        }
    }

    private function getRandomSpecialization($sector): string
    {
        $specializations = [
            'CONST' => ['Electrical', 'Plumbing', 'Carpentry', 'Masonry', 'Roofing', 'Painting'],
            'MAINT' => ['HVAC', 'Electrical', 'Mechanical', 'Preventive Maintenance', 'Emergency Repair'],
            'INSP' => ['Safety Inspection', 'Quality Control', 'Code Compliance', 'Environmental Assessment'],
            'SERV' => ['Installation', 'Repair', 'Calibration', 'Troubleshooting', 'Customer Support'],
            'LOG' => ['Delivery', 'Pickup', 'Inventory', 'Route Planning', 'Load Management'],
            'UTIL' => ['Water Systems', 'Gas Lines', 'Electrical Grid', 'Telecommunications'],
            'TELE' => ['Network Installation', 'Cable Laying', 'Equipment Maintenance', 'Signal Testing'],
            'CLEAN' => ['Commercial Cleaning', 'Industrial Cleaning', 'Sanitization', 'Waste Management']
        ];

        $sectorSpecs = $specializations[$sector] ?? ['General'];
        return $sectorSpecs[rand(0, count($sectorSpecs) - 1)];
    }

    private function generateLicensePlate(): string
    {
        $letters = chr(rand(65, 90)) . chr(rand(65, 90)) . chr(rand(65, 90));
        $numbers = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        return $letters . '-' . $numbers;
    }
}
