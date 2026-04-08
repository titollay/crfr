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
        $table->id('id_resev');
            $table->unsignedBigInteger('id_inter');
            $table->unsignedBigInteger('id_chambre');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->unsignedBigInteger('created_by'); // Relie à id_user
            $table->string('statut');
            $table->timestamps();

            $table->foreign('id_inter')->references('id_inter')->on('intervenants');
            $table->foreign('id_chambre')->references('id_chambre')->on('chambres');
            $table->foreign('created_by')->references('id_user')->on('users');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
