<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    public function index()
    {
        return response()->json(Salle::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'num_salle' => 'required|unique:salles,num_salle',
            'statut' => 'required|in:Disponible,Occupée',
        ]);

        $salle = Salle::create($validated);

        return response()->json($salle, 201);
    }

    public function show($id)
    {
        $salle = Salle::findOrFail($id);

        return response()->json($salle);
    }

    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);

        $validated = $request->validate([
            'num_salle' => 'sometimes|unique:salles,num_salle,'.$id.',id_salle',
            'statut' => 'sometimes|in:Disponible,Occupée',
        ]);

        $salle->update($validated);

        return response()->json($salle);
    }

    public function destroy($id)
    {
        $salle = Salle::findOrFail($id);
        $salle->delete();

        return response()->json(null, 204);
    }
}
