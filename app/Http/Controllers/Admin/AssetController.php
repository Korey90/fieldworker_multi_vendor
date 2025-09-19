<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with(['tenant', 'location', 'currentAssignment'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('asset_type', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->asset_type, function ($query, $type) {
                $query->where('asset_type', $type);
            })
            ->when($request->location_id, function ($query, $locationId) {
                $query->where('location_id', $locationId);
            })
            ->when($request->assigned, function ($query, $assigned) {
                if ($assigned === 'assigned') {
                    $query->whereNotNull('assigned_to');
                } else if ($assigned === 'unassigned') {
                    $query->whereNull('assigned_to');
                }
            });

        $assets = $query->paginate(15);
        
        $locations = Location::where('tenant_id', auth()->user()->tenant_id)
                           ->where('is_active', true)
                           ->get();

        $assetTypes = Asset::where('tenant_id', auth()->user()->tenant_id)
                          ->distinct()
                          ->pluck('asset_type')
                          ->filter()
                          ->values();

        $statuses = ['active', 'inactive', 'maintenance', 'retired'];

        return Inertia::render('admin/assets/index', [
            'assets' => $assets,
            'locations' => $locations,
            'assetTypes' => $assetTypes,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'asset_type', 'location_id', 'assigned'])
        ]);
    }

    public function show(Asset $asset)
    {
        $asset->load(['tenant', 'location', 'currentAssignment', 'auditLogs']);
        
        return Inertia::render('admin/assets/show', [
            'asset' => $asset,
        ]);
    }

    public function create()
    {
        $locations = Location::where('tenant_id', auth()->user()->tenant_id)
                           ->where('is_active', true)
                           ->get();

        $workers = Worker::where('tenant_id', auth()->user()->tenant_id)
                        ->whereHas('user', function ($query) {
                            $query->where('is_active', true);
                        })
                        ->with('user')
                        ->get();

        return Inertia::render('admin/assets/create', [
            'locations' => $locations,
            'workers' => $workers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'asset_type' => 'required|string|max:100',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,maintenance,retired',
            'location_id' => 'nullable|exists:locations,id',
            'assigned_to' => 'nullable|exists:workers,id',
            'data' => 'nullable|array',
        ]);

        $asset = Asset::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'asset_type' => $validated['asset_type'],
            'serial_number' => $validated['serial_number'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? null,
            'purchase_cost' => $validated['purchase_cost'] ?? null,
            'current_value' => $validated['current_value'] ?? null,
            'status' => $validated['status'],
            'location_id' => $validated['location_id'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'data' => $validated['data'] ?? [],
        ]);

        return redirect()->route('admin.assets.index')
                        ->with('success', 'Zasób został utworzony pomyślnie.');
    }

    public function edit(Asset $asset)
    {
        $asset->load(['location', 'currentAssignment']);
        
        $locations = Location::where('tenant_id', auth()->user()->tenant_id)
                           ->where('is_active', true)
                           ->get();

        $workers = Worker::where('tenant_id', auth()->user()->tenant_id)
                        ->whereHas('user', function ($query) {
                            $query->where('is_active', true);
                        })
                        ->with('user')
                        ->get();

        return Inertia::render('admin/assets/edit', [
            'asset' => $asset,
            'locations' => $locations,
            'workers' => $workers,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'asset_type' => 'required|string|max:100',
            'serial_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('assets')->ignore($asset->id),
            ],
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,maintenance,retired',
            'location_id' => 'nullable|exists:locations,id',
            'assigned_to' => 'nullable|exists:workers,id',
            'data' => 'nullable|array',
        ]);

        $asset->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'asset_type' => $validated['asset_type'],
            'serial_number' => $validated['serial_number'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? null,
            'purchase_cost' => $validated['purchase_cost'] ?? null,
            'current_value' => $validated['current_value'] ?? null,
            'status' => $validated['status'],
            'location_id' => $validated['location_id'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'data' => $validated['data'] ?? [],
        ]);

        return redirect()->route('admin.assets.show', $asset)
                        ->with('success', 'Zasób został zaktualizowany pomyślnie.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return redirect()->route('admin.assets.index')
                        ->with('success', 'Zasób został usunięty pomyślnie.');
    }

    public function assign(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:workers,id'
        ]);

        $asset->update(['assigned_to' => $validated['worker_id']]);

        return back()->with('success', 'Zasób został przypisany pomyślnie.');
    }

    public function unassign(Asset $asset)
    {
        $asset->update(['assigned_to' => null]);

        return back()->with('success', 'Przypisanie zasobu zostało usunięte pomyślnie.');
    }

    public function toggleStatus(Asset $asset)
    {
        $newStatus = $asset->status === 'active' ? 'inactive' : 'active';
        $asset->update(['status' => $newStatus]);

        $statusText = $newStatus === 'active' ? 'aktywowany' : 'dezaktywowany';
        
        return back()->with('success', "Zasób został {$statusText} pomyślnie.");
    }
}