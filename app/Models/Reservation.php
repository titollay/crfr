<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_resev';

    protected $fillable = [
        'id_inter',
        'id_inter_2',
        'id_chambre',
        'id_salle',
        'date_debut',
        'date_fin',
        'created_by',
        'statut',
    ];

    public function intervenant()
    {
        return $this->belongsTo(Intervenant::class, 'id_inter');
    }

    public function intervenant2()
    {
        return $this->belongsTo(Intervenant::class, 'id_inter_2');
    }

    public function chambre()
    {
        return $this->belongsTo(Chambre::class, 'id_chambre');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class, 'id_salle');
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_user');
    }
}
