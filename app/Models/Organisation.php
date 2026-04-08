<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Organisation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_org';

    protected $fillable = [
        'nom',
        'ville_org',
        'type',
        'parent_id'
    ];

    public function intervenants()
    {
        return $this->hasMany(Intervenant::class, 'id_org');
    }
}