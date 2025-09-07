<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Location;
use App\Models\Job;
use App\Models\Worker;
use App\Models\JobAssignment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $locations = Location::where('tenant_id', $tenant->id)->get();
            $workers = Worker::where('tenant_id', $tenant->id)->get();
            
            if ($locations->isEmpty() || $workers->isEmpty()) continue;

            $jobCount = rand(10, 25);
            
            for ($i = 1; $i <= $jobCount; $i++) {
                $status = $this->getRandomStatus();
                $scheduledAt = $this->getScheduledDate($status);
                $completedAt = $this->getCompletedDate($status, $scheduledAt);
                
                $job = Job::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'title' => $this->generateJobTitle($tenant->sector),
                    'description' => $this->generateJobDescription($tenant->sector),
                    'location_id' => $locations->random()->id,
                    'status' => $status,
                    'scheduled_at' => $scheduledAt,
                    'completed_at' => $completedAt,
                    'data' => $this->generateJobData($tenant->sector, $status)
                ]);

                // Assign workers to job
                $assignedWorkers = $workers->random(rand(1, min(3, $workers->count())));
                foreach ($assignedWorkers as $worker) {
                    JobAssignment::create([
                        'job_id' => $job->id,
                        'worker_id' => $worker->id,
                        'role' => $this->getWorkerRole(),
                        'status' => $this->getAssignmentStatus($status)
                    ]);
                }
            }
        }
    }

    private function getRandomStatus(): string
    {
        $statuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
        $weights = [15, 20, 25, 35, 5]; // Percentage distribution
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        foreach ($statuses as $index => $status) {
            $cumulative += $weights[$index];
            if ($random <= $cumulative) {
                return $status;
            }
        }
        
        return 'pending';
    }

    private function getScheduledDate($status): ?Carbon
    {
        switch ($status) {
            case 'pending':
                return Carbon::now()->addDays(rand(1, 14));
            case 'assigned':
                return Carbon::now()->addDays(rand(0, 7));
            case 'in_progress':
                return Carbon::now()->subDays(rand(0, 3));
            case 'completed':
                return Carbon::now()->subDays(rand(1, 30));
            case 'cancelled':
                return Carbon::now()->subDays(rand(1, 14));
            default:
                return null;
        }
    }

    private function getCompletedDate($status, $scheduledAt): ?Carbon
    {
        if ($status === 'completed' && $scheduledAt) {
            return $scheduledAt->copy()->addHours(rand(2, 12));
        }
        return null;
    }

    private function generateJobTitle($sector): string
    {
        $titles = [
            'CONST' => [
                'Electrical Installation', 'Plumbing Repair', 'Foundation Inspection',
                'Roof Maintenance', 'HVAC Installation', 'Flooring Installation',
                'Window Replacement', 'Drywall Repair', 'Painting Project'
            ],
            'MAINT' => [
                'Equipment Maintenance', 'Preventive Service', 'Emergency Repair',
                'System Upgrade', 'Component Replacement', 'Performance Check',
                'Safety Inspection', 'Calibration Service', 'Cleaning Service'
            ],
            'INSP' => [
                'Safety Inspection', 'Quality Audit', 'Compliance Check',
                'Environmental Assessment', 'Code Verification', 'System Testing',
                'Documentation Review', 'Risk Assessment', 'Certification Inspection'
            ],
            'SERV' => [
                'On-site Service', 'Technical Support', 'Installation Service',
                'Troubleshooting', 'System Configuration', 'User Training',
                'Upgrade Service', 'Maintenance Visit', 'Warranty Service'
            ],
            'LOG' => [
                'Package Delivery', 'Pickup Service', 'Route Optimization',
                'Inventory Transfer', 'Emergency Delivery', 'Bulk Transport',
                'Last Mile Delivery', 'Return Processing', 'Schedule Delivery'
            ],
            'UTIL' => [
                'Service Connection', 'Meter Reading', 'Line Maintenance',
                'Emergency Response', 'System Upgrade', 'Infrastructure Repair',
                'Safety Check', 'Equipment Installation', 'Service Restoration'
            ],
            'TELE' => [
                'Network Installation', 'Signal Testing', 'Equipment Upgrade',
                'Cable Installation', 'Tower Maintenance', 'System Integration',
                'Performance Optimization', 'Troubleshooting', 'Emergency Repair'
            ],
            'CLEAN' => [
                'Deep Cleaning', 'Routine Maintenance', 'Sanitization Service',
                'Carpet Cleaning', 'Window Cleaning', 'Floor Maintenance',
                'Restroom Service', 'Waste Management', 'Disinfection Service'
            ]
        ];

        $sectorTitles = $titles[$sector] ?? ['General Service'];
        return $sectorTitles[rand(0, count($sectorTitles) - 1)] . ' #' . rand(1000, 9999);
    }

    private function generateJobDescription($sector): string
    {
        $descriptions = [
            'CONST' => [
                'Complete electrical wiring installation according to blueprints and local codes.',
                'Repair plumbing leak and replace damaged pipes in basement area.',
                'Conduct thorough foundation inspection and provide detailed report.',
                'Perform routine roof maintenance including gutter cleaning and shingle inspection.'
            ],
            'MAINT' => [
                'Perform scheduled maintenance on HVAC system including filter replacement.',
                'Diagnose and repair malfunctioning equipment to restore normal operation.',
                'Conduct preventive maintenance to ensure optimal system performance.',
                'Replace worn components and test system functionality.'
            ],
            'INSP' => [
                'Conduct comprehensive safety inspection of all equipment and facilities.',
                'Perform quality audit to ensure compliance with industry standards.',
                'Complete environmental assessment and document findings.',
                'Verify code compliance and issue certification if requirements are met.'
            ],
            'SERV' => [
                'Provide on-site technical support and resolve customer issues.',
                'Install new equipment and configure system settings.',
                'Troubleshoot technical problems and implement solutions.',
                'Conduct user training session on new system features.'
            ],
            'LOG' => [
                'Complete delivery route efficiently while maintaining schedule.',
                'Pick up packages from multiple locations for transport.',
                'Optimize delivery route to minimize travel time and fuel consumption.',
                'Handle emergency delivery with priority processing.'
            ],
            'UTIL' => [
                'Connect new service and verify proper meter operation.',
                'Read utility meters and record consumption data.',
                'Perform maintenance on distribution lines and equipment.',
                'Respond to emergency service call and restore power.'
            ],
            'TELE' => [
                'Install network equipment and configure communication systems.',
                'Test signal strength and optimize network performance.',
                'Upgrade existing equipment to latest technology standards.',
                'Install fiber optic cables according to network plan.'
            ],
            'CLEAN' => [
                'Perform deep cleaning of all areas including detailed sanitization.',
                'Complete routine cleaning and maintenance tasks.',
                'Sanitize high-touch surfaces and common areas.',
                'Clean carpets using professional equipment and techniques.'
            ]
        ];

        $sectorDescriptions = $descriptions[$sector] ?? ['Complete assigned tasks according to specifications.'];
        return $sectorDescriptions[rand(0, count($sectorDescriptions) - 1)];
    }

    private function generateJobData($sector, $status): array
    {
        $baseData = [
            'priority' => ['low', 'normal', 'high', 'urgent'][rand(0, 3)],
            'estimated_duration' => rand(1, 8) . ' hours',
            'customer_contact' => '+1-555-' . rand(1000, 9999),
            'special_requirements' => rand(0, 1) == 1,
            'tools_required' => $this->getToolsForSector($sector),
            'created_by' => 'System Admin'
        ];

        if (in_array($status, ['completed', 'cancelled'])) {
            $baseData['completion_notes'] = $this->generateCompletionNotes($status);
            $baseData['time_spent'] = rand(1, 10) . ' hours';
        }

        if ($status === 'completed') {
            $baseData['customer_satisfaction'] = rand(3, 5);
            $baseData['quality_rating'] = rand(3, 5);
        }

        return $baseData;
    }

    private function getToolsForSector($sector): array
    {
        $tools = [
            'CONST' => ['drill', 'saw', 'hammer', 'level', 'measuring_tape'],
            'MAINT' => ['multimeter', 'wrench_set', 'diagnostic_tool', 'replacement_parts'],
            'INSP' => ['checklist', 'camera', 'measuring_device', 'testing_equipment'],
            'SERV' => ['laptop', 'toolkit', 'testing_equipment', 'documentation'],
            'LOG' => ['gps_device', 'scanner', 'dolly', 'protective_equipment'],
            'UTIL' => ['safety_equipment', 'specialized_tools', 'testing_device'],
            'TELE' => ['cable_tester', 'installation_tools', 'network_analyzer'],
            'CLEAN' => ['cleaning_supplies', 'vacuum', 'mop', 'sanitizer']
        ];

        $sectorTools = $tools[$sector] ?? ['basic_tools'];
        return array_slice($sectorTools, 0, rand(2, count($sectorTools)));
    }

    private function getWorkerRole(): string
    {
        $roles = ['technician', 'specialist', 'assistant', 'lead', 'supervisor'];
        return $roles[rand(0, count($roles) - 1)];
    }

    private function getAssignmentStatus($jobStatus): string
    {
        switch ($jobStatus) {
            case 'pending':
                return 'assigned';
            case 'assigned':
                return 'assigned';
            case 'in_progress':
                return 'in_progress';
            case 'completed':
                return 'completed';
            case 'cancelled':
                return 'cancelled';
            default:
                return 'assigned';
        }
    }

    private function generateCompletionNotes($status): string
    {
        if ($status === 'completed') {
            $notes = [
                'Task completed successfully according to specifications.',
                'All requirements met, customer satisfied with results.',
                'Work completed ahead of schedule with high quality.',
                'Minor issues encountered but resolved satisfactorily.',
                'Customer signed off on completed work.'
            ];
        } else {
            $notes = [
                'Job cancelled due to customer request.',
                'Cancelled - materials not available.',
                'Weather conditions prevented completion.',
                'Rescheduled due to site access issues.',
                'Customer unavailable at scheduled time.'
            ];
        }

        return $notes[rand(0, count($notes) - 1)];
    }
}
