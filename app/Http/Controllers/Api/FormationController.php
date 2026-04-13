<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    public function index()
    {
        $formations = Formation::query()
            ->with(['organisation:id_org,nom,type'])
            ->orderByDesc('date_debut')
            ->get()
            ->map(fn (Formation $f) => $this->formationToArray($f));

        return response()->json($formations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sujet' => 'required|string|max:255',
            'categorie_cible' => 'required|string|max:255',
            'id_org' => 'required|exists:organisations,id_org',
            'salle' => 'required|in:salle1,salle2,salle3,salle4,salle5,salle6',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'nbr_prevu' => 'nullable|integer|min:0',
            'nbr_reel' => 'nullable|integer|min:0',
            'superviseur' => 'nullable|string|max:255',
            'heures_formation' => 'nullable|integer|min:0',
            'observations' => 'nullable|string',
        ]);

        $validated['nbr_prevu'] = (int) ($validated['nbr_prevu'] ?? 0);
        $validated['nbr_reel'] = (int) ($validated['nbr_reel'] ?? 0);
        $validated['heures_formation'] = (int) ($validated['heures_formation'] ?? 0);

        $this->applyStatutFromDates($validated);

        $formation = Formation::create($validated);
        $formation->load(['organisation:id_org,nom,type']);

        return response()->json($this->formationToArray($formation), 201);
    }

    public function update(Request $request, int $id_forma)
    {
        $formation = Formation::findOrFail($id_forma);

        $validated = $request->validate([
            'sujet' => 'required|string|max:255',
            'categorie_cible' => 'required|string|max:255',
            'id_org' => 'required|exists:organisations,id_org',
            'salle' => 'required|in:salle1,salle2,salle3,salle4,salle5,salle6',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'nbr_prevu' => 'nullable|integer|min:0',
            'nbr_reel' => 'nullable|integer|min:0',
            'superviseur' => 'nullable|string|max:255',
            'heures_formation' => 'nullable|integer|min:0',
            'observations' => 'nullable|string',
        ]);

        $validated['nbr_prevu'] = (int) ($validated['nbr_prevu'] ?? 0);
        $validated['nbr_reel'] = (int) ($validated['nbr_reel'] ?? 0);
        $validated['heures_formation'] = (int) ($validated['heures_formation'] ?? 0);

        $this->applyStatutFromDates($validated);

        $formation->update($validated);
        $formation->load(['organisation:id_org,nom,type']);

        return response()->json($this->formationToArray($formation));
    }

    public function destroy(int $id_forma)
    {
        Formation::findOrFail($id_forma)->delete();

        return response()->json(null, 204);
    }

    private function applyStatutFromDates(array &$validated): void
    {
        $today = Carbon::today();
        $debut = Carbon::parse($validated['date_debut'])->startOfDay();
        $fin = Carbon::parse($validated['date_fin'])->startOfDay();

        if ($today->lt($debut)) {
            $validated['statut'] = 'planifiee';
        } elseif ($today->lte($fin)) {
            $validated['statut'] = 'en cours';
        } else {
            $validated['statut'] = 'terminee';
        }
    }

    private function formationToArray(Formation $f): array
    {
        return [
            'id_forma' => $f->id_forma,
            'sujet' => $f->sujet,
            'categorie_cible' => $f->categorie_cible,
            'id_org' => $f->id_org,
            'salle' => $f->salle,
            'date_debut' => $f->date_debut?->format('Y-m-d'),
            'date_fin' => $f->date_fin?->format('Y-m-d'),
            'lieu' => $f->lieu ?? $f->salle ?? null,
            'nbr_prevu' => (int) $f->nbr_prevu,
            'nbr_reel' => (int) $f->nbr_reel,
            'superviseur' => $f->superviseur,
            'heures_formation' => (int) $f->heures_formation,
            'observations' => $f->observations,
            'organisation' => $f->organisation
                ? [
                    'nom' => $f->organisation->nom,
                    'type' => $f->organisation->type,
                ]
                : null,
        ];
    }
}
