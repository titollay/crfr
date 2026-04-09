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
        Schema::create('chambres', function (Blueprint $table) {
            $table->id('id_chambre');
            $table->string('num_chambre')->unique(); // Unique pour éviter deux chambres avec le même numéro
            $table->string('type_chambre'); // Ex: Simple, Double, Suite
            
            // Utilisation de ENUM pour restreindre les choix
            $table->enum('statut', ['Disponible', 'Occupée', 'Maintenance'])->default('Disponible');
            
            $table->integer('etage');
            $table->text('equipements')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chambres');
    }
};
