<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class SkillController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $skills = Skill::query()
            ->with(['workers'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%");
            })
            ->when($request->skill_type, function ($query, $type) {
                $query->where('skill_type', $type);
            })
            ->when($request->category, function ($query, $category) {
                $query->where('category', 'like', "%{$category}%");
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'skill_type'), $request->get('direction', 'asc'))
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => SkillResource::collection($skills)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'skill_type' => 'required|string|in:technical,soft,certification,safety',
            'is_active' => 'boolean',
        ]);

        $skill = Skill::create($validated);
        $skill->load(['workers']);

        return response()->json([
            'data' => new SkillResource($skill)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Skill $skill): JsonResponse
    {
        $skill->load(['workers']);

        return response()->json([
            'data' => new SkillResource($skill)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Skill $skill): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('skills')->ignore($skill->id)],
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'skill_type' => 'required|string|in:technical,soft,certification,safety',
            'is_active' => 'boolean',
        ]);

        $skill->update($validated);
        $skill->load(['workers']);

        return response()->json([
            'data' => new SkillResource($skill)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Skill $skill): JsonResponse
    {
        // Check if skill has any associated workers
        if ($skill->workers()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete skill with associated workers',
                'error' => 'SKILL_HAS_WORKERS'
            ], 422);
        }

        $skill->delete();

        return response()->json([
            'message' => 'Skill deleted successfully'
        ]);
    }
}
