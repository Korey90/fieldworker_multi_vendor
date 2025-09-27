<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Worker;
use App\Models\Skill;
use App\Models\Certification;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();
        $faker = Faker::create();

        foreach ($tenants as $tenant) {
            $count = rand(5, 30);

            for ($i = 0; $i < $count; $i++) {
                $worker = Worker::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'location_id' => null, // możesz później przypisać losowo jeśli masz locations
                    'employee_number' => $faker->unique()->numerify('EMP###'),
                    'first_name' => $faker->firstName,
                    'last_name' => $faker->lastName,
                    'dob' => $faker->date('Y-m-d', '-18 years'), // losowe daty urodzenia
                    'insurance_number' => strtoupper(Str::random(10)),
                    'phone' => $faker->phoneNumber,
                    'email' => $faker->unique()->safeEmail,
                    'hire_date' => $faker->dateTimeBetween('-5 years', 'now'),
                    'hourly_rate' => $faker->randomFloat(2, 20, 100),
                    'status' => $faker->randomElement(['active', 'inactive', 'suspended']),
                    'data' => json_encode([
                        'notes' => $faker->sentence(),
                        'skills' => $faker->words(rand(2,5)),
                    ]),
                ]);

                // Przypisz losowe umiejętności (skills) do pracownika
                $totalSkills = Skill::count();
                for ($j = 0; $j < rand(1, 4); $j++) {
                    $worker->skills()->syncWithoutDetaching([
                        'skill_id' => rand(1, $totalSkills),
                        'level' => rand(1, 5),
                    ]);
                }

                //przypisz losowe certyfikaty (certifications) do pracownika
                $certifications = Certification::all();
                            
                for ($j = 0; $j < rand(0, 3); $j++) {
                    $cert = $certifications->random();

                    $issuedAt = $faker->dateTimeBetween('-16 months', 'now');
                    $expiresAt = (clone $issuedAt)->modify("+{$cert->validity_period_months} months");
                
                    $worker->certifications()->syncWithoutDetaching([
                        $cert->id => [
                            'issued_at'  => $issuedAt,
                            'expires_at' => $expiresAt,
                        ],
                    ]);
                }


            }
        }
    }
}
