<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organisation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrganisationController extends Controller
{
    /** Build a safe formations COUNT subquery based on the actual DB columns. */
    private function formationsCountRaw(): string
    {
        $hasIdOrg = DB::getSchemaBuilder()->hasColumn('formations', 'id_org');

        if ($hasIdOrg) {
            // New schema: match by FK or by name (fallback)
            return "(SELECT COUNT(*) FROM formations
                      WHERE formations.id_org = organisations.id_org
                         OR formations.organisee_par = organisations.nom
                    ) as formations_count_raw";
        }

        // Old schema: match only by organisation name
        return "(SELECT COUNT(*) FROM formations
                  WHERE formations.organisee_par = organisations.nom
                ) as formations_count_raw";
    }

    public function index()
    {
        $rows = Organisation::query()
            ->with(['parent:id_org,nom'])
            ->withCount(['intervenants'])
            ->selectRaw('organisations.*, ' . $this->formationsCountRaw())
            ->orderBy('organisations.nom')
            ->get()
            ->map(fn (Organisation $o) => $this->toArray($o));

        return response()->json($rows);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'       => 'required|string|max:255',
            'ville_org' => 'required|string|max:255',
            'type'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:organisations,id_org',
        ]);

        $organisation = Organisation::create($validated);
        $organisation->load(['parent:id_org,nom']);
        $organisation->loadCount(['intervenants']);

        // Compute formations_count safely
        $organisation->formations_count_raw = $this->getFormationsCount($organisation->id_org, $organisation->nom);

        return response()->json($this->toArray($organisation), 201);
    }

    public function update(Request $request, int $id_org)
    {
        $organisation = Organisation::findOrFail($id_org);

        $validated = $request->validate([
            'nom'       => 'required|string|max:255',
            'ville_org' => 'required|string|max:255',
            'type'      => 'required|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:organisations,id_org',
                Rule::notIn([$id_org]),
            ],
        ]);

        $organisation->update($validated);
        $organisation->load(['parent:id_org,nom']);
        $organisation->loadCount(['intervenants']);
        $organisation->formations_count_raw = $this->getFormationsCount($organisation->id_org, $organisation->nom);

        return response()->json($this->toArray($organisation));
    }

    public function destroy(int $id_org)
    {
        $organisation = Organisation::findOrFail($id_org);

        if ($organisation->intervenants()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : des intervenants sont liés à cette organisation.',
            ], 422);
        }

        // Safe formations check — works regardless of schema version
        $formCount = $this->getFormationsCount($organisation->id_org, $organisation->nom);
        if ($formCount > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des formations sont liées à cette organisation.',
            ], 422);
        }

        if ($organisation->children()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : des organisations filles dépendent de celle-ci.',
            ], 422);
        }

        $organisation->delete();

        return response()->json(null, 204);
    }

    /** Count formations linked to this org — works with both old and new schema. */
    private function getFormationsCount(int $id_org, string $nom): int
    {
        return (int) DB::table('formations')
            ->where(function ($q) use ($id_org, $nom) {
                $q->where('organisee_par', $nom);
                // Only apply id_org condition if column exists
                if (DB::getSchemaBuilder()->hasColumn('formations', 'id_org')) {
                    $q->orWhere('id_org', $id_org);
                }
            })
            ->count();
    }

    private function toArray(Organisation $o): array
    {
        return [
            'id_org'             => $o->id_org,
            'nom'                => $o->nom,
            'ville_org'          => $o->ville_org,
            'type'               => $o->type,
            'parent_id'          => $o->parent_id ? (int) $o->parent_id : null,
            'parent'             => $o->relationLoaded('parent') && $o->parent
                ? ['id_org' => $o->parent->id_org, 'nom' => $o->parent->nom]
                : null,
            'intervenants_count' => (int) ($o->intervenants_count ?? 0),
            'formations_count'   => (int) ($o->formations_count_raw ?? 0),
            'created_at'         => $o->created_at?->toIso8601String(),
        ];
    }
}
