<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organisation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganisationController extends Controller
{
    public function index()
    {
        $rows = Organisation::query()
            ->with(['parent:id_org,nom'])
            ->withCount(['intervenants', 'formations'])
            ->orderBy('nom')
            ->get()
            ->map(fn (Organisation $o) => $this->toArray($o));

        return response()->json($rows);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'ville_org' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:organisations,id_org',
        ]);

        $organisation = Organisation::create($validated);
        $organisation->load(['parent:id_org,nom']);
        $organisation->loadCount(['intervenants', 'formations']);

        return response()->json($this->toArray($organisation), 201);
    }

    public function update(Request $request, int $id_org)
    {
        $organisation = Organisation::findOrFail($id_org);

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'ville_org' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:organisations,id_org',
                Rule::notIn([$id_org]),
            ],
        ]);

        $organisation->update($validated);
        $organisation->load(['parent:id_org,nom']);
        $organisation->loadCount(['intervenants', 'formations']);

        return response()->json($this->toArray($organisation));
    }

    public function destroy(int $id_org)
    {
        $organisation = Organisation::findOrFail($id_org);

        if ($organisation->intervenants()->exists() || $organisation->formations()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer : des intervenants ou des formations sont liés à cette organisation.',
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

    private function toArray(Organisation $o): array
    {
        return [
            'id_org' => $o->id_org,
            'nom' => $o->nom,
            'ville_org' => $o->ville_org,
            'type' => $o->type,
            'parent_id' => $o->parent_id ? (int) $o->parent_id : null,
            'parent' => $o->relationLoaded('parent') && $o->parent
                ? ['id_org' => $o->parent->id_org, 'nom' => $o->parent->nom]
                : null,
            'intervenants_count' => (int) ($o->intervenants_count ?? 0),
            'formations_count' => (int) ($o->formations_count ?? 0),
            'created_at' => $o->created_at?->toIso8601String(),
        ];
    }
}
