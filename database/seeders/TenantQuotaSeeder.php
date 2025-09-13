<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\TenantQuota;
use Illuminate\Database\Seeder;

class TenantQuotaSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            $companySize = $tenant->data['company_size'] ?? 'small';
            
            $quotaLimits = match ($companySize) {
                'large' => [
                    'users' => 500,
                    'storage_mb' => 10240, // 10GB
                    'jobs_per_month' => 5000,
                    'workers' => 200,
                    'assets' => 1000,
                ],
                'medium' => [
                    'users' => 100,
                    'storage_mb' => 5120, // 5GB
                    'jobs_per_month' => 1000,
                    'workers' => 50,
                    'assets' => 300,
                ],
                default => [
                    'users' => 25,
                    'storage_mb' => 1024, // 1GB
                    'jobs_per_month' => 200,
                    'workers' => 20,
                    'assets' => 100,
                ]
            };

            foreach ($quotaLimits as $quotaType => $limit) {
                TenantQuota::create([
                    'tenant_id' => $tenant->id,
                    'quota_type' => $quotaType,
                    'quota_limit' => $limit,
                    'current_usage' => 0,
                    'status' => 'active',
                    'reset_date' => in_array($quotaType, ['jobs_per_month']) ? now()->addMonth() : null,
                ]);
            }
        }
    }
}
