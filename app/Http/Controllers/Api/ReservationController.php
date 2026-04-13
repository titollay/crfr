<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Chambre;
use App\Models\Intervenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * Display a listing of the reservations.
     */
    public function index()
    {
        $reservations = Reservation::with(['intervenant', 'intervenant2', 'chambre', 'createur'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($reservations);
    }

    /**
     * Get options for the forms (Chambres and Intervenants).
     */
    public function options()
    {
        // For Chambres, we might want to return all of them or only 'Disponible'. 
        // Returning all is better for edit and viewing histories.
        $chambres = Chambre::select('id_chambre', 'num_chambre', 'type_chambre', 'statut')->get();
        $intervenants = Intervenant::select('id_inter', 'nom', 'prenom', 'cin')->get();

        return response()->json([
            'chambres' => $chambres,
            'intervenants' => $intervenants
        ]);
    }

    /**
     * Get available chambres for given dates.
     */
    public function availableChambres(Request $request)
    {
        $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut'
        ]);

        $start = $request->date_debut;
        $end = $request->date_fin;
        $excludeId = $request->exclude_id; // useful for editing an existing reservation

        $chambres = Chambre::where('statut', '!=', 'Maintenance')
            ->whereDoesntHave('reservations', function ($query) use ($start, $end, $excludeId) {
                $query->whereIn('statut', ['Confirmée', 'En attente'])
                      ->where(function ($q) use ($start, $end) {
                          $q->where('date_debut', '<=', $end)
                            ->where('date_fin', '>=', $start);
                      });
                if ($excludeId) {
                    $query->where('id_resev', '!=', $excludeId);
                }
            })
            ->select('id_chambre', 'num_chambre', 'type_chambre', 'statut')
            ->get();

        return response()->json($chambres);
    }

    /**
     * Store a newly created reservation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_inter' => 'required|exists:intervenants,id_inter',
            'id_inter_2' => 'nullable|exists:intervenants,id_inter|different:id_inter',
            'id_chambre' => 'required|exists:chambres,id_chambre',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'statut' => 'required|in:Confirmée,Annulée,En attente'
        ]);

        $validated['created_by'] = Auth::id();

        $reservation = Reservation::create($validated);
        
        $this->syncRoomStatus($reservation->id_chambre);

        $reservation->load(['intervenant', 'intervenant2', 'chambre', 'createur']);
        
        return response()->json($reservation, 201);
    }

    /**
     * Display the specified reservation.
     */
    public function show($id)
    {
        $reservation = Reservation::with(['intervenant', 'intervenant2', 'chambre', 'createur'])->findOrFail($id);
        return response()->json($reservation);
    }

    /**
     * Update the specified reservation.
     */
    public function update(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        $validated = $request->validate([
            'id_inter' => 'required|exists:intervenants,id_inter',
            'id_inter_2' => 'nullable|exists:intervenants,id_inter|different:id_inter',
            'id_chambre' => 'required|exists:chambres,id_chambre',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'statut' => 'required|in:Confirmée,Annulée,En attente'
        ]);

        // If the room changed, we need to sync both old and new room status
        $old_room_id = $reservation->id_chambre;

        $reservation->update($validated);

        $this->syncRoomStatus($old_room_id);
        if ($old_room_id !== $reservation->id_chambre) {
            $this->syncRoomStatus($reservation->id_chambre);
        }

        $reservation->load(['intervenant', 'intervenant2', 'chambre', 'createur']);

        return response()->json($reservation);
    }

    /**
     * Remove the specified reservation.
     */
    public function destroy($id)
    {
        $reservation = Reservation::findOrFail($id);
        $room_id = $reservation->id_chambre;
        
        $reservation->delete();
        
        $this->syncRoomStatus($room_id);

        return response()->json(['message' => 'Réservation supprimée'], 200);
    }

    /**
     * Internal helper to update a room's status based on current active reservations.
     */
    private function syncRoomStatus($id_chambre)
    {
        $chambre = Chambre::find($id_chambre);
        if (!$chambre) return;

        $today = Carbon::today();

        $hasActive = Reservation::where('id_chambre', $id_chambre)
            ->where('statut', 'Confirmée')
            ->where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->exists();

        // If it was supposed to be in maintenance etc., we might not want to touch it.
        // Assuming we only toggle between 'Disponible' and 'Occupee' for this rule.
        if ($chambre->statut !== 'En maintenance') {
            $chambre->statut = $hasActive ? 'Occupee' : 'Disponible';
            $chambre->save();
        }
    }

    /**
     * Get statistics for the charts on the Reservations Analytics tab.
     */
    public function statistics()
    {
        $today = Carbon::today();

        $total = Reservation::count();
        $confirmees = Reservation::where('statut', 'Confirmée')->count();
        $attente = Reservation::where('statut', 'En attente')->count();
        $annulees = Reservation::where('statut', 'Annulée')->count();

        // KPI
        $kpi = [
            'total' => $total,
            'confirmees' => $confirmees,
            'attente' => $attente,
            'annulees' => $annulees,
            'taux_confirmation' => $total > 0 ? round(($confirmees / $total) * 100) : 0,
        ];

        // Monthly created count for line chart (last 12 buckets)
        $monthlyBase = Reservation::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month"),
            DB::raw('MIN(created_at) as raw_date'),
            DB::raw('count(*) as total')
        )
            ->groupBy('month_key', 'month')
            ->orderBy('raw_date', 'asc')
            ->limit(12)
            ->get();

        $monthlyData = $monthlyBase->map(fn ($item) => [
            'month' => $item->month,
            'month_key' => $item->month_key,
            'total' => (int) $item->total,
        ]);

        // Daily: reservations created per day (last 60 days, zeros filled)
        $dailyStart = $today->copy()->subDays(59)->startOfDay();
        $rawDaily = Reservation::query()
            ->where('created_at', '>=', $dailyStart)
            ->select(DB::raw('DATE(created_at) as d'), DB::raw('count(*) as total'))
            ->groupBy('d')
            ->pluck('total', 'd');

        $dailyCreated = [];
        for ($i = 0; $i < 60; $i++) {
            $d = $dailyStart->copy()->addDays($i)->toDateString();
            $dailyCreated[] = [
                'date' => $d,
                'total' => (int) ($rawDaily[$d] ?? 0),
            ];
        }

        // Top chambres
        $byRoom = Reservation::query()
            ->join('chambres', 'chambres.id_chambre', '=', 'reservations.id_chambre')
            ->select('reservations.id_chambre', 'chambres.num_chambre', DB::raw('count(*) as total'))
            ->groupBy('reservations.id_chambre', 'chambres.num_chambre')
            ->orderByDesc('total')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'id_chambre' => $row->id_chambre,
                'num_chambre' => $row->num_chambre,
                'total' => (int) $row->total,
            ]);

        // Occupancy heatmap: overlapping active bookings per day (90 days)
        $heatStart = $today->copy()->subDays(89);
        $heatEnd = $today->copy();

        $dayCounts = [];
        for ($i = 0; $i < 90; $i++) {
            $d = $heatStart->copy()->addDays($i)->toDateString();
            $dayCounts[$d] = 0;
        }

        $overlapRes = Reservation::query()
            ->whereIn('statut', ['Confirmée', 'En attente'])
            ->where('date_fin', '>=', $heatStart->toDateString())
            ->where('date_debut', '<=', $heatEnd->toDateString())
            ->get(['date_debut', 'date_fin']);

        foreach ($overlapRes as $r) {
            $from = Carbon::parse($r->date_debut)->max($heatStart);
            $to = Carbon::parse($r->date_fin)->min($heatEnd);
            if ($from->gt($to)) {
                continue;
            }
            for ($d = $from->copy(); $d->lte($to); $d->addDay()) {
                $key = $d->toDateString();
                if (array_key_exists($key, $dayCounts)) {
                    $dayCounts[$key]++;
                }
            }
        }

        $occupancyByDay = collect($dayCounts)->map(fn ($count, $date) => [
            'date' => $date,
            'count' => $count,
        ])->values()->all();

        // Average stay (confirmed reservations only, nights inclusive)
        $avgStay = Reservation::query()
            ->where('statut', 'Confirmée')
            ->whereRaw('DATEDIFF(date_fin, date_debut) >= 0')
            ->selectRaw('ROUND(AVG(DATEDIFF(date_fin, date_debut) + 1), 1) as v')
            ->value('v');

        // Top créateurs (employés)
        $byCreator = Reservation::query()
            ->join('users', 'users.id_user', '=', 'reservations.created_by')
            ->select('users.id_user', 'users.nom', 'users.prenom', DB::raw('count(*) as total'))
            ->groupBy('users.id_user', 'users.nom', 'users.prenom')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id_user' => $row->id_user,
                'nom' => $row->nom,
                'prenom' => $row->prenom,
                'total' => (int) $row->total,
            ]);

        $single = Reservation::whereNull('id_inter_2')->count();
        $double = Reservation::whereNotNull('id_inter_2')->count();

        $todayStr = $today->toDateString();
        $activeReservations = Reservation::whereIn('statut', ['Confirmée', 'En attente'])
            ->where('date_fin', '>=', $todayStr)
            ->count();
        $pastReservations = Reservation::query()
            ->where(function ($q) use ($todayStr) {
                $q->where('statut', 'Annulée')
                    ->orWhere(function ($q2) use ($todayStr) {
                        $q2->whereIn('statut', ['Confirmée', 'En attente'])
                            ->where('date_fin', '<', $todayStr);
                    });
            })
            ->count();

        return response()->json([
            'kpi' => $kpi,
            'monthly' => $monthlyData,
            'daily_created' => $dailyCreated,
            'by_room' => $byRoom,
            'occupancy_by_day' => $occupancyByDay,
            'avg_stay_days' => $avgStay !== null ? (float) $avgStay : 0.0,
            'by_creator' => $byCreator,
            'single_vs_double' => [
                'single' => $single,
                'double' => $double,
            ],
            'active_vs_past' => [
                'active' => $activeReservations,
                'past' => $pastReservations,
            ],
        ]);
    }
}
