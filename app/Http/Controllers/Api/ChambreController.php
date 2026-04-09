<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chambre;
use Illuminate\Http\Request;

class ChambreController extends Controller
{
    public function index()
    {
        $chambres = Chambre::orderBy('etage')->orderBy('num_chambre')->get();
        return response()->json($chambres);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'num_chambre'  => 'required|string|max:20|unique:chambres,num_chambre',
            'type_chambre' => 'required|string|max:50',
            'statut'       => 'required|in:Disponible,Occupée,Maintenance',
            'etage'        => 'required|integer|min:0|max:99',
            'equipements'  => 'nullable|string',
        ]);

        $chambre = Chambre::create($validated);
        return response()->json($chambre, 201);
    }

    public function show($id)
    {
        $chambre = Chambre::findOrFail($id);
        return response()->json($chambre);
    }

    public function update(Request $request, $id)
    {
        $chambre = Chambre::findOrFail($id);

        $validated = $request->validate([
            'num_chambre'  => 'required|string|max:20|unique:chambres,num_chambre,' . $id . ',id_chambre',
            'type_chambre' => 'required|string|max:50',
            'statut'       => 'required|in:Disponible,Occupée,Maintenance',
            'etage'        => 'required|integer|min:0|max:99',
            'equipements'  => 'nullable|string',
        ]);

        $chambre->update($validated);
        return response()->json($chambre);
    }

    public function destroy($id)
    {
        $chambre = Chambre::findOrFail($id);
        $chambre->delete();
        return response()->json(null, 204);
    }

    public function statistics()
    {
        $total       = Chambre::count();
        $disponible  = Chambre::where('statut', 'Disponible')->count();
        $occupee     = Chambre::where('statut', 'Occupée')->count();
        $maintenance = Chambre::where('statut', 'Maintenance')->count();

        // By type
        $byType = Chambre::selectRaw('type_chambre, count(*) as total')
            ->groupBy('type_chambre')
            ->get();

        // By floor
        $byFloor = Chambre::selectRaw('etage, count(*) as total, sum(case when statut="Occupée" then 1 else 0 end) as occupees')
            ->groupBy('etage')
            ->orderBy('etage')
            ->get();

        return response()->json([
            'total'            => $total,
            'disponible'       => $disponible,
            'occupee'          => $occupee,
            'maintenance'      => $maintenance,
            'taux_occupation'  => $total > 0 ? round(($occupee / $total) * 100, 1) : 0,
            'taux_disponible'  => $total > 0 ? round(($disponible / $total) * 100, 1) : 0,
            'taux_maintenance' => $total > 0 ? round(($maintenance / $total) * 100, 1) : 0,
            'by_type'          => $byType,
            'by_floor'         => $byFloor,
        ]);
    }
}
