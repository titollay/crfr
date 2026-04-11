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
            'taux_confirmation' => $total > 0 ? round(($confirmees / $total) * 100) : 0
        ];

        // Monthly created count for area chart
        $monthlyBase = Reservation::select(
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month"),
            DB::raw("MIN(created_at) as raw_date"),
            DB::raw("count(*) as total")
        )
        ->groupBy('month')
        ->orderBy('raw_date', 'asc')
        ->limit(12)
        ->get();

        $monthlyData = $monthlyBase->map(function ($item) {
            return [
                'month' => $item->month,
                'total' => $item->total
            ];
        });

        return response()->json([
            'kpi' => $kpi,
            'monthly' => $monthlyData,
        ]);
    }
}
