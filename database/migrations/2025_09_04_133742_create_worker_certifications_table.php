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
        Schema::create('worker_certifications', function (Blueprint $table) {
            $table->uuid('worker_id');
            $table->foreign('worker_id')->references('id')->on('workers')->onDelete('cascade');

            $table->unsignedBigInteger('certification_id');
            $table->foreign('certification_id')->references('id')->on('certifications')->onDelete('cascade');

            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->primary(['worker_id', 'certification_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_certifications');
    }
};
