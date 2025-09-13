<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\TenantQuota;
use Illuminate\Console\Command;

class SyncQuotaUsage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'quota:sync {--tenant= : Sync quotas for specific tenant ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize quota current_usage with actual data from database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->option('tenant');
        
        if ($tenantId) {
            $tenant = Tenant::findOrFail($tenantId);
            $this->syncTenantQuotas($tenant);
            $this->info("Quotas synced for tenant: {$tenant->name}");
        } else {
            $tenants = Tenant::all();
            $this->info("Syncing quotas for all {$tenants->count()} tenants...");
            
            $bar = $this->output->createProgressBar($tenants->count());
            $bar->start();
            
            foreach ($tenants as $tenant) {
                $this->syncTenantQuotas($tenant);
                $bar->advance();
            }
            
            $bar->finish();
            $this->newLine();
            $this->info('All quotas synchronized successfully!');
        }
    }

    private function syncTenantQuotas(Tenant $tenant)
    {
        // Calculate actual usage for each quota type
        $actualUsage = [
            'users' => $tenant->users()->where('is_active', true)->count(),
            'workers' => $tenant->workers()->where('status', 'active')->count(),
            'jobs_per_month' => $tenant->jobs()->whereIn('status', ['assigned', 'in_progress', 'pending'])
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'assets' => $tenant->assets()->where('status', 'active')->count(),
            'storage_mb' => $this->calculateStorageUsage($tenant),
        ];

        // Update quotas with actual usage
        foreach ($actualUsage as $quotaType => $usage) {
            $quota = TenantQuota::where('tenant_id', $tenant->id)
                ->where('quota_type', $quotaType)
                ->first();
            
            if ($quota) {
                $quota->current_usage = $usage;
                
                // Update status based on usage percentage
                if ($quota->isExceeded()) {
                    $quota->status = 'exceeded';
                } elseif ($quota->getUsagePercentage() >= 75) {
                    $quota->status = 'warning';
                } else {
                    $quota->status = 'active';
                }
                
                $quota->save();
                
                $this->line("  {$tenant->name}: {$quotaType} = {$usage}");
            }
        }
    }

    private function calculateStorageUsage(Tenant $tenant): int
    {
        // Calculate storage usage in MB
        // This is a simplified calculation - in real app you'd check actual file sizes
        $attachmentCount = $tenant->attachments()->count();
        $avgFileSize = 2; // Assume 2MB average file size
        
        return $attachmentCount * $avgFileSize;
    }
}
