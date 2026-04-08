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
        Schema::create('intervenants', function (Blueprint $table) {
            $table->id('id_inter');
            $table->string('nom');
            $table->string('prenom');
            $table->string('cin')->unique();
            $table->string('telephone');
            $table->string('email');
            $table->string('ville');
            $table->unsignedBigInteger('id_org');
            $table->date('date_naissance');
            $table->string('cadre');
            $table->string('mission');
            $table->string('nationalite');
            $table->text('adresse');
            $table->timestamps();

            $table->foreign('id_org')->references('id_org')->on('organisations')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('intervenants');
    }
};
