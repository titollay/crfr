<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\Salle;
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

    /**
     * Get available salles for given dates.
     * Returns salles that have no overlapping formation for the requested period.
     */
    public function availableSalles(Request $request)
    {
        $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        $start     = $request->date_debut;
        $end       = $request->date_fin;
        $excludeId = $request->exclude_id; // useful when editing an existing formation

        // Get all salles
        $allSalles = Salle::all();

        // Find salle num_salle values that have an overlapping formation
        $occupiedSalleNums = Formation::where(function ($q) use ($start, $end) {
                $q->where('date_debut', '<=', $end)
                  ->where('date_fin', '>=', $start);
            })
            ->when($excludeId, function ($q) use ($excludeId) {
                $q->where('id_forma', '!=', $excludeId);
            })
            ->pluck('salle')
            ->unique()
            ->toArray();

        // Also check id_salle for formations that use the FK
        $occupiedSalleIds = Formation::where(function ($q) use ($start, $end) {
                $q->where('date_debut', '<=', $end)
                  ->where('date_fin', '>=', $start);
            })
            ->when($excludeId, function ($q) use ($excludeId) {
                $q->where('id_forma', '!=', $excludeId);
            })
            ->whereNotNull('id_salle')
            ->pluck('id_salle')
            ->unique()
            ->toArray();

        // Filter out occupied salles
        $available = $allSalles->filter(function ($salle) use ($occupiedSalleNums, $occupiedSalleIds) {
            return !in_array($salle->num_salle, $occupiedSalleNums)
                && !in_array($salle->id_salle, $occupiedSalleIds);
        })->values();

        return response()->json($available);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sujet' => 'required|string|max:255',
            'categorie_cible' => 'required|string|max:255',
            'id_org' => 'required|exists:organisations,id_org',
            'salle' => 'required|string|max:255',
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

        // Sync the salle status
        $this->syncSalleStatus($validated['salle']);

        return response()->json($this->formationToArray($formation), 201);
    }

    public function update(Request $request, int $id_forma)
    {
        $formation = Formation::findOrFail($id_forma);
        $oldSalle = $formation->salle;

        $validated = $request->validate([
            'sujet' => 'required|string|max:255',
            'categorie_cible' => 'required|string|max:255',
            'id_org' => 'required|exists:organisations,id_org',
            'salle' => 'required|string|max:255',
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

        // Sync both old and new salle status
        $this->syncSalleStatus($oldSalle);
        if ($oldSalle !== $validated['salle']) {
            $this->syncSalleStatus($validated['salle']);
        }

        return response()->json($this->formationToArray($formation));
    }

    public function destroy(int $id_forma)
    {
        $formation = Formation::findOrFail($id_forma);
        $salleNum = $formation->salle;

        $formation->delete();

        // Sync the salle status after deletion
        $this->syncSalleStatus($salleNum);

        return response()->json(null, 204);
    }

    /**
     * Sync a salle's status based on whether any formation is currently active on it.
     * The salle is "Occupée" only if there's a formation happening today.
     */
    private function syncSalleStatus(?string $salleNum): void
    {
        if (!$salleNum) return;

        $salle = Salle::where('num_salle', $salleNum)->first();
        if (!$salle) return;

        $today = Carbon::today();

        $hasActiveFormation = Formation::where('salle', $salleNum)
            ->where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->exists();

        $salle->statut = $hasActiveFormation ? 'Occupée' : 'Disponible';
        $salle->save();
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
