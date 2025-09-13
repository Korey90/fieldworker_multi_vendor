<?php

namespace App\Http\Controllers;

use App\Models\Sector;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class SectorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $sectors = Sector::query()
            ->with(['locations', 'tenants'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->get()
            ->map(function ($sector) {
                return [
                    'id' => $sector->id,
                    'code' => $sector->code,
                    'name' => $sector->name,
                    'description' => $sector->description,
                    'is_active' => $sector->is_active,
                    'locations_count' => $sector->locations->count(),
                    'tenants_count' => $sector->tenants->count(),
                    'created_at' => $sector->created_at,
                    'updated_at' => $sector->updated_at,
                ];
            });

        return Inertia::render('sectors/index', [
            'sectors' => $sectors,
            'filters' => $request->only(['search', 'is_active', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('sectors/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:sectors,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $sector = Sector::create($validated);

        return redirect()->route('sectors.index')
            ->with('success', 'Sector created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sector $sector): Response
    {
        $sector->load(['locations', 'tenants']);

        return Inertia::render('sectors/show', [
            'sector' => [
                'id' => $sector->id,
                'code' => $sector->code,
                'name' => $sector->name,
                'description' => $sector->description,
                'is_active' => $sector->is_active,
                'locations_count' => $sector->locations->count(),
                'tenants_count' => $sector->tenants->count(),
                'created_at' => $sector->created_at,
                'updated_at' => $sector->updated_at,
                'locations' => $sector->locations->map(function ($location) {
                    return [
                        'id' => $location->id,
                        'name' => $location->name,
                        'address' => $location->address,
                    ];
                }),
                'tenants' => $sector->tenants->map(function ($tenant) {
                    return [
                        'id' => $tenant->id,
                        'name' => $tenant->name,
                        'slug' => $tenant->slug,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sector $sector): Response
    {
        return Inertia::render('sectors/edit', [
            'sector' => [
                'id' => $sector->id,
                'code' => $sector->code,
                'name' => $sector->name,
                'description' => $sector->description,
                'is_active' => $sector->is_active,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sector $sector): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', Rule::unique('sectors')->ignore($sector->id)],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
        ]);

        $sector->update($validated);

        return redirect()->route('sectors.index')
            ->with('success', 'Sector updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sector $sector): RedirectResponse
    {
        // Check if sector has any associated locations or tenants
        if ($sector->locations()->count() > 0 || $sector->tenants()->count() > 0) {
            return redirect()->route('sectors.index')
                ->with('error', 'Cannot delete sector with associated locations or tenants.');
        }

        $sector->delete();

        return redirect()->route('sectors.index')
            ->with('success', 'Sector deleted successfully.');
    }
}
