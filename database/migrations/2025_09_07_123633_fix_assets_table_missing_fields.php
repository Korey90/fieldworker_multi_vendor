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
        Schema::table('assets', function (Blueprint $table) {
            // Drop existing type column and add new fields
            $table->dropColumn('type');
            
            // Add missing columns expected by controller and resource
            $table->text('description')->nullable();
            $table->uuid('location_id')->nullable();
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
            $table->string('asset_type', 100);
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 12, 2)->nullable();
            $table->decimal('current_value', 12, 2)->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance', 'retired'])->default('active');
            $table->uuid('assigned_to')->nullable();
            $table->foreign('assigned_to')->references('id')->on('workers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['location_id']);
            $table->dropForeign(['assigned_to']);
            
            // Drop added columns
            $table->dropColumn([
                'description', 'location_id', 'asset_type', 
                'purchase_date', 'purchase_cost', 'current_value', 
                'status', 'assigned_to'
            ]);
            
            // Restore original type column
            $table->string('type');
        });
    }
};
