<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intervenant;
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
            'cadre'          => 'required|string|max:100',
            'mission'        => 'required|string|max:255',
            'nationalite'    => 'required|string|max:100',
            'adresse'        => 'required|string|max:500',
        ]);

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
            'cadre'          => 'required|string|max:100',
            'mission'        => 'required|string|max:255',
            'nationalite'    => 'required|string|max:100',
            'adresse'        => 'required|string|max:500',
        ]);

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

    public function statistics()
    {
        $total = Intervenant::count();

        // By ville
        $byVille = Intervenant::selectRaw('ville, count(*) as total')
            ->groupBy('ville')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        // By nationalite
        $byNationalite = Intervenant::selectRaw('nationalite, count(*) as total')
            ->groupBy('nationalite')
            ->orderByDesc('total')
            ->get();

        // By cadre
        $byCadre = Intervenant::selectRaw('cadre, count(*) as total')
            ->groupBy('cadre')
            ->orderByDesc('total')
            ->get();

        // By organisation
        $byOrg = Intervenant::with('organisation')
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

        // By mission
        $byMission = Intervenant::selectRaw('mission, count(*) as total')
            ->groupBy('mission')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        // Monthly registrations (last 12 months)
        $monthly = Intervenant::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, count(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json([
            'total'          => $total,
            'by_ville'       => $byVille,
            'by_nationalite' => $byNationalite,
            'by_cadre'       => $byCadre,
            'by_org'         => $byOrg,
            'by_mission'     => $byMission,
            'monthly'        => $monthly,
        ]);
    }

    public function organisations()
    {
        return response()->json(Organisation::orderBy('nom')->get());
    }
}
