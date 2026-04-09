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
            $table->enum('statut', ['planifiee', 'en cours', 'terminee']);
            $table->string('categorie_cible');


            // Kept for compatibility with current model fillable
            $table->unsignedBigInteger('id_org');

            $table->enum('salle', ['salle1', 'salle2', 'salle3', 'salle4', 'salle5', 'salle6']);
            $table->date('date_debut');
            $table->date('date_fin');
            $table->unsignedInteger('nbr_prevu')->default(0);
            $table->unsignedInteger('nbr_reel')->default(0);
            $table->string('superviseur')->nullable();
            $table->unsignedInteger('heures_formation')->default(0);
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->foreign('id_org')->references('id_org')->on('organisations')->onDelete('cascade');
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
