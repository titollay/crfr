<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intervenant;
use App\Models\Formation;
use App\Models\Organisation;
use Illuminate\Http\Request;

class IntervenantController extends Controller
{
    public function index()
    {
        $intervenants = Intervenant::with('organisation')
            ->orderBy('nom')
            ->get();
        return response()->json($intervenants);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'cin'            => 'required|string|max:20|unique:intervenants,cin',
            'telephone'      => 'required|string|max:20',
            'email'          => 'required|email|max:150',
            'ville'          => 'required|string|max:100',
            'id_org'         => 'required|exists:organisations,id_org',
            'date_naissance' => 'required|date|before:today',
            'cadre'          => 'nullable|string|max:100',
            'mission'        => 'nullable|string|max:255',
            'nationalite'    => 'required|string|max:100',
            'adresse'        => 'required|string|max:500',
            'a_formation'    => 'required|boolean',
        ]);

        // Force cadre/mission to null when not in formation
        if (!$validated['a_formation']) {
            $validated['cadre'] = null;
            $validated['mission'] = null;
        }

        $intervenant = Intervenant::create($validated);
        $intervenant->load('organisation');
        return response()->json($intervenant, 201);
    }

    public function show($id)
    {
        $intervenant = Intervenant::with('organisation')->findOrFail($id);
        return response()->json($intervenant);
    }

    public function update(Request $request, $id)
    {
        $intervenant = Intervenant::findOrFail($id);

        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'cin'            => 'required|string|max:20|unique:intervenants,cin,' . $id . ',id_inter',
            'telephone'      => 'required|string|max:20',
            'email'          => 'required|email|max:150',
            'ville'          => 'required|string|max:100',
            'id_org'         => 'required|exists:organisations,id_org',
            'date_naissance' => 'required|date|before:today',
            'cadre'          => 'nullable|string|max:100',
            'mission'        => 'nullable|string|max:255',
            'nationalite'    => 'required|string|max:100',
            'adresse'        => 'required|string|max:500',
            'a_formation'    => 'required|boolean',
        ]);

        // Force cadre/mission to null when not in formation
        if (!$validated['a_formation']) {
            $validated['cadre'] = null;
            $validated['mission'] = null;
        }

        $intervenant->update($validated);
        $intervenant->load('organisation');
        return response()->json($intervenant);
    }

    public function destroy($id)
    {
        $intervenant = Intervenant::findOrFail($id);
        $intervenant->delete();
        return response()->json(null, 204);
    }

    public function statistics(Request $request)
    {
        $period = $request->query('period', 'all');

        $intervenantQuery = Intervenant::query();
        $formationQuery = Formation::query();

        if ($period === 'today') {
            $intervenantQuery->whereDate('intervenants.created_at', now()->toDateString());
            $formationQuery->whereDate('formations.date_debut', now()->toDateString());
        } elseif ($period === 'week') {
            $intervenantQuery->where('intervenants.created_at', '>=', now()->startOfWeek());
            $formationQuery->where('formations.date_debut', '>=', now()->startOfWeek());
        } elseif ($period === 'month') {
            $intervenantQuery->where('intervenants.created_at', '>=', now()->startOfMonth());
            $formationQuery->where('formations.date_debut', '>=', now()->startOfMonth());
        }

        $total = (clone $intervenantQuery)->count();

        // ── Répartition par type ──
        $totalHotelSeul   = (clone $intervenantQuery)->whereNull('mission')->whereNull('cadre')->count();
        $totalFormation   = (clone $intervenantQuery)->where(function ($query) {
            $query->whereNotNull('mission')->orWhereNotNull('cadre');
        })->count();

        // ── Total global (impact sans doublons) ──
        // = Σ(nbr_reel de formations) + bénéficiaires hôtel-seul
        $sumNbrReel   = (int) (clone $formationQuery)->sum('nbr_reel');
        $totalGlobal  = $sumNbrReel + $totalHotelSeul;

        // By ville
        $byVille = (clone $intervenantQuery)->selectRaw('ville, count(*) as total')
            ->groupBy('ville')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        // By nationalite
        $byNationalite = (clone $intervenantQuery)->selectRaw('nationalite, count(*) as total')
            ->groupBy('nationalite')
            ->orderByDesc('total')
            ->get();

        // By cadre (only those with formation)
        $byCadre = (clone $intervenantQuery)->whereNotNull('cadre')
            ->selectRaw('cadre, count(*) as total')
            ->groupBy('cadre')
            ->orderByDesc('total')
            ->get();

        // By organisation
        $byOrg = (clone $intervenantQuery)->with('organisation')
            ->selectRaw('id_org, count(*) as total')
            ->groupBy('id_org')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(function ($item) {
                return [
                    'org_nom' => optional($item->organisation)->nom ?? 'Inconnue',
                    'total'   => $item->total,
                ];
            });

        // By mission (only those with formation)
        $byMission = (clone $intervenantQuery)->whereNotNull('mission')
            ->selectRaw('mission, count(*) as total')
            ->groupBy('mission')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        // Daily registrations (last 30 days) — Combined HOTEL ONLY + FORMATIONS
        $dailyHotel = Intervenant::whereNull('mission')->whereNull('cadre')
            ->selectRaw("DATE(created_at) as date, count(*) as total")
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->get();
        $dailyFormations = Formation::selectRaw("date_debut as date, SUM(nbr_reel) as total")
            ->where('date_debut', '>=', now()->subDays(30))
            ->groupBy('date_debut')
            ->get();
        $daily = $dailyHotel->concat($dailyFormations)->groupBy('date')->map(function ($g) {
            return ['date' => $g->first()['date'], 'total' => $g->sum('total')];
        })->sortBy('date')->values();

        // Evolution des Formations (Dynamic based on Period)
        $evoFormat = "'%Y-%m'"; // Default All Time -> Monthly
        if ($period === 'today') {
            $evoFormat = "'%H:00'"; // Hourly today
        } elseif ($period === 'week' || $period === 'month') {
            $evoFormat = "'%Y-%m-%d'"; // Daily for week or month
        }

        $evoHotelQuery = Intervenant::whereNull('mission')->whereNull('cadre')
            ->selectRaw("DATE_FORMAT(intervenants.created_at, $evoFormat) as label, count(*) as total");
        $evoFormationQuery = Formation::selectRaw("DATE_FORMAT(formations.date_debut, $evoFormat) as label, SUM(nbr_reel) as total");

        if ($period === 'today') {
            $evoHotelQuery->whereDate('created_at', now()->toDateString());
            $evoFormationQuery->whereDate('date_debut', now()->toDateString());
        } elseif ($period === 'week') {
            $evoHotelQuery->where('created_at', '>=', now()->startOfWeek());
            $evoFormationQuery->where('date_debut', '>=', now()->startOfWeek());
        } elseif ($period === 'month') {
            $evoHotelQuery->where('created_at', '>=', now()->startOfMonth());
            $evoFormationQuery->where('date_debut', '>=', now()->startOfMonth());
        } else {
            $evoHotelQuery->where('created_at', '>=', now()->subMonths(12));
            $evoFormationQuery->where('date_debut', '>=', now()->subMonths(12));
        }

        $evoHotel = $evoHotelQuery->groupBy('label')->get();
        $evoFormations = $evoFormationQuery->groupBy('label')->get();
        
        $evolution = $evoHotel->concat($evoFormations)->groupBy('label')->map(function ($g) {
            return ['label' => $g->first()['label'], 'total' => $g->sum('total')];
        })->sortBy('label')->values();

        return response()->json([
            'total'            => $total,
            'total_formation'  => $totalFormation,
            'total_hotel_seul' => $totalHotelSeul,
            'total_global'     => $totalGlobal,
            'sum_nbr_reel'     => $sumNbrReel,
            'by_ville'         => $byVille,
            'by_nationalite'   => $byNationalite,
            'by_cadre'         => $byCadre,
            'by_org'           => $byOrg,
            'by_mission'       => $byMission,
            'daily'            => $daily,
            'evolution'        => $evolution,
        ]);
    }

    public function organisations()
    {
        return response()->json(Organisation::orderBy('nom')->get(['id_org', 'nom']));
    }
}
