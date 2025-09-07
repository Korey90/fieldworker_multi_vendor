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
        Schema::table('permissions', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('permissions', 'name')) {
                $table->string('name')->after('id');
            }
            if (!Schema::hasColumn('permissions', 'permission_key')) {
                $table->string('permission_key')->unique()->after('key');
            }
            if (!Schema::hasColumn('permissions', 'permission_group')) {
                $table->string('permission_group')->after('permission_key');
            }
            if (!Schema::hasColumn('permissions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
            if (!Schema::hasColumn('permissions', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'permission_key', 
                'permission_group',
                'is_active',
                'created_at',
                'updated_at'
            ]);
        });
    }
};
