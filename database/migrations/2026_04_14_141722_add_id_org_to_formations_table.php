<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add id_org only if it doesn't already exist
        if (!Schema::hasColumn('formations', 'id_org')) {
            Schema::table('formations', function (Blueprint $table) {
                // Add nullable first so existing rows don't break
                $table->unsignedBigInteger('id_org')->nullable()->after('categorie_cible');
            });

            // Try to populate id_org from organisee_par / organisateur if those columns exist
            if (Schema::hasColumn('formations', 'organisee_par')) {
                DB::statement('
                    UPDATE formations f
                    JOIN organisations o ON o.nom = f.organisee_par
                    SET f.id_org = o.id_org
                    WHERE f.id_org IS NULL
                ');
            }

            // Make it non-nullable with a safe default (first organisation or 0)
            $firstOrg = DB::table('organisations')->value('id_org');
            if ($firstOrg) {
                DB::statement("UPDATE formations SET id_org = {$firstOrg} WHERE id_org IS NULL");
                // Now add the foreign key
                Schema::table('formations', function (Blueprint $table) {
                    $table->foreign('id_org')
                          ->references('id_org')
                          ->on('organisations')
                          ->onDelete('cascade');
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            if (Schema::hasColumn('formations', 'id_org')) {
                $table->dropForeign(['id_org']);
                $table->dropColumn('id_org');
            }
        });
    }
};
