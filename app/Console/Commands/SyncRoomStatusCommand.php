<?php

namespace App\Console\Commands;

use App\Models\Chambre;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SyncRoomStatusCommand extends Command
{
    protected $signature = 'rooms:sync-status';

    protected $description = 'Sync room status based on active reservations';

    public function handle()
    {
        $this->info('Syncing room statuses...');

        $chambres = Chambre::all();
        $today = Carbon::today()->toDateString();

        foreach ($chambres as $chambre) {
            $hasActive = Reservation::where('id_chambre', $chambre->id_chambre)
                ->where('statut', 'Confirmée')
                ->where('date_debut', '<=', $today)
                ->where('date_fin', '>=', $today)
                ->exists();

            if ($chambre->statut !== 'Maintenance') {
                $chambre->statut = $hasActive ? 'Occupée' : 'Disponible';
                $chambre->save();
            }
        }

        $this->info('Room statuses synced successfully.');
    }
}
