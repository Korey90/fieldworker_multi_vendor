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
        Schema::create('job_assignments', function (Blueprint $table) {            
            $table->uuid('id')->primary();            
            $table->uuid('job_id');
            $table->uuid('worker_id');
            $table->string('role')->nullable();
            $table->string('status')->default('assigned');
            // Add missing fields
            $table->timestamp('assigned_at')->default(now());
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // add foreign keys
            $table->foreign('job_id')->references('id')->on('tenant_jobs')->onDelete('cascade');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');
            
            // Add unique constraint for job_id + worker_id
            //$table->primary(['job_id', 'worker_id']);
            //$table->unique(['job_id', 'worker_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_assignments');
    }
};
