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
        Schema::table('audit_logs', function (Blueprint $table) {
            // Add columns that controller expects
            $table->string('model_type')->nullable()->after('action'); // alias for entity_type
            $table->string('model_id')->nullable()->after('model_type'); // alias for entity_id
            $table->json('old_values')->nullable()->after('changes');
            $table->json('new_values')->nullable()->after('old_values');
            $table->ipAddress('ip_address')->nullable()->after('new_values');
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->json('metadata')->nullable()->after('user_agent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn([
                'model_type', 'model_id', 'old_values', 'new_values', 
                'ip_address', 'user_agent', 'metadata'
            ]);
        });
    }
};
