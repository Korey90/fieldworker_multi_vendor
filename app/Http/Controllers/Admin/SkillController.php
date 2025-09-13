<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Skill::query()
            ->withCount('workers');

        // Search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Type filter
        if ($request->filled('skill_type')) {
            $query->where('skill_type', $request->skill_type);
        }

        // Status filter
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sort
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $skills = $query->paginate(15)
            ->withQueryString();

        // Get filter options
        $categories = Skill::distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category');

        $skillTypes = Skill::distinct()
            ->whereNotNull('skill_type')
            ->orderBy('skill_type')
            ->pluck('skill_type');

        return Inertia::render('admin/skills/index', [
            'skills' => $skills,
            'categories' => $categories,
            'skillTypes' => $skillTypes,
            'filters' => $request->only(['search', 'category', 'skill_type', 'is_active']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        // Get existing categories and types for dropdowns
        $categories = Skill::distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category');

        $skillTypes = Skill::distinct()
            ->whereNotNull('skill_type')
            ->orderBy('skill_type')
            ->pluck('skill_type');

        return Inertia::render('admin/skills/create', [
            'categories' => $categories,
            'skillTypes' => $skillTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:255',
            'skill_type' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $skill = Skill::create($validated);

        return redirect()
            ->route('admin.skills.index')
            ->with('success', 'Skill created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Skill $skill): Response
    {
        $skill->load(['workers' => function ($query) {
            $query->with(['user', 'tenant']);
        }]);

        return Inertia::render('admin/skills/show', [
            'skill' => $skill,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Skill $skill): Response
    {
        // Get existing categories and types for dropdowns
        $categories = Skill::distinct()
            ->whereNotNull('category')
            ->orderBy('category')
            ->pluck('category');

        $skillTypes = Skill::distinct()
            ->whereNotNull('skill_type')
            ->orderBy('skill_type')
            ->pluck('skill_type');

        return Inertia::render('admin/skills/edit', [
            'skill' => $skill,
            'categories' => $categories,
            'skillTypes' => $skillTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name,' . $skill->id,
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:255',
            'skill_type' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $skill->update($validated);

        return redirect()
            ->route('admin.skills.index')
            ->with('success', 'Skill updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Skill $skill)
    {
        // Check if skill is used by workers
        if ($skill->workers()->count() > 0) {
            return redirect()
                ->route('admin.skills.index')
                ->with('error', 'Cannot delete skill that is assigned to workers.');
        }

        $skill->delete();

        return redirect()
            ->route('admin.skills.index')
            ->with('success', 'Skill deleted successfully.');
    }
}
