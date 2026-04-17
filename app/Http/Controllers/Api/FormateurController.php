<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formateur;
use Illuminate\Http\Request;

class FormateurController extends Controller
{
    public function index()
    {
        $formateurs = Formateur::orderBy('created_at', 'desc')->get();
        return response()->json($formateurs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cin'          => 'required|string|max:50|unique:formateurs,cin',
            'num_location' => 'nullable|string|max:100',
            'attribut'     => 'nullable|string|max:255',
        ]);

        $formateur = Formateur::create($validated);

        return response()->json($formateur, 201);
    }

    public function update(Request $request, int $id)
    {
        $formateur = Formateur::findOrFail($id);

        $validated = $request->validate([
            'cin'          => 'required|string|max:50|unique:formateurs,cin,' . $id . ',id_formateur',
            'num_location' => 'nullable|string|max:100',
            'attribut'     => 'nullable|string|max:255',
        ]);

        $formateur->update($validated);

        return response()->json($formateur);
    }

    public function destroy(int $id)
    {
        $formateur = Formateur::findOrFail($id);
        $formateur->delete();

        return response()->json(null, 204);
    }
}
