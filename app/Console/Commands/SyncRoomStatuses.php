<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Chambre;

class SyncRoomStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-room-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize all room statuses based on current active reservations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting room status synchronization...');
        Chambre::syncAllStatuses();
        $this->info('Synchronization completed successfully.');
    }
}
