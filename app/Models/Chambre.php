<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Chambre extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_chambre';

    protected $fillable = [
        'num_chambre', 
        'type_chambre', 
        'statut', 
        'maintenance_duree',
        'etage', 
        'equipements'
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'id_chambre');
    }
}