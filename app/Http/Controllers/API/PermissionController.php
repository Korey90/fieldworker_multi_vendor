<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $permissions = Permission::query()
            ->with(['roles'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('permission_key', 'like', "%{$search}%");
            })
            ->when($request->permission_group, function ($query, $group) {
                $query->where('permission_group', $group);
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->orderBy($request->get('sort', 'permission_group'), $request->get('direction', 'asc'))
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => PermissionResource::collection($permissions)
        ]);
    }
}
