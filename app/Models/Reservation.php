<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_resev';

    protected $fillable = [
        'id_inter', 
        'id_inter_2',
        'id_chambre', 
        'date_debut', 
        'date_fin', 
        'created_by', 
        'statut'
    ];

    // Relation avec l'intervenant principal qui réserve
    public function intervenant()
    {
        return $this->belongsTo(Intervenant::class, 'id_inter');
    }

    // Relation avec le deuxième intervenant
    public function intervenant2()
    {
        return $this->belongsTo(Intervenant::class, 'id_inter_2');
    }

    // Relation avec la chambre réservée
    public function chambre()
    {
        return $this->belongsTo(Chambre::class, 'id_chambre');
    }

    // Relation avec l'utilisateur (employé) qui a créé la réservation
    public function createur()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_user');
    }
}