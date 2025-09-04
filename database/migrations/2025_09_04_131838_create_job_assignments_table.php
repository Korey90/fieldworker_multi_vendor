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
            $table->uuid('tenant_job_id');
            $table->foreign('tenant_job_id')->references('id')->on('tenant_jobs')->onDelete('cascade');

            $table->uuid('worker_id');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');

            $table->string('role')->nullable();
            $table->string('status')->default('assigned');

            $table->primary(['tenant_job_id', 'worker_id']);
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
