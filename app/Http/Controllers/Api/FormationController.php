<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\FormationImage;
use App\Models\Salle;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    public function index()
    {
        $formations = Formation::query()
            ->with(['organisation:id_org,nom,type', 'salle_relation', 'images'])
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
        $allSalles = Salle::orderBy('num_salle')->get();

        // If no dates given, return all salles
        if (!$request->filled('date_debut') || !$request->filled('date_fin')) {
            return response()->json($allSalles);
        }

        $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        $start     = $request->date_debut;
        $end       = $request->date_fin;
        $excludeId = $request->exclude_id;

        $hasSalleCol = \Illuminate\Support\Facades\Schema::hasColumn('formations', 'salle');

        // Find salle text values (old schema) that overlap the date range
        $occupiedSalleNums = $hasSalleCol
            ? Formation::where(function ($q) use ($start, $end) {
                    $q->where('date_debut', '<=', $end)
                      ->where('date_fin',   '>=', $start);
                })
                ->when($excludeId, fn($q) => $q->where('id_forma', '!=', $excludeId))
                ->whereNotNull('salle')
                ->where('salle', '!=', '')
                ->pluck('salle')
                ->unique()
                ->values()
                ->toArray()
            : [];

        // Find salle FK ids (new schema) that overlap
        $occupiedSalleIds = Formation::where(function ($q) use ($start, $end) {
                $q->where('date_debut', '<=', $end)
                  ->where('date_fin',   '>=', $start);
            })
            ->when($excludeId, fn($q) => $q->where('id_forma', '!=', $excludeId))
            ->whereNotNull('id_salle')
            ->pluck('id_salle')
            ->unique()
            ->values()
            ->toArray();

        // Return salles not in either occupied list
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
            'formateurs_ids' => 'nullable|array',
            'formateurs_ids.*' => 'exists:formateurs,id_formateur',
        ]);

        $formateursIds = $request->input('formateurs_ids', []);
        $validated['nb_formateurs'] = count($formateursIds);

        $validated['nbr_prevu'] = (int) ($validated['nbr_prevu'] ?? 0);
        $validated['nbr_reel'] = (int) ($validated['nbr_reel'] ?? 0);
        $validated['heures_formation'] = (int) ($validated['heures_formation'] ?? 0);

        $this->applyStatutFromDates($validated);

        // Resolve id_salle and handle salle column safely
        $salleName = $validated['salle'] ?? null;
        $salle = Salle::where('num_salle', $salleName)->first();
        if ($salle) {
            $validated['id_salle'] = $salle->id_salle;
        }

        if (!\Illuminate\Support\Facades\Schema::hasColumn('formations', 'salle')) {
            unset($validated['salle']);
        }

        // Auto-fill 'lieu' if it's required by DB but missing
        if (!isset($validated['lieu']) && $salleName) {
            $validated['lieu'] = $salleName;
        }

        $formation = Formation::create($validated);

        // Handle images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('formations', 'public');
                $formation->images()->create(['path' => $path]);
            }
        }
        
        // Attach formateurs
        if (!empty($formateursIds)) {
            $formation->formateurs()->attach($formateursIds);
        }

        $formation->load(['organisation:id_org,nom,type', 'salle_relation', 'images']);

        // Sync the salle status
        $this->syncSalleStatus($salleName);

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
            'formateurs_ids' => 'nullable|array',
            'formateurs_ids.*' => 'exists:formateurs,id_formateur',
        ]);

        $formateursIds = $request->input('formateurs_ids', []);
        $validated['nb_formateurs'] = count($formateursIds);

        $validated['nbr_prevu'] = (int) ($validated['nbr_prevu'] ?? 0);
        $validated['nbr_reel'] = (int) ($validated['nbr_reel'] ?? 0);
        $validated['heures_formation'] = (int) ($validated['heures_formation'] ?? 0);

        $this->applyStatutFromDates($validated);

        // Resolve id_salle and handle salle column safely
        $newSalleName = $validated['salle'] ?? null;
        $salle = Salle::where('num_salle', $newSalleName)->first();
        if ($salle) {
            $validated['id_salle'] = $salle->id_salle;
        }

        if (!\Illuminate\Support\Facades\Schema::hasColumn('formations', 'salle')) {
            unset($validated['salle']);
        }

        // Auto-fill 'lieu' if it's missing
        if (!isset($validated['lieu']) && $newSalleName) {
            $validated['lieu'] = $newSalleName;
        }

        $formation->update($validated);

        // Handle new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('formations', 'public');
                $formation->images()->create(['path' => $path]);
            }
        }
        
        // Sync formateurs
        $formation->formateurs()->sync($formateursIds);

        $formation->load(['organisation:id_org,nom,type', 'salle_relation']);

        // Sync both old and new salle status
        $this->syncSalleStatus($oldSalle);
        if ($oldSalle !== $newSalleName) {
            $this->syncSalleStatus($newSalleName);
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
        $hasSalleCol = \Illuminate\Support\Facades\Schema::hasColumn('formations', 'salle');

        $hasActiveFormation = Formation::where(function ($q) use ($salle, $salleNum, $hasSalleCol) {
                $q->where('id_salle', $salle->id_salle);
                if ($hasSalleCol) {
                    $q->orWhere('salle', $salleNum);
                }
            })
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
        // Get salle name from FK relationship or legacy column
        $salleName = $f->salle_relation ? $f->salle_relation->num_salle : ($f->salle ?? null);

        return [
            'id_forma' => $f->id_forma,
            'sujet' => $f->sujet,
            'categorie_cible' => $f->categorie_cible,
            'id_org' => $f->id_org,
            'salle' => $salleName,
            'id_salle' => $f->id_salle,
            'date_debut' => $f->date_debut ? \Carbon\Carbon::parse($f->date_debut)->format('Y-m-d') : null,
            'date_fin' => $f->date_fin ? \Carbon\Carbon::parse($f->date_fin)->format('Y-m-d') : null,
            'lieu' => $f->lieu ?? $salleName ?? null,
            'nbr_prevu' => (int) $f->nbr_prevu,
            'nbr_reel' => (int) $f->nbr_reel,
            'superviseur' => $f->superviseur,
            'heures_formation' => (int) $f->heures_formation,
            'observations' => $f->observations,
            'nb_formateurs' => (int) ($f->nb_formateurs ?? 0),
            'formateurs_ids' => $f->formateurs->pluck('id_formateur')->toArray(),
            'organisation' => $f->organisation
                ? [
                    'nom' => $f->organisation->nom,
                    'type' => $f->organisation->type,
                ]
                : null,
            'images' => $f->images->map(fn($img) => [
                'id' => $img->id,
                'url' => \Illuminate\Support\Facades\Storage::url($img->path),
            ]),
        ];
    }
}
