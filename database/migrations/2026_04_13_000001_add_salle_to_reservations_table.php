<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'id_salle')) {
                $table->foreignId('id_salle')->nullable()->constrained('salles', 'id_salle')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (Schema::hasColumn('reservations', 'id_salle')) {
                $table->dropForeign(['id_salle']);
                $table->dropColumn('id_salle');
            }
        });
    }
};
