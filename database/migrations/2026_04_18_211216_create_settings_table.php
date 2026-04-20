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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, json, file, color, boolean
            $table->string('group')->default('general'); // general, formation, hotel, system
            $table->string('label')->nullable();
            $table->timestamps();
        });

        // Seed initial values
        DB::table('settings')->insert([
            // Branding
            [
                'key' => 'site_name',
                'value' => 'CRFR Dashboard',
                'type' => 'text',
                'group' => 'general',
                'label' => 'Nom du Projet',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'site_logo',
                'value' => null, // Will use default if null
                'type' => 'file',
                'group' => 'general',
                'label' => 'Logo du Projet',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'primary_color',
                'value' => '#D97706',
                'type' => 'color',
                'group' => 'general',
                'label' => 'Couleur Primaire',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Formation Taxonomy
            [
                'key' => 'formation_categories',
                'value' => json_encode(['EFJIO', 'EFJOEIZ', 'Médicale', 'Technique']),
                'type' => 'json',
                'group' => 'formation',
                'label' => 'Catégories de Formation',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // HR Taxonomy
            [
                'key' => 'hr_cadres',
                'value' => json_encode(['Technicien', 'Manager', 'Ingénieur', 'Administrateur']),
                'type' => 'json',
                'group' => 'rh',
                'label' => 'الأطر المهنية (Cadres)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'nationalities',
                'value' => json_encode(['Marocaine', 'Algérienne', 'Tunisienne', 'Française']),
                'type' => 'json',
                'group' => 'rh',
                'label' => 'Nationalités',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
