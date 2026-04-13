<?php

namespace App\Console\Commands;

use App\Models\Formation;
use App\Models\Salle;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SyncSalleStatus extends Command
{
    protected $signature = 'salles:sync-status';

    protected $description = 'Sync salle status based on active formations';

    public function handle()
    {
        $this->info('Syncing salle statuses...');

        $salles = Salle::all();
        $today = Carbon::today()->toDateString();

        foreach ($salles as $salle) {
            $hasActive = Formation::where('salle', $salle->num_salle)
                ->where('date_debut', '<=', $today)
                ->where('date_fin', '>=', $today)
                ->exists();

            $salle->statut = $hasActive ? 'Occupée' : 'Disponible';
            $salle->save();
        }

        $this->info('Salle statuses synced successfully.');
    }
}
