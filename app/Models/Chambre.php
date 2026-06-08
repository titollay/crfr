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
        'maintenance_at',
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
        $today = \Carbon\Carbon::today();
        $todayStr = $today->toDateString();
        
        // 1. Release rooms from maintenance if duration exceeded
        self::where('statut', 'Maintenance')
            ->whereNotNull('maintenance_at')
            ->whereNotNull('maintenance_duree')
            ->get()
            ->each(function ($chambre) use ($today) {
                $start = \Carbon\Carbon::parse($chambre->maintenance_at);
                if ($start->diffInDays($today) >= $chambre->maintenance_duree) {
                    $chambre->update([
                        'statut' => 'Disponible',
                        'maintenance_at' => null,
                        'maintenance_duree' => null
                    ]);
                }
            });

        // 2. IDs of rooms with active reservations today
        $occupiedRoomIds = Reservation::whereIn('statut', ['Confirmée', 'En attente'])
            ->where('date_debut', '<=', $todayStr)
            ->where('date_fin', '>=', $todayStr)
            ->pluck('id_chambre')
            ->unique()
            ->toArray();

        // 3. Update to 'Occupée'
        self::whereIn('id_chambre', $occupiedRoomIds)
            ->whereNotIn('statut', ['En maintenance', 'Maintenance', 'Occupée'])
            ->update(['statut' => 'Occupée']);

        // 4. Update to 'Disponible'
        self::whereNotIn('id_chambre', $occupiedRoomIds)
            ->whereNotIn('statut', ['En maintenance', 'Maintenance', 'Disponible'])
            ->update(['statut' => 'Disponible']);
    }
}