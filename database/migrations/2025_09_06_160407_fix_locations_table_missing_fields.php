<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            // Drop foreign key constraint first, then the column if it exists
            if (Schema::hasColumn('locations', 'sector_id')) {
                $table->dropForeign(['sector_id']);
                $table->dropColumn('sector_id');
            }
        });
        
        Schema::table('locations', function (Blueprint $table) {
            // Add sector_id with correct type (bigint unsigned)
            $table->unsignedBigInteger('sector_id')->nullable()->after('tenant_id');
            $table->foreign('sector_id')->references('id')->on('sectors')->onDelete('set null');
            
            // Add missing columns only if they don't exist
            if (!Schema::hasColumn('locations', 'city')) {
                $table->string('city')->nullable()->after('address');
            }
            if (!Schema::hasColumn('locations', 'state')) {
                $table->string('state')->nullable()->after('city');
            }
            if (!Schema::hasColumn('locations', 'postal_code')) {
                $table->string('postal_code')->nullable()->after('state');
            }
            if (!Schema::hasColumn('locations', 'country')) {
                $table->string('country')->nullable()->after('postal_code');
            }
            if (!Schema::hasColumn('locations', 'location_type')) {
                $table->string('location_type')->default('office')->after('country');
            }
            if (!Schema::hasColumn('locations', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('location_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['sector_id']);
            $table->dropColumn(['sector_id', 'location_type', 'is_active']);
        });
        
        Schema::table('locations', function (Blueprint $table) {
            // Restore old sector_id column
            $table->uuid('sector_id')->nullable()->after('tenant_id');
        });
    }
};
