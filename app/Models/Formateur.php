<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formateur extends Model
{
    protected $primaryKey = 'id_formateur';

    protected $fillable = [
        'cin',
        'num_location',
        'attribut',
    ];

    public function formations()
    {
        return $this->belongsToMany(Formation::class, 'formation_formateur', 'formateur_id', 'formation_id');
    }
}
