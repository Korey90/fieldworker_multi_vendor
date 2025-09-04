<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificationResource;
use App\Models\Certification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $certifications = Certification::query()
            ->with(['workers'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('issuing_authority', 'like', "%{$search}%");
            })
            ->when($request->issuing_authority, function ($query, $authority) {
                $query->where('issuing_authority', 'like', "%{$authority}%");
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'name'), $request->get('direction', 'asc'))
            ->get();

        return response()->json([
            'data' => CertificationResource::collection($certifications)
        ]);
    }
}
