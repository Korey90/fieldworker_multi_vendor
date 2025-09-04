<?php

namespace Database\Seeders;

use App\Models\Tenat;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenat::all();

        foreach ($tenants as $tenant) {
            $users = User::where('tenant_id', $tenant->id)->get();
            
            if ($users->isEmpty()) continue;

            $logCount = rand(20, 50);
            
            for ($i = 1; $i <= $logCount; $i++) {
                $user = $users->random();
                $action = $this->getRandomAction();
                $entityData = $this->getRandomEntity();
                
                AuditLog::create([
                    'id' => Str::uuid(),
                    'tenant_id' => $tenant->id,
                    'user_id' => $user->id,
                    'action' => $action,
                    'entity_type' => $entityData['type'],
                    'entity_id' => $entityData['id'],
                    'changes' => $this->generateChanges($action, $entityData['type']),
                    'created_at' => now()->subDays(rand(0, 90))->subHours(rand(0, 23))
                ]);
            }
        }
    }

    private function getRandomAction(): string
    {
        $actions = [
            'created', 'updated', 'deleted', 'restored',
            'assigned', 'unassigned', 'completed', 'cancelled',
            'approved', 'rejected', 'submitted', 'reviewed',
            'archived', 'activated', 'deactivated', 'exported'
        ];

        return $actions[rand(0, count($actions) - 1)];
    }

    private function getRandomEntity(): array
    {
        $entities = [
            ['type' => 'job', 'id' => Str::uuid()],
            ['type' => 'user', 'id' => Str::uuid()],
            ['type' => 'worker', 'id' => Str::uuid()],
            ['type' => 'asset', 'id' => Str::uuid()],
            ['type' => 'location', 'id' => Str::uuid()],
            ['type' => 'form', 'id' => Str::uuid()],
            ['type' => 'form_response', 'id' => Str::uuid()],
            ['type' => 'role', 'id' => rand(1, 100)],
            ['type' => 'permission', 'id' => rand(1, 50)]
        ];

        return $entities[rand(0, count($entities) - 1)];
    }

    private function generateChanges($action, $entityType): array
    {
        switch ($action) {
            case 'created':
                return $this->generateCreateChanges($entityType);
            case 'updated':
                return $this->generateUpdateChanges($entityType);
            case 'deleted':
                return ['deleted_at' => now()->toISOString()];
            case 'restored':
                return ['deleted_at' => null, 'restored_at' => now()->toISOString()];
            default:
                return $this->generateGenericChanges($action, $entityType);
        }
    }

    private function generateCreateChanges($entityType): array
    {
        switch ($entityType) {
            case 'job':
                return [
                    'title' => 'New Maintenance Job #' . rand(1000, 9999),
                    'status' => 'pending',
                    'priority' => ['low', 'normal', 'high'][rand(0, 2)],
                    'scheduled_at' => now()->addDays(rand(1, 7))->toISOString()
                ];
            case 'user':
                return [
                    'name' => 'New User',
                    'email' => 'newuser' . rand(100, 999) . '@example.com',
                    'is_active' => true,
                    'role' => 'worker'
                ];
            case 'worker':
                return [
                    'employee_number' => 'EMP-' . rand(1000, 9999),
                    'status' => 'active',
                    'department' => 'Field Operations'
                ];
            case 'asset':
                return [
                    'name' => 'New Equipment',
                    'type' => 'Power Tool',
                    'serial_number' => 'SN' . rand(100000, 999999),
                    'condition' => 'excellent'
                ];
            default:
                return ['created' => true];
        }
    }

    private function generateUpdateChanges($entityType): array
    {
        switch ($entityType) {
            case 'job':
                $changes = [];
                $possibleChanges = [
                    'status' => [
                        'old' => ['pending', 'assigned'][rand(0, 1)],
                        'new' => ['in_progress', 'completed'][rand(0, 1)]
                    ],
                    'priority' => [
                        'old' => ['low', 'normal'][rand(0, 1)],
                        'new' => ['high', 'urgent'][rand(0, 1)]
                    ],
                    'scheduled_at' => [
                        'old' => now()->subDays(1)->toISOString(),
                        'new' => now()->addDays(1)->toISOString()
                    ]
                ];

                $numberOfChanges = rand(1, 3);
                $selectedChanges = array_rand($possibleChanges, $numberOfChanges);
                if (!is_array($selectedChanges)) $selectedChanges = [$selectedChanges];

                foreach ($selectedChanges as $field) {
                    $changes[$field] = $possibleChanges[$field];
                }

                return $changes;

            case 'user':
                return [
                    'name' => [
                        'old' => 'John Smith',
                        'new' => 'John M. Smith'
                    ],
                    'phone' => [
                        'old' => '+1-555-1234',
                        'new' => '+1-555-5678'
                    ]
                ];

            case 'worker':
                return [
                    'status' => [
                        'old' => 'active',
                        'new' => ['inactive', 'on_leave'][rand(0, 1)]
                    ]
                ];

            default:
                return [
                    'updated_field' => [
                        'old' => 'old_value',
                        'new' => 'new_value'
                    ]
                ];
        }
    }

    private function generateGenericChanges($action, $entityType): array
    {
        switch ($action) {
            case 'assigned':
                return [
                    'assigned_to' => 'Worker #' . rand(100, 999),
                    'assigned_at' => now()->toISOString()
                ];
            case 'completed':
                return [
                    'completed_at' => now()->toISOString(),
                    'completion_notes' => 'Task completed successfully'
                ];
            case 'cancelled':
                return [
                    'cancelled_at' => now()->toISOString(),
                    'cancellation_reason' => 'Customer request'
                ];
            case 'approved':
                return [
                    'approved_at' => now()->toISOString(),
                    'approved_by' => 'Supervisor'
                ];
            case 'submitted':
                return [
                    'submitted_at' => now()->toISOString(),
                    'submission_type' => 'form_response'
                ];
            default:
                return [
                    'action_performed' => $action,
                    'timestamp' => now()->toISOString()
                ];
        }
    }
}
