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
        Schema::table('signatures', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->after('form_response_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->string('signatory_name')->nullable()->after('user_id');
            $table->string('signatory_role')->nullable()->after('signatory_name');
            $table->string('signature_path')->nullable()->after('signature_image_path');
            $table->string('document_hash')->nullable()->after('signature_path');
            $table->timestamp('signed_at')->nullable()->after('document_hash');
            $table->json('metadata')->nullable()->after('signed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('signatures', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id',
                'signatory_name', 
                'signatory_role',
                'signature_path',
                'document_hash',
                'signed_at',
                'metadata'
            ]);
        });
    }
};
