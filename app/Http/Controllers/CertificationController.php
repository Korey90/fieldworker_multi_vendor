<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Certification::query()
            ->with('tenant')
            ->withCount('workers');

        // Search filter
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('authority', 'like', '%' . $request->search . '%');
            });
        }

        // Tenant filter
        if ($request->filled('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        // Authority filter
        if ($request->filled('authority')) {
            $query->where('authority', 'like', '%' . $request->authority . '%');
        }

        // Status filter
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Validity period filter
        if ($request->filled('validity_period')) {
            $query->where('validity_period_months', $request->validity_period);
        }

        // Sort
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $certifications = $query->paginate(15)
            ->withQueryString();

        // Get filter options
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        
        $authorities = Certification::distinct()
            ->whereNotNull('authority')
            ->orderBy('authority')
            ->pluck('authority');

        $validityPeriods = Certification::distinct()
            ->whereNotNull('validity_period_months')
            ->orderBy('validity_period_months')
            ->pluck('validity_period_months');

        return Inertia::render('admin/certifications/index', [
            'certifications' => $certifications,
            'tenants' => $tenants,
            'authorities' => $authorities,
            'validityPeriods' => $validityPeriods,
            'filters' => $request->only(['search', 'tenant_id', 'authority', 'is_active', 'validity_period']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        
        // Get existing authorities for suggestions
        $authorities = Certification::distinct()
            ->whereNotNull('authority')
            ->orderBy('authority')
            ->pluck('authority');

        return Inertia::render('admin/certifications/create', [
            'tenants' => $tenants,
            'authorities' => $authorities,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'authority' => 'required|string|max:255',
            'validity_period_months' => 'required|integer|min:1|max:120',
            'tenant_id' => 'required|exists:tenants,id',
            'is_active' => 'boolean',
        ]);

        $certification = Certification::create($validated);

        return redirect()
            ->route('admin.certifications.index')
            ->with('success', 'Certification created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Certification $certification): Response
    {
        $certification->load([
            'tenant',
            'workers' => function ($query) {
                $query->with(['user', 'tenant'])
                      ->withPivot(['issued_at', 'expires_at']);
            }
        ]);

        return Inertia::render('admin/certifications/show', [
            'certification' => $certification,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Certification $certification): Response
    {
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        
        // Get existing authorities for suggestions
        $authorities = Certification::distinct()
            ->whereNotNull('authority')
            ->orderBy('authority')
            ->pluck('authority');

        return Inertia::render('admin/certifications/edit', [
            'certification' => $certification,
            'tenants' => $tenants,
            'authorities' => $authorities,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Certification $certification)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'authority' => 'required|string|max:255',
            'validity_period_months' => 'required|integer|min:1|max:120',
            'tenant_id' => 'required|exists:tenants,id',
            'is_active' => 'boolean',
        ]);

        $certification->update($validated);

        return redirect()
            ->route('admin.certifications.index')
            ->with('success', 'Certification updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Certification $certification)
    {
        // Check if certification is used by workers
        if ($certification->workers()->count() > 0) {
            return redirect()
                ->route('admin.certifications.index')
                ->with('error', 'Cannot delete certification that is assigned to workers.');
        }

        $certification->delete();

        return redirect()
            ->route('admin.certifications.index')
            ->with('success', 'Certification deleted successfully.');
    }
}
