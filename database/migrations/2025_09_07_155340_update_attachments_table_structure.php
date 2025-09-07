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
        Schema::table('attachments', function (Blueprint $table) {
            // Add missing columns for AttachmentController
            $table->string('filename')->after('entity_id');
            $table->string('original_filename')->after('filename');
            $table->string('mime_type')->nullable()->after('file_type');
            $table->uuid('user_id')->nullable()->after('tenant_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
        
        // Rename columns separately to avoid conflicts
        Schema::table('attachments', function (Blueprint $table) {
            $table->renameColumn('entity_type', 'attachable_type');
            $table->renameColumn('entity_id', 'attachable_id');
        });
        
        // Make attachable fields nullable
        Schema::table('attachments', function (Blueprint $table) {
            $table->string('attachable_type')->nullable()->change();
            $table->uuid('attachable_id')->nullable()->change();
            
            // Add data column for storing metadata
            $table->json('data')->nullable()->after('file_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            // Remove added columns
            $table->dropForeign(['user_id']);
            $table->dropColumn(['filename', 'original_filename', 'mime_type', 'user_id', 'data']);
            
            // Rename back
            $table->renameColumn('attachable_type', 'entity_type');
            $table->renameColumn('attachable_id', 'entity_id');
        });
    }
};
