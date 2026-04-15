<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $primaryKey = 'id_salle';

    protected $fillable = [
        'num_salle',
        'statut',
    ];

    public function formations()
    {
        return $this->hasMany(Formation::class, 'id_salle');
    }
}
