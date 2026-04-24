<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Intervenant;
use App\Models\Reservation;
use App\Models\Formation;
use App\Models\Chambre;
use App\Models\Organisation;
use App\Models\Salle;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function summary()
    {
        // 0. Sync Room Statuses based on dates
        \App\Models\Chambre::syncAllStatuses();

        // 1. Key Metrics
        $totalIntervenants = Intervenant::count();
        $totalOrganisations = Organisation::count();
        $totalFormations = Formation::count();
        $totalReservations = Reservation::count();

        // 2. Room Status Breakdown
        $chambresStats = [
            'total' => Chambre::count(),
            'disponible' => Chambre::where('statut', 'Disponible')->count(),
            'occupee' => Chambre::where('statut', 'Occupée')->count(),
            'maintenance' => Chambre::where('statut', 'Maintenance')->count(),
        ];

        $sallesStats = [
            'disponible' => Salle::where('statut', 'Disponible')->count(),
            'occupee' => Salle::where('statut', 'Occupée')->count(),
        ];

        // 3. Recent Activity
        $recentReservations = Reservation::with(['intervenant', 'chambre'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $upcomingFormations = Formation::where('date_debut', '>=', now())
            ->orderBy('date_debut', 'asc')
            ->limit(5)
            ->get();

        // 4. Monthly Statistics (Last 6 Months)
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $months[] = Carbon::now()->subMonths($i)->format('Y-m');
        }

        $chartData = [];
        foreach ($months as $month) {
            $formattedMonth = Carbon::createFromFormat('Y-m', $month)->translatedFormat('M Y');
            $chartData[] = [
                'month' => $formattedMonth,
                'formations' => Formation::whereRaw("DATE_FORMAT(date_debut, '%Y-%m') = ?", [$month])->count(),
                'reservations' => Reservation::whereRaw("DATE_FORMAT(date_debut, '%Y-%m') = ?", [$month])->count(),
            ];
        }

        // 5. Global Impact (Sum nbr_reel from formations)
        $globalImpact = Formation::sum('nbr_reel');

        return response()->json([
            'metrics' => [
                'intervenants' => $totalIntervenants,
                'organisations' => $totalOrganisations,
                'formations' => $totalFormations,
                'reservations' => $totalReservations,
                'impact' => (int) $globalImpact,
            ],
            'chambres' => $chambresStats,
            'salles' => $sallesStats,
            'recent' => [
                'reservations' => $recentReservations,
                'formations' => $upcomingFormations,
            ],
            'chart' => $chartData,
        ]);
    }
}
