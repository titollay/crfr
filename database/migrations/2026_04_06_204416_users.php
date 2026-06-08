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
    Schema::create('users', function (Blueprint $table) {

    $table->id('id_user'); 

    $table->string('nom');
    $table->string('prenom');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['admin', 'employeHotel', 'employeFormation'])->nullable();


    $table->timestamps();

    // 2. Pour "LastLogin"
    // On utilise souvent 'timestamp' ou 'dateTime' et on le met en 'nullable' 
    // car au moment de la création du compte, l'utilisateur ne s'est pas encore connecté.
    $table->timestamp('last_login_at')->nullable();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
