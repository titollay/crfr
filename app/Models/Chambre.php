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

    /**
     * Sync a single room's status based on current reservations.
     */
    public function syncStatus()
    {
        if ($this->statut === 'En maintenance' || $this->statut === 'Maintenance') {
            return;
        }

        $today = \Carbon\Carbon::today()->toDateString();
        
        $hasActive = $this->reservations()
            ->whereIn('statut', ['Confirmée', 'En attente'])
            ->where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->exists();

        $newStatus = $hasActive ? 'Occupée' : 'Disponible';
        
        if ($this->statut !== $newStatus) {
            $this->update(['statut' => $newStatus]);
        }
    }

    /**
     * Sync all room statuses.
     */
    public static function syncAllStatuses()
    {
        $today = \Carbon\Carbon::today()->toDateString();
        
        // IDs of rooms with active reservations today
        $occupiedRoomIds = Reservation::whereIn('statut', ['Confirmée', 'En attente'])
            ->where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->pluck('id_chambre')
            ->unique()
            ->toArray();

        // Update to 'Occupée'
        self::whereIn('id_chambre', $occupiedRoomIds)
            ->whereNotIn('statut', ['En maintenance', 'Maintenance', 'Occupée'])
            ->update(['statut' => 'Occupée']);

        // Update to 'Disponible'
        self::whereNotIn('id_chambre', $occupiedRoomIds)
            ->whereNotIn('statut', ['En maintenance', 'Maintenance', 'Disponible'])
            ->update(['statut' => 'Disponible']);
    }
}