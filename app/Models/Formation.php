<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_forma';

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    protected $fillable = [
        'sujet', 'statut', 'categorie_cible', 'id_org', 'lieu',
        'date_debut', 'date_fin', 'nbr_prevu', 'nbr_reel',
        'superviseur', 'heures_formation', 'observations', 'salle', 'id_salle',
        'nb_formateurs',
    ];

    public function organisation()
    {
        return $this->belongsTo(Organisation::class, 'id_org', 'id_org');
    }

    public function salle_relation()
    {
        return $this->belongsTo(Salle::class, 'id_salle', 'id_salle');
    }

    public function formateurs()
    {
        return $this->belongsToMany(Formateur::class, 'formation_formateur', 'formation_id', 'formateur_id');
    }
}
