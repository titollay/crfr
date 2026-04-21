<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormationImage extends Model
{
    use HasFactory;

    protected $fillable = ['formation_id', 'path'];

    public function formation()
    {
        return $this->belongsTo(Formation::class, 'formation_id', 'id_forma');
    }
}
