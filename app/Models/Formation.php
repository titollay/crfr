<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Formation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_forma';

    protected $fillable = [
        'sujet', 'categorie_cible', 'organisateur', 'lieu', 
        'date_debut', 'date_fin', 'nbr_prevu', 'nbr_reel', 
        'superviseur', 'heures_formation', 'observations'
    ];
}