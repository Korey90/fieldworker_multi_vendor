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
            
            $quotas = match ($companySize) {
                'large' => [
                    'max_users' => 500,
                    'max_storage_mb' => 10240, // 10GB
                    'max_jobs_per_month' => 5000
                ],
                'medium' => [
                    'max_users' => 100,
                    'max_storage_mb' => 5120, // 5GB
                    'max_jobs_per_month' => 1000
                ],
                default => [
                    'max_users' => 25,
                    'max_storage_mb' => 1024, // 1GB
                    'max_jobs_per_month' => 200
                ]
            };

            TenantQuota::create([
                'tenant_id' => $tenant->id,
                ...$quotas
            ]);
        }
    }
}
