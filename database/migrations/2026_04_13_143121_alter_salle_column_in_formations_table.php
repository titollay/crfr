<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change the salle column from ENUM to VARCHAR to support dynamic salle names
        DB::statement("ALTER TABLE formations MODIFY salle VARCHAR(255) NOT NULL");

        // Update existing data to match the salles table num_salle values
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

    public function down(): void
    {
        // Revert data back to old enum values
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
};
