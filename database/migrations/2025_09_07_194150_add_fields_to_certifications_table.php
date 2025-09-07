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
        Schema::table('certifications', function (Blueprint $table) {
            if (!Schema::hasColumn('certifications', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('certifications', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            if (!Schema::hasColumn('certifications', 'tenant_id')) {
                $table->uuid('tenant_id');
                $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            }
            if (!Schema::hasColumn('certifications', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certifications', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn(['description', 'is_active', 'tenant_id']);
            $table->dropTimestamps();
        });
    }
};
