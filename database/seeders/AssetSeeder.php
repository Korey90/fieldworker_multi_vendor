<?php

namespace Database\Seeders;

use App\Models\Tenat;
use App\Models\Asset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenat::all();

        foreach ($tenants as $tenant) {
            $assetCount = rand(5, 15);
            
            for ($i = 1; $i <= $assetCount; $i++) {
                $assetType = $this->getAssetTypeForSector($tenant->sector);
                $assetData = $this->generateAssetData($assetType);
                
                Asset::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'name' => $assetData['name'],
                    'type' => $assetType,
                    'serial_number' => $this->generateSerialNumber(),
                    'data' => $assetData['data']
                ]);
            }
        }
    }

    private function getAssetTypeForSector($sector): string
    {
        $types = [
            'CONST' => ['Power Tool', 'Heavy Equipment', 'Safety Equipment', 'Vehicle', 'Measuring Tool'],
            'MAINT' => ['Diagnostic Tool', 'Repair Equipment', 'Vehicle', 'Safety Equipment', 'Spare Parts'],
            'INSP' => ['Testing Equipment', 'Measuring Device', 'Vehicle', 'Safety Equipment', 'Documentation Tool'],
            'SERV' => ['Service Tool', 'Testing Equipment', 'Vehicle', 'Laptop', 'Mobile Device'],
            'LOG' => ['Vehicle', 'Loading Equipment', 'Tracking Device', 'Safety Equipment', 'Communication Device'],
            'UTIL' => ['Specialized Tool', 'Safety Equipment', 'Vehicle', 'Testing Equipment', 'Emergency Equipment'],
            'TELE' => ['Network Tool', 'Testing Equipment', 'Vehicle', 'Installation Tool', 'Safety Equipment'],
            'CLEAN' => ['Cleaning Equipment', 'Vehicle', 'Safety Equipment', 'Chemical Storage', 'Waste Container']
        ];

        $sectorTypes = $types[$sector] ?? ['General Equipment'];
        return $sectorTypes[rand(0, count($sectorTypes) - 1)];
    }

    private function generateAssetData($type): array
    {
        $baseData = [
            'purchase_date' => date('Y-m-d', strtotime('-' . rand(30, 1095) . ' days')),
            'warranty_expires' => date('Y-m-d', strtotime('+' . rand(90, 730) . ' days')),
            'condition' => ['excellent', 'good', 'fair', 'needs_repair'][rand(0, 3)],
            'location_stored' => $this->generateStorageLocation(),
            'maintenance_due' => date('Y-m-d', strtotime('+' . rand(30, 180) . ' days'))
        ];

        switch ($type) {
            case 'Power Tool':
                return [
                    'name' => $this->getRandomPowerTool(),
                    'data' => array_merge($baseData, [
                        'brand' => ['DeWalt', 'Makita', 'Milwaukee', 'Bosch'][rand(0, 3)],
                        'voltage' => ['12V', '18V', '20V', '36V'][rand(0, 3)],
                        'battery_included' => rand(0, 1) == 1,
                        'accessories' => ['drill_bits', 'saw_blades', 'sanding_discs'][rand(0, 2)]
                    ])
                ];

            case 'Heavy Equipment':
                return [
                    'name' => $this->getRandomHeavyEquipment(),
                    'data' => array_merge($baseData, [
                        'manufacturer' => ['Caterpillar', 'John Deere', 'Komatsu', 'Volvo'][rand(0, 3)],
                        'engine_hours' => rand(100, 5000),
                        'fuel_type' => ['diesel', 'gasoline', 'electric'][rand(0, 2)],
                        'operator_required' => true,
                        'certification_needed' => true
                    ])
                ];

            case 'Vehicle':
                return [
                    'name' => $this->getRandomVehicle(),
                    'data' => array_merge($baseData, [
                        'make' => ['Ford', 'Chevrolet', 'Ram', 'Toyota'][rand(0, 3)],
                        'model_year' => rand(2018, 2024),
                        'license_plate' => $this->generateLicensePlate(),
                        'mileage' => rand(10000, 150000),
                        'fuel_type' => ['gasoline', 'diesel', 'electric', 'hybrid'][rand(0, 3)],
                        'insurance_expires' => date('Y-m-d', strtotime('+' . rand(30, 365) . ' days')),
                        'registration_expires' => date('Y-m-d', strtotime('+' . rand(30, 365) . ' days'))
                    ])
                ];

            case 'Testing Equipment':
                return [
                    'name' => $this->getRandomTestingEquipment(),
                    'data' => array_merge($baseData, [
                        'manufacturer' => ['Fluke', 'Tektronix', 'Keysight', 'Rohde & Schwarz'][rand(0, 3)],
                        'calibration_due' => date('Y-m-d', strtotime('+' . rand(90, 365) . ' days')),
                        'accuracy' => '±' . (rand(1, 5) / 10) . '%',
                        'measurement_range' => $this->generateMeasurementRange(),
                        'certification' => 'ISO 9001'
                    ])
                ];

            case 'Safety Equipment':
                return [
                    'name' => $this->getRandomSafetyEquipment(),
                    'data' => array_merge($baseData, [
                        'certification' => ['ANSI', 'OSHA', 'CE', 'CSA'][rand(0, 3)],
                        'size' => ['S', 'M', 'L', 'XL', 'Universal'][rand(0, 4)],
                        'expiration_date' => date('Y-m-d', strtotime('+' . rand(365, 1095) . ' days')),
                        'inspection_due' => date('Y-m-d', strtotime('+' . rand(30, 90) . ' days'))
                    ])
                ];

            default:
                return [
                    'name' => ucfirst($type) . ' #' . rand(100, 999),
                    'data' => $baseData
                ];
        }
    }

    private function getRandomPowerTool(): string
    {
        $tools = [
            'Cordless Drill', 'Impact Driver', 'Circular Saw', 'Angle Grinder',
            'Reciprocating Saw', 'Multi-Tool', 'Jigsaw', 'Router', 'Belt Sander',
            'Hammer Drill', 'Nail Gun', 'Heat Gun'
        ];
        return $tools[rand(0, count($tools) - 1)];
    }

    private function getRandomHeavyEquipment(): string
    {
        $equipment = [
            'Excavator', 'Bulldozer', 'Crane', 'Forklift', 'Skid Steer',
            'Backhoe Loader', 'Dump Truck', 'Concrete Mixer', 'Compactor',
            'Generator', 'Air Compressor', 'Welding Machine'
        ];
        return $equipment[rand(0, count($equipment) - 1)];
    }

    private function getRandomVehicle(): string
    {
        $vehicles = [
            'Service Van', 'Pickup Truck', 'Box Truck', 'Utility Vehicle',
            'Cargo Van', 'Work Truck', 'Service Truck', 'Flatbed Truck'
        ];
        return $vehicles[rand(0, count($vehicles) - 1)];
    }

    private function getRandomTestingEquipment(): string
    {
        $equipment = [
            'Multimeter', 'Oscilloscope', 'Signal Generator', 'Power Supply',
            'Spectrum Analyzer', 'Network Analyzer', 'Function Generator',
            'Digital Caliper', 'Pressure Gauge', 'Temperature Probe'
        ];
        return $equipment[rand(0, count($equipment) - 1)];
    }

    private function getRandomSafetyEquipment(): string
    {
        $equipment = [
            'Hard Hat', 'Safety Vest', 'Safety Goggles', 'Work Gloves',
            'Fall Harness', 'Respirator', 'First Aid Kit', 'Fire Extinguisher',
            'Emergency Eyewash', 'Safety Barrier', 'Warning Sign', 'Safety Cone'
        ];
        return $equipment[rand(0, count($equipment) - 1)];
    }

    private function generateSerialNumber(): string
    {
        $prefix = chr(rand(65, 90)) . chr(rand(65, 90));
        $numbers = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        return $prefix . $numbers;
    }

    private function generateLicensePlate(): string
    {
        $letters = chr(rand(65, 90)) . chr(rand(65, 90)) . chr(rand(65, 90));
        $numbers = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        return $letters . '-' . $numbers;
    }

    private function generateStorageLocation(): string
    {
        $locations = [
            'Main Warehouse - Section A', 'Field Office Storage', 'Vehicle #1',
            'Secure Storage Room', 'Tool Shed', 'Mobile Storage Unit',
            'Supervisor Vehicle', 'On-site Container', 'Central Depot'
        ];
        return $locations[rand(0, count($locations) - 1)];
    }

    private function generateMeasurementRange(): string
    {
        $ranges = [
            '0-100V', '0-1000V', '0-50A', '0-500°C', '0-1000 PSI',
            '1Hz-100MHz', '0-10GHz', '0-100mm', '0-1000Ω'
        ];
        return $ranges[rand(0, count($ranges) - 1)];
    }
}
