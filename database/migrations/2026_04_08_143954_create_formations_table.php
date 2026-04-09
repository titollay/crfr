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
        Schema::create('formations', function (Blueprint $table) {
            $table->id('id_forma');
            $table->string('sujet');
            $table->string('statut')->default('planifiee');
            $table->string('categorie_cible');

            // As in diagram: organisee_par (links to organisations)
            $table->unsignedBigInteger('organisee_par')->nullable();

            // Kept for compatibility with current model fillable
            $table->string('organisateur')->nullable();

            $table->string('lieu');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->unsignedInteger('nbr_prevu')->default(0);
            $table->unsignedInteger('nbr_reel')->default(0);
            $table->string('superviseur')->nullable();
            $table->unsignedInteger('heures_formation')->default(0);
            $table->text('observations')->nullable();
            $table->timestamps();

            $table
                ->foreign('organisee_par')
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
        Schema::dropIfExists('formations');
    }
};
