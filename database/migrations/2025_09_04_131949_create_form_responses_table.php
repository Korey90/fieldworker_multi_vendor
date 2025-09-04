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
        Schema::create('form_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('form_id');
            $table->foreign('form_id')->references('id')->on('forms')->onDelete('cascade');

            $table->uuid('tenant_job_id')->nullable();
            $table->foreign('tenant_job_id')->references('id')->on('tenant_jobs')->onDelete('set null');

            $table->uuid('worker_id')->nullable();
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('set null');

            $table->json('answers');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_responses');
    }
};
