<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $locationCount = rand(3, 8);
            
            for ($i = 1; $i <= $locationCount; $i++) {
                $locationType = $this->getLocationTypeForSector($tenant->sector);
                $cityData = $this->getRandomCityData();
                
                Location::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'name' => $this->generateLocationName($locationType, $i),
                    'address' => $this->generateAddress($cityData),
                    'latitude' => $cityData['lat'] + (rand(-1000, 1000) / 10000), // Small random offset
                    'longitude' => $cityData['lng'] + (rand(-1000, 1000) / 10000),
                    'data' => [
                        'type' => $locationType,
                        'access_code' => rand(1000, 9999),
                        'contact_person' => $this->generateContactPerson(),
                        'operating_hours' => $this->generateOperatingHours(),
                        'special_instructions' => $this->generateSpecialInstructions($locationType),
                        'parking_available' => rand(0, 1) == 1,
                        'requires_safety_equipment' => rand(0, 1) == 1
                    ]
                ]);
            }
        }
    }

    private function getLocationTypeForSector($sector): string
    {
        $types = [
            'CONST' => ['Construction Site', 'Renovation Project', 'New Development'],
            'MAINT' => ['Office Building', 'Factory', 'Warehouse', 'Retail Store'],
            'INSP' => ['Facility', 'Plant', 'Installation', 'Building'],
            'SERV' => ['Customer Site', 'Service Location', 'Installation Point'],
            'LOG' => ['Distribution Center', 'Pickup Point', 'Delivery Address'],
            'UTIL' => ['Substation', 'Pump Station', 'Service Point'],
            'TELE' => ['Cell Tower', 'Network Node', 'Customer Premises'],
            'CLEAN' => ['Office Complex', 'Medical Facility', 'Industrial Site']
        ];

        $sectorTypes = $types[$sector] ?? ['General Location'];
        return $sectorTypes[rand(0, count($sectorTypes) - 1)];
    }

    private function getRandomCityData(): array
    {
        $cities = [
            ['name' => 'New York', 'lat' => 40.7128, 'lng' => -74.0060],
            ['name' => 'Los Angeles', 'lat' => 34.0522, 'lng' => -118.2437],
            ['name' => 'Chicago', 'lat' => 41.8781, 'lng' => -87.6298],
            ['name' => 'Houston', 'lat' => 29.7604, 'lng' => -95.3698],
            ['name' => 'Phoenix', 'lat' => 33.4484, 'lng' => -112.0740],
            ['name' => 'Philadelphia', 'lat' => 39.9526, 'lng' => -75.1652],
            ['name' => 'San Antonio', 'lat' => 29.4241, 'lng' => -98.4936],
            ['name' => 'San Diego', 'lat' => 32.7157, 'lng' => -117.1611],
            ['name' => 'Dallas', 'lat' => 32.7767, 'lng' => -96.7970],
            ['name' => 'San Jose', 'lat' => 37.3382, 'lng' => -121.8863]
        ];

        return $cities[rand(0, count($cities) - 1)];
    }

    private function generateLocationName($type, $index): string
    {
        $adjectives = ['North', 'South', 'East', 'West', 'Central', 'Downtown', 'Uptown'];
        $adjective = $adjectives[rand(0, count($adjectives) - 1)];
        
        return "{$adjective} {$type} #{$index}";
    }

    private function generateAddress($cityData): string
    {
        $streetNumbers = rand(100, 9999);
        $streetNames = ['Main St', 'Oak Ave', 'First St', 'Park Rd', 'Center Dr', 'Industrial Blvd', 'Commerce Way'];
        $streetName = $streetNames[rand(0, count($streetNames) - 1)];
        
        return "{$streetNumbers} {$streetName}, {$cityData['name']}";
    }

    private function generateContactPerson(): string
    {
        $firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily'];
        $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        
        $firstName = $firstNames[rand(0, count($firstNames) - 1)];
        $lastName = $lastNames[rand(0, count($lastNames) - 1)];
        
        return "{$firstName} {$lastName}";
    }

    private function generateOperatingHours(): array
    {
        $schedules = [
            ['monday' => '8:00-17:00', 'tuesday' => '8:00-17:00', 'wednesday' => '8:00-17:00', 'thursday' => '8:00-17:00', 'friday' => '8:00-17:00'],
            ['monday' => '9:00-18:00', 'tuesday' => '9:00-18:00', 'wednesday' => '9:00-18:00', 'thursday' => '9:00-18:00', 'friday' => '9:00-18:00'],
            ['monday' => '24/7', 'tuesday' => '24/7', 'wednesday' => '24/7', 'thursday' => '24/7', 'friday' => '24/7', 'saturday' => '24/7', 'sunday' => '24/7'],
            ['monday' => '6:00-22:00', 'tuesday' => '6:00-22:00', 'wednesday' => '6:00-22:00', 'thursday' => '6:00-22:00', 'friday' => '6:00-22:00']
        ];

        return $schedules[rand(0, count($schedules) - 1)];
    }

    private function generateSpecialInstructions($type): string
    {
        $instructions = [
            'Construction Site' => 'Hard hat and safety vest required. Check in with site supervisor.',
            'Office Building' => 'Use visitor entrance. Sign in at reception desk.',
            'Factory' => 'Safety equipment mandatory. Follow escort to work area.',
            'Warehouse' => 'Loading dock access only. Beware of forklift traffic.',
            'Customer Site' => 'Ring doorbell and wait for customer. Be courteous and professional.',
            'Cell Tower' => 'Restricted access area. RF exposure precautions required.',
            'Medical Facility' => 'Maintain sterile environment. Follow all health protocols.'
        ];

        return $instructions[$type] ?? 'Follow standard safety procedures and company protocols.';
    }
}
