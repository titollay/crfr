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
        Schema::create('organisations', function (Blueprint $table) {
            $table->id('id_org');
            $table->string('nom');
            $table->string('ville_org');
            $table->string('type');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps(); // Pour created_at

            $table
                ->foreign('parent_id')
                ->references('id_org')
                ->on('organisations')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organisations');
    }
};
