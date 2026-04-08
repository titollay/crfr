<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Intervenant extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_inter';

    protected $fillable = [
        'nom', 'prenom', 'cin', 'telephone', 'email', 'ville', 
        'id_org', 'date_naissance', 'cadre', 'mission', 
        'nationalite', 'adresse'
    ];

    public function organisation()
    {
        return $this->belongsTo(Organisation::class, 'id_org');
    }
}