<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // IMPORTANT pour le login React

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Dis à Laravel que ta clé primaire n'est pas "id" mais "id_user"
     */
    protected $primaryKey = 'id_user';

    /**
     * Les attributs qui peuvent être remplis (Mass Assignment).
     * Doit correspondre exactement aux noms de tes colonnes en SQL.
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'photo',
        'last_login_at',
    ];

    /**
     * Les attributs cachés (ne seront pas envoyés dans la réponse JSON vers React).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts pour transformer les types de données automatiquement.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }
}