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
        Schema::table('form_responses', function (Blueprint $table) {
            // Drop old columns
            $table->dropForeign(['tenant_job_id']);
            $table->dropForeign(['worker_id']);
            $table->dropColumn(['tenant_job_id', 'worker_id', 'answers']);
            
            // Add new columns
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->uuid('job_id')->nullable();
            $table->foreign('job_id')->references('id')->on('tenant_jobs')->onDelete('set null');
            
            $table->json('response_data');
            $table->boolean('is_submitted')->default(false);
            $table->timestamp('submitted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_responses', function (Blueprint $table) {
            // Drop new columns
            $table->dropForeign(['tenant_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['job_id']);
            $table->dropColumn(['tenant_id', 'user_id', 'job_id', 'response_data', 'is_submitted', 'submitted_at']);
            
            // Restore old columns
            $table->uuid('tenant_job_id')->nullable();
            $table->foreign('tenant_job_id')->references('id')->on('tenant_jobs')->onDelete('set null');

            $table->uuid('worker_id')->nullable();
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('set null');

            $table->json('answers');
        });
    }
};
