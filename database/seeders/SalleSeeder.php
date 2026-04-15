<?php

namespace Database\Seeders;

use App\Models\Salle;
use Illuminate\Database\Seeder;

class SalleSeeder extends Seeder
{
    public function run()
    {
        $salles = [
            ['num_salle' => 'Salle 1', 'statut' => 'Disponible'],
            ['num_salle' => 'Salle 2', 'statut' => 'Disponible'],
            ['num_salle' => 'Salle 3', 'statut' => 'Disponible'],
            ['num_salle' => 'Salle 4', 'statut' => 'Disponible'],
            ['num_salle' => 'Salle 5', 'statut' => 'Disponible'],
            ['num_salle' => 'Salle 6', 'statut' => 'Disponible'],
        ];

        foreach ($salles as $salle) {
            Salle::create($salle);
        }
    }
}
