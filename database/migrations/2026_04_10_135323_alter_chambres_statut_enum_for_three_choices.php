<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Normalize legacy values before tightening enum.
        DB::statement("UPDATE chambres SET statut = 'Disponible' WHERE statut IN ('disponible', 'Disponible')");
        DB::statement("UPDATE chambres SET statut = 'Occupée' WHERE statut IN ('occupe', 'occupee', 'Occupée')");

        // Any unknown value is considered maintenance-safe fallback.
        DB::statement("UPDATE chambres SET statut = 'Maintenance' WHERE statut NOT IN ('Disponible', 'Occupée', 'Maintenance')");

        DB::statement("
            ALTER TABLE chambres
            MODIFY statut ENUM('Disponible','Occupée','Maintenance')
            NOT NULL DEFAULT 'Disponible'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE chambres SET statut = 'disponible' WHERE statut = 'Disponible'");
        DB::statement("UPDATE chambres SET statut = 'occupe' WHERE statut IN ('Occupée', 'Maintenance')");

        DB::statement("
            ALTER TABLE chambres
            MODIFY statut ENUM('disponible','occupe')
            NOT NULL DEFAULT 'disponible'
        ");
    }
};
