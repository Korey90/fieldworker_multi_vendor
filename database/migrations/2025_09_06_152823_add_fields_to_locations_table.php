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
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('state');
            $table->string('country')->nullable()->after('postal_code');
            $table->unsignedBigInteger('sector_id')->nullable()->after('tenant_id');
            $table->foreign('sector_id')->references('id')->on('sectors')->onDelete('set null');
            $table->string('location_type')->default('office')->after('country');
            $table->boolean('is_active')->default(true)->after('location_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['sector_id']);
            $table->dropColumn([
                'city',
                'state', 
                'postal_code',
                'country',
                'sector_id',
                'location_type',
                'is_active'
            ]);
        });
    }
};
