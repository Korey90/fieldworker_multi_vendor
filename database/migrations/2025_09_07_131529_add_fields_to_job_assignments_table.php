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
        Schema::table('job_assignments', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['tenant_job_id']);
            $table->dropForeign(['worker_id']);
            
            // Drop primary key
            $table->dropPrimary(['tenant_job_id', 'worker_id']);
            
            // Add ID as primary key
            $table->uuid('id')->primary()->first();
            
            // Rename tenant_job_id to job_id
            $table->renameColumn('tenant_job_id', 'job_id');
            
            // Add missing fields
            $table->timestamp('assigned_at')->default(now());
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
            
            // Re-add foreign keys
            $table->foreign('job_id')->references('id')->on('tenant_jobs')->onDelete('cascade');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
            
            // Add unique constraint for job_id + worker_id
            $table->unique(['job_id', 'worker_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_assignments', function (Blueprint $table) {
            // Drop foreign keys and unique constraint
            $table->dropForeign(['job_id']);
            $table->dropForeign(['worker_id']);
            $table->dropUnique(['job_id', 'worker_id']);
            
            // Remove added columns
            $table->dropColumn(['id', 'assigned_at', 'completed_at', 'notes', 'data', 'created_at', 'updated_at']);
            
            // Rename back to tenant_job_id
            $table->renameColumn('job_id', 'tenant_job_id');
            
            // Re-add original primary key and foreign keys
            $table->primary(['tenant_job_id', 'worker_id']);
            $table->foreign('tenant_job_id')->references('id')->on('tenant_jobs')->onDelete('cascade');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
        });
    }
};
