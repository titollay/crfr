<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only run if the 'salle' column exists (old enum type)
        if (Schema::hasColumn('formations', 'salle')) {
            // Change from ENUM to VARCHAR
            DB::statement("ALTER TABLE formations MODIFY salle VARCHAR(255) NULL");

            // Update existing enum values to human-readable names
            $mapping = [
                'salle1' => 'Salle 1',
                'salle2' => 'Salle 2',
                'salle3' => 'Salle 3',
                'salle4' => 'Salle 4',
                'salle5' => 'Salle 5',
                'salle6' => 'Salle 6',
            ];
            foreach ($mapping as $old => $new) {
                DB::table('formations')->where('salle', $old)->update(['salle' => $new]);
            }
        }
        // If 'salle' column doesn't exist, the table uses id_salle FK already — nothing to do.
    }

    public function down(): void
    {
        if (Schema::hasColumn('formations', 'salle')) {
            $mapping = [
                'Salle 1' => 'salle1',
                'Salle 2' => 'salle2',
                'Salle 3' => 'salle3',
                'Salle 4' => 'salle4',
                'Salle 5' => 'salle5',
                'Salle 6' => 'salle6',
            ];
            foreach ($mapping as $old => $new) {
                DB::table('formations')->where('salle', $old)->update(['salle' => $new]);
            }
            DB::statement("ALTER TABLE formations MODIFY salle ENUM('salle1','salle2','salle3','salle4','salle5','salle6') NOT NULL");
        }
    }
};
