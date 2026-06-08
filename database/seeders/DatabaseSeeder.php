<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organisation;
use App\Models\Chambre;
use App\Models\Formation;
use App\Models\Intervenant;
use App\Models\Formateur;
use App\Models\Reservation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Admin
        $admin = User::create([
            'nom' => 'Admin',
            'prenom' => 'CRFR',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Create Organisations
        $orgs = [];
        $orgNames = ['OCP Group', 'ANAPEC', 'Royal Air Maroc', 'Maroc Telecom', 'Attijariwafa Bank', 'ONCF', 'Cosumar'];
        foreach ($orgNames as $name) {
            $orgs[] = Organisation::create([
                'nom' => $name,
                'ville_org' => fake()->city(),
                'type' => fake()->randomElement(['Entreprise', 'Public', 'Association']),
            ]);
        }

        // 3. Create Chambres
        $chambres = [];
        for ($i = 101; $i <= 120; $i++) {
            $status = fake()->randomElement(['Disponible', 'Occupée', 'Maintenance']);
            $chambres[] = Chambre::create([
                'num_chambre' => (string)$i,
                'type_chambre' => fake()->randomElement(['Simple', 'Double', 'Suite', 'Triple']),
                'statut' => $status,
                'maintenance_duree' => $status === 'Maintenance' ? fake()->numberBetween(1, 7) : null,
                'maintenance_at' => $status === 'Maintenance' ? now()->subDays(fake()->numberBetween(0, 5)) : null,
                'etage' => intval($i / 100),
                'equipements' => 'Wifi, TV, Clim, Mini-bar',
            ]);
        }

        // 4. Create Formations
        $formations = [];
        $subjects = ['Leadership', 'Java Backend', 'Soft Skills', 'React Frontend', 'Cybersecurity', 'Project Management'];
        foreach ($subjects as $subject) {
            $formations[] = Formation::create([
                'sujet' => $subject,
                'statut' => fake()->randomElement(['planifiee', 'en cours', 'terminee']),
                'categorie_cible' => 'Cadres Superieurs',
                'id_org' => fake()->randomElement($orgs)->id_org,
                'salle' => fake()->randomElement(['salle1', 'salle2', 'salle3', 'salle4', 'salle5', 'salle6']),
                'date_debut' => now()->addDays(rand(-30, 30)),
                'date_fin' => now()->addDays(rand(31, 60)),
                'nbr_prevu' => rand(15, 30),
                'nbr_reel' => rand(10, 15),
                'superviseur' => fake()->name(),
                'heures_formation' => rand(20, 40),
            ]);
        }

        // 5. Create Intervenants (Bénéficiaires)
        $intervenants = [];
        for ($i = 0; $i < 30; $i++) {
            $intervenants[] = Intervenant::create([
                'nom' => fake()->lastName(),
                'prenom' => fake()->firstName(),
                'cin' => Str::upper(Str::random(2)) . rand(100000, 999999),
                'telephone' => '06' . rand(10000000, 99999999),
                'email' => fake()->unique()->safeEmail(),
                'ville' => fake()->city(),
                'id_org' => fake()->randomElement($orgs)->id_org,
                'date_naissance' => fake()->date('Y-m-d', '2000-01-01'),
                'cadre' => fake()->jobTitle(),
                'mission' => 'Formation',
                'nationalite' => 'Marocaine',
                'adresse' => fake()->address(),
            ]);
        }

        // 6. Create Formateurs
        for ($i = 0; $i < 10; $i++) {
            Formateur::create([
                'cin' => Str::upper(Str::random(2)) . rand(100000, 999999),
                'num_location' => 'LOC-' . rand(100, 999),
                'attribut' => fake()->randomElement(['Expert IT', 'Manager', 'Coach']),
            ]);
        }

        // 7. Create Reservations
        foreach (array_slice($intervenants, 0, 15) as $inter) {
            Reservation::create([
                'id_inter' => $inter->id_inter,
                'id_chambre' => fake()->randomElement($chambres)->id_chambre,
                'date_debut' => now()->addDays(rand(-5, 5)),
                'date_fin' => now()->addDays(rand(6, 15)),
                'created_by' => $admin->id_user,
                'statut' => fake()->randomElement(['Confirmée', 'Annulée', 'En attente']),
            ]);
        }
    }
}
