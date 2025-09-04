<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $notificationCount = rand(2, 8);
            
            for ($i = 1; $i <= $notificationCount; $i++) {
                $notificationType = $this->getRandomNotificationType();
                
                Notification::create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'type' => $notificationType,
                    'message' => $this->generateNotificationMessage($notificationType),
                    'is_read' => rand(0, 10) > 3, // 70% chance of being read
                    'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23))
                ]);
            }
        }
    }

    private function getRandomNotificationType(): string
    {
        $types = [
            'job_assigned', 'job_completed', 'job_cancelled', 'job_updated',
            'form_submitted', 'inspection_due', 'certification_expiring',
            'equipment_maintenance', 'schedule_updated', 'system_update',
            'safety_alert', 'training_reminder', 'document_uploaded',
            'message_received', 'approval_required'
        ];

        return $types[rand(0, count($types) - 1)];
    }

    private function generateNotificationMessage($type): string
    {
        $messages = [
            'job_assigned' => [
                'You have been assigned to a new job: Electrical Installation #1234',
                'New job assignment: HVAC Maintenance at Downtown Office',
                'Job assigned: Safety Inspection at Construction Site #5',
                'You have been assigned to: Equipment Repair at Factory A'
            ],
            'job_completed' => [
                'Job #1234 has been marked as completed',
                'Maintenance work at Site B has been completed successfully',
                'Installation job finished - customer signature received',
                'Inspection task completed with all requirements met'
            ],
            'job_cancelled' => [
                'Job #1234 has been cancelled by the customer',
                'Scheduled maintenance has been cancelled due to site closure',
                'Installation appointment cancelled - will be rescheduled',
                'Emergency repair job cancelled - issue resolved internally'
            ],
            'job_updated' => [
                'Job #1234 details have been updated - please review',
                'Schedule change: Your 2PM appointment moved to 3PM',
                'Job location updated - check new address details',
                'Additional requirements added to your current assignment'
            ],
            'form_submitted' => [
                'Safety checklist form submitted successfully',
                'Work completion report has been submitted for review',
                'Customer feedback form submitted with 5-star rating',
                'Inspection report submitted and awaiting approval'
            ],
            'inspection_due' => [
                'Equipment inspection due this week - please schedule',
                'Monthly safety inspection required for Site A',
                'Vehicle inspection due in 5 days',
                'Annual certification inspection scheduled for next week'
            ],
            'certification_expiring' => [
                'Your First Aid certification expires in 30 days',
                'Forklift operator license renewal required soon',
                'Safety training certification expires next month',
                'Professional license renewal due in 2 weeks'
            ],
            'equipment_maintenance' => [
                'Vehicle #123 is due for scheduled maintenance',
                'Power tool calibration required - return to office',
                'Testing equipment needs annual calibration',
                'Safety equipment inspection due this week'
            ],
            'schedule_updated' => [
                'Your work schedule for next week has been updated',
                'Tomorrow\'s appointments have been rescheduled',
                'New shift assignment starts Monday',
                'Break time schedule adjusted for your team'
            ],
            'system_update' => [
                'System maintenance scheduled for tonight 11PM-2AM',
                'New mobile app version available for download',
                'Feature update: Digital signatures now available',
                'System backup completed successfully'
            ],
            'safety_alert' => [
                'Safety alert: High winds expected at construction sites',
                'Chemical spill reported at Site C - avoid area',
                'Traffic disruption on Main Street affects Route 5',
                'Emergency equipment test scheduled for 2PM today'
            ],
            'training_reminder' => [
                'Mandatory safety training session tomorrow at 9AM',
                'CPR recertification class next Friday',
                'New equipment training available online',
                'Quarterly safety meeting scheduled for next week'
            ],
            'document_uploaded' => [
                'New safety procedures document uploaded',
                'Updated work instructions available in your portal',
                'Certification documents uploaded to your profile',
                'Project specifications updated - review required'
            ],
            'message_received' => [
                'New message from supervisor regarding Job #1234',
                'Customer inquiry received about your recent work',
                'Team announcement: New safety protocols effective Monday',
                'Important update from management - please read'
            ],
            'approval_required' => [
                'Your overtime request requires supervisor approval',
                'Expense report submitted - awaiting approval',
                'Training course enrollment pending approval',
                'Equipment purchase request under review'
            ]
        ];

        $typeMessages = $messages[$type] ?? ['General notification message'];
        return $typeMessages[rand(0, count($typeMessages) - 1)];
    }
}
