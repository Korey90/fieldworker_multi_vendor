<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Worker;
use App\Models\Job;
use App\Models\Notification;
use App\Models\Location;
use Illuminate\Database\Seeder;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Get current logged user (or any user with tenant)
        $user = User::with('tenant')->whereNotNull('tenant_id')->first();
        if (!$user) {
            $this->command->info('No user with tenant found');
            return;
        }

        $tenant = $user->tenant;
        if (!$tenant) {
            $this->command->info('User has no tenant');
            return;
        }

        $this->command->info("Creating demo data for user: {$user->email}, tenant: {$tenant->name}");

        // Create demo locations (based on Location model)
        $locations = [];
        for ($i = 1; $i <= 3; $i++) {
            $locations[] = Location::create([
                'tenant_id' => $tenant->id,
                'name' => "Demo Site $i",
                'address' => "123 Demo Street $i",
                'city' => "Demo City $i",
                'state' => 'Demo State',
                'postal_code' => "12345",
                'country' => 'US',
                'location_type' => 'construction_site',
                'is_active' => true,
                'latitude' => 40.7128 + ($i * 0.1),
                'longitude' => -74.0060 + ($i * 0.1),
            ]);
        }

        // Create demo workers (based on Worker model)
        $workers = [];
        for ($i = 1; $i <= 10; $i++) {
            $workers[] = Worker::create([
                'tenant_id' => $tenant->id,
                'user_id' => null, // can be linked to User later
                'employee_number' => "EMP" . str_pad($i, 3, '0', STR_PAD_LEFT),
                'hire_date' => now()->subDays(rand(30, 365)),
                'hourly_rate' => rand(1500, 3500) / 100, // $15.00 - $35.00
                'status' => $i <= 8 ? 'active' : 'inactive', // 8 active, 2 inactive
            ]);
        }

        // Create demo jobs (based on Job model - uses tenant_jobs table)
        $jobStatuses = ['active', 'completed', 'pending', 'cancelled'];
        $jobsCompletedToday = 0;
        
        for ($i = 1; $i <= 20; $i++) {
            $status = $jobStatuses[array_rand($jobStatuses)];
            $createdAt = now()->subDays(rand(0, 30));
            
            // Ensure some jobs are completed today
            if ($i <= 5 && $status === 'completed') {
                $completedAt = today()->addHours(rand(1, 8));
                $jobsCompletedToday++;
            } else {
                $completedAt = $status === 'completed' ? $createdAt->addHours(rand(1, 8)) : null;
            }
            
            Job::create([
                'tenant_id' => $tenant->id,
                'title' => "Demo Job $i",
                'description' => "This is a demo job description for job number $i",
                'location_id' => $locations[array_rand($locations)]->id,
                'assigned_user_id' => $user->id, // assign to current user
                'status' => $status,
                'scheduled_at' => $createdAt,
                'completed_at' => $completedAt,
                'created_at' => $createdAt,
                'updated_at' => $completedAt ?? $createdAt,
            ]);
        }

        // Create demo notifications (based on Notification model)
        $notificationTypes = ['alert', 'info', 'warning', 'success'];
        for ($i = 1; $i <= 15; $i++) {
            $type = $notificationTypes[array_rand($notificationTypes)];
            
            Notification::create([
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
                'title' => "Demo Notification $i",
                'message' => "This is a demo notification message for testing dashboard functionality",
                'type' => $type,
                'is_read' => $i > 10, // first 10 unread, rest read
                'read_at' => $i > 10 ? now()->subHours(rand(1, 24)) : null,
                'created_at' => now()->subHours(rand(1, 48)),
            ]);
        }

        $this->command->info('✅ Demo data created successfully!');
        $this->command->info('📊 Dashboard should now show:');
        $this->command->info("   - " . Worker::where('tenant_id', $tenant->id)->where('status', 'active')->count() . " active workers");
        $this->command->info("   - " . Job::where('tenant_id', $tenant->id)->count() . " total jobs");
        $this->command->info("   - " . Job::where('tenant_id', $tenant->id)->where('status', 'completed')->whereDate('completed_at', today())->count() . " jobs completed today");
        $this->command->info("   - " . Notification::where('tenant_id', $tenant->id)->where('type', 'alert')->where('is_read', false)->count() . " unread alerts");
        $this->command->info("   - Recent activity from jobs and notifications");
    }
}
