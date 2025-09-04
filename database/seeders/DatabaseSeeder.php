<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Order is important due to foreign key constraints
        $this->call([
            // Basic reference data (no dependencies)
            SectorSeeder::class,
            FeatureSeeder::class,
            PermissionSeeder::class,
            SkillSeeder::class,
            CertificationSeeder::class,
            
            // Tenant-related data
            TenantSeeder::class,
            TenantQuotaSeeder::class,
            RoleSeeder::class,
            
            // User and worker data
            UserSeeder::class,
            WorkerSeeder::class,
            
            // Location and asset data
            LocationSeeder::class,
            AssetSeeder::class,
            
            // Job-related data
            JobSeeder::class,
            
            // Form-related data
            FormSeeder::class,
            FormResponseSeeder::class,
            
            // Additional data
            AttachmentSeeder::class,
            NotificationSeeder::class,
            AuditLogSeeder::class,
        ]);

        $this->command->info('✅ All seeders completed successfully!');
        $this->command->info('🔧 Database populated with comprehensive test data');
        $this->command->line('');
        $this->command->info('📊 Summary:');
        $this->command->info('   • Tenants with multi-sector data');
        $this->command->info('   • Users with role-based permissions');
        $this->command->info('   • Workers with skills and certifications');
        $this->command->info('   • Jobs with assignments and tracking');
        $this->command->info('   • Dynamic forms with responses');
        $this->command->info('   • Assets and location management');
        $this->command->info('   • Audit logs and notifications');
        $this->command->line('');
        $this->command->info('🔑 Test credentials:');
        $this->command->info('   Email: admin@[tenantname].com');
        $this->command->info('   Password: password');
    }
}
