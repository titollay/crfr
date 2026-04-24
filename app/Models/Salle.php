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

    /**
     * Sync a single salle's status based on current formations.
     */
    public function syncStatus()
    {
        $today = \Carbon\Carbon::today()->toDateString();
        
        $hasActive = $this->formations()
            ->where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->exists();

        $newStatus = $hasActive ? 'Occupée' : 'Disponible';
        
        if ($this->statut !== $newStatus) {
            $this->update(['statut' => $newStatus]);
        }
    }

    /**
     * Sync all salle statuses.
     */
    public static function syncAllStatuses()
    {
        $today = \Carbon\Carbon::today()->toDateString();
        
        // IDs of salles with active formations today
        $occupiedSalleIds = Formation::where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->whereNotNull('id_salle')
            ->pluck('id_salle')
            ->unique()
            ->toArray();

        // Update to 'Occupée'
        self::whereIn('id_salle', $occupiedSalleIds)
            ->where('statut', '!=', 'Occupée')
            ->update(['statut' => 'Occupée']);

        // Update to 'Disponible'
        self::whereNotIn('id_salle', $occupiedSalleIds)
            ->where('statut', '!=', 'Disponible')
            ->update(['statut' => 'Disponible']);
    }
}
