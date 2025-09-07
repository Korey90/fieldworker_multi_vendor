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
        // Tworzymy nową tabelę z elastyczną strukturą
        Schema::dropIfExists('tenant_quotas');
        
        Schema::create('tenant_quotas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            // Elastyczna struktura kwot
            $table->string('quota_type', 100); // users, workers, jobs, assets, storage, api_calls, forms, etc.
            $table->bigInteger('quota_limit')->default(0); // -1 = unlimited, 0+ = limit
            $table->bigInteger('current_usage')->default(0);
            
            // Status i metadata
            $table->enum('status', ['active', 'inactive', 'exceeded', 'warning'])->default('active');
            $table->timestamp('reset_date')->nullable(); // dla cyklicznych kwot jak monthly jobs
            $table->json('metadata')->nullable(); // dodatkowe informacje specyficzne dla typu kwoty
            
            // Indeksy
            $table->unique(['tenant_id', 'quota_type']); // jeden typ kwoty na tenant
            $table->index(['tenant_id', 'status']);
            $table->index(['quota_type']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_quotas');
        
        // Przywracamy starą strukturę
        Schema::create('tenant_quotas', function (Blueprint $table) {
            $table->uuid('tenant_id')->primary();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            $table->integer('max_users')->nullable();
            $table->integer('max_storage_mb')->nullable();
            $table->integer('max_jobs_per_month')->nullable();

            $table->timestamps();
        });
    }
};
