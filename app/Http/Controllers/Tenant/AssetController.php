<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    /**
     * Display a listing of assets.
     */
    public function index(Request $request): Response
    {
        // Check if user can view assets
        if (Auth::user()->cannot('viewAny', Asset::class)) {
            abort(403, 'Unauthorized to view assets.');
        }

        $assets = Asset::with(['location', 'currentAssignment.user'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('asset_type', 'like', "%{$search}%");
                });
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
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate(15)
            ->withQueryString();

        $locations = Location::where('tenant_id', auth()->user()->tenant_id)
            ->select('id', 'name')
            ->get();

        $assetTypes = Asset::where('tenant_id', auth()->user()->tenant_id)
            ->distinct()
            ->pluck('asset_type')
            ->filter()
            ->values();

        $stats = [
            'total' => Asset::where('tenant_id', auth()->user()->tenant_id)->count(),
            'active' => Asset::where('tenant_id', auth()->user()->tenant_id)->where('status', 'active')->count(),
            'maintenance' => Asset::where('tenant_id', auth()->user()->tenant_id)->where('status', 'maintenance')->count(),
            'retired' => Asset::where('tenant_id', auth()->user()->tenant_id)->where('status', 'retired')->count(),
            'total_value' => Asset::where('tenant_id', auth()->user()->tenant_id)->sum('current_value') ?? 0,
        ];

        return Inertia::render('tenant/assets/index', [
            'assets' => $assets,
            'locations' => $locations,
            'assetTypes' => $assetTypes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'asset_type', 'location_id', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new asset.
     */
    public function create(): Response
    {
        // Check if user can create assets
        if (Auth::user()->cannot('create', Asset::class)) {
            abort(403, 'Unauthorized to create assets.');
        }

        $locations = Location::where('tenant_id', auth()->user()->tenant_id)
            ->select('id', 'name')
            ->get();

        $workers = Worker::whereHas('user', function ($query) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        })->with('user:id,name,email')->get();

        return Inertia::render('tenant/assets/create', [
            'locations' => $locations,
            'workers' => $workers,
        ]);
    }

    /**
     * Store a newly created asset in storage.
     */
    public function store(Request $request)
    {
        // Check if user can create assets
        if (Auth::user()->cannot('create', Asset::class)) {
            abort(403, 'Unauthorized to create assets.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'asset_type' => 'required|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,maintenance,retired',
            'location_id' => 'nullable|exists:locations,id',
            'assigned_to' => 'nullable|exists:workers,id',
            'data' => 'nullable|array',
        ]);

        // Verify location belongs to tenant
        if ($request->location_id) {
            $location = Location::where('id', $request->location_id)
                ->where('tenant_id', auth()->user()->tenant_id)
                ->first();
            
            if (!$location) {
                return back()->withErrors(['location_id' => 'Invalid location selected.']);
            }
        }

        // Verify worker belongs to tenant
        if ($request->assigned_to) {
            $worker = Worker::whereHas('user', function ($query) {
                $query->where('tenant_id', auth()->user()->tenant_id);
            })->where('id', $request->assigned_to)->first();
            
            if (!$worker) {
                return back()->withErrors(['assigned_to' => 'Invalid worker selected.']);
            }
        }

        Asset::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $request->name,
            'description' => $request->description,
            'asset_type' => $request->asset_type,
            'serial_number' => $request->serial_number,
            'purchase_date' => $request->purchase_date,
            'purchase_cost' => $request->purchase_cost,
            'current_value' => $request->current_value ?? $request->purchase_cost,
            'status' => $request->status,
            'location_id' => $request->location_id,
            'assigned_to' => $request->assigned_to,
            'data' => $request->data ?? [],
        ]);

        return redirect()->route('tenant.assets.index')
            ->with('success', 'Asset created successfully!');
    }

    /**
     * Display the specified asset.
     */
    public function show(Asset $asset): Response
    {
        // Check if user can view assets
        if (Auth::user()->cannot('view', $asset)) {
            abort(403, 'Unauthorized to view this asset.');
        }

        // Ensure asset belongs to current tenant
        if ($asset->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this asset');
        }

        $asset->load(['location', 'currentAssignment.user', 'auditLogs.user']);

        return Inertia::render('tenant/assets/show', [
            'asset' => $asset,
        ]);
    }

    /**
     * Show the form for editing the specified asset.
     */
    public function edit(Asset $asset): Response
    {
        // Check if user can update assets
        if (Auth::user()->cannot('update', $asset)) {
            abort(403, 'Unauthorized to edit this asset.');
        }

        // Ensure asset belongs to current tenant
        if ($asset->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this asset');
        }

        $locations = Location::where('tenant_id', auth()->user()->tenant_id)
            ->select('id', 'name')
            ->get();

        $workers = Worker::whereHas('user', function ($query) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        })->with('user:id,name,email')->get();

        return Inertia::render('tenant/assets/edit', [
            'asset' => $asset,
            'locations' => $locations,
            'workers' => $workers,
        ]);
    }

    /**
     * Update the specified asset in storage.
     */
    public function update(Request $request, Asset $asset)
    {
        // Check if user can update assets
        if (Auth::user()->cannot('update', $asset)) {
            abort(403, 'Unauthorized to update this asset.');
        }

        // Ensure asset belongs to current tenant
        if ($asset->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this asset');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'asset_type' => 'required|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,maintenance,retired',
            'location_id' => 'nullable|exists:locations,id',
            'assigned_to' => 'nullable|exists:workers,id',
            'data' => 'nullable|array',
        ]);

        // Verify location belongs to tenant
        if ($request->location_id) {
            $location = Location::where('id', $request->location_id)
                ->where('tenant_id', auth()->user()->tenant_id)
                ->first();
            
            if (!$location) {
                return back()->withErrors(['location_id' => 'Invalid location selected.']);
            }
        }

        // Verify worker belongs to tenant
        if ($request->assigned_to) {
            $worker = Worker::whereHas('user', function ($query) {
                $query->where('tenant_id', auth()->user()->tenant_id);
            })->where('id', $request->assigned_to)->first();
            
            if (!$worker) {
                return back()->withErrors(['assigned_to' => 'Invalid worker selected.']);
            }
        }

        $asset->update([
            'name' => $request->name,
            'description' => $request->description,
            'asset_type' => $request->asset_type,
            'serial_number' => $request->serial_number,
            'purchase_date' => $request->purchase_date,
            'purchase_cost' => $request->purchase_cost,
            'current_value' => $request->current_value,
            'status' => $request->status,
            'location_id' => $request->location_id,
            'assigned_to' => $request->assigned_to,
            'data' => $request->data ?? [],
        ]);

        return redirect()->route('tenant.assets.show', $asset)
            ->with('success', 'Asset updated successfully!');
    }

    /**
     * Remove the specified asset from storage.
     */
    public function destroy(Asset $asset)
    {
        // Check if user can delete assets
        if (Auth::user()->cannot('delete', $asset)) {
            abort(403, 'Unauthorized to delete this asset.');
        }

        // Ensure asset belongs to current tenant
        if ($asset->tenant_id !== auth()->user()->tenant_id) {
            abort(403, 'Unauthorized access to this asset');
        }

        $asset->delete();

        return redirect()->route('tenant.assets.index')
            ->with('success', 'Asset deleted successfully!');
    }

    /**
     * Export assets to CSV
     */
    public function export(Request $request)
    {
        // Check if user can export assets
        if (Auth::user()->cannot('viewAny', Asset::class)) {
            abort(403, 'Unauthorized to export assets.');
        }

        $assets = Asset::with(['location', 'currentAssignment.user'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%")
                      ->orWhere('asset_type', 'like', "%{$search}%");
                });
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
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = "assets_export_" . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($assets) {
            $file = fopen('php://output', 'w');
            
            // CSV Header
            fputcsv($file, [
                'ID',
                'Name',
                'Type',
                'Serial Number',
                'Status',
                'Location',
                'Assigned To',
                'Purchase Date',
                'Purchase Cost',
                'Current Value',
                'Created At',
            ]);

            // CSV Data
            foreach ($assets as $asset) {
                fputcsv($file, [
                    $asset->id,
                    $asset->name,
                    $asset->asset_type,
                    $asset->serial_number ?? '',
                    $asset->status,
                    $asset->location->name ?? '',
                    $asset->currentAssignment->user->name ?? '',
                    $asset->purchase_date?->format('Y-m-d') ?? '',
                    $asset->purchase_cost ?? '',
                    $asset->current_value ?? '',
                    $asset->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}