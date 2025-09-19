<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormResponse;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FormController extends Controller
{
    protected $tenantId;

    public function __construct()
    {
        // Apply middleware to ensure only authenticated users with tenant access
        $this->middleware(['auth', 'tenant']);

        $this->middleware(function ($request, $next) {
            $this->tenantId = Auth::user()->tenant_id;
            return $next($request);
        });
    }


    public function index(Request $request)
    {

        $query = Form::where('tenant_id', $this->tenantId)
            ->with(['responses' => function($q) {
                $q->select('form_id')
                  ->selectRaw('COUNT(*) as total_responses')
                  ->selectRaw('SUM(CASE WHEN is_submitted = 1 THEN 1 ELSE 0 END) as submitted_responses')
                  ->groupBy('form_id');
            }]);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->filled('type') && $request->type !== '__all__') {
            $query->where('type', $request->type);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $validSortFields = ['name', 'type', 'created_at', 'updated_at'];
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $forms = $query->paginate(12);

        // Get form types for filter
        $formTypes = Form::where('tenant_id', $this->tenantId)
            ->select('type')
            ->distinct()
            ->pluck('type')
            ->filter()
            ->values();

        // Stats
        $stats = [
            'total_forms' => Form::where('tenant_id', $this->tenantId)->count(),
            'total_responses' => FormResponse::where('tenant_id', $this->tenantId)->count(),
            'submitted_responses' => FormResponse::where('tenant_id', $this->tenantId)->where('is_submitted', true)->count(),
            'draft_responses' => FormResponse::where('tenant_id', $this->tenantId)->where('is_submitted', false)->count(),
        ];

        return Inertia::render('tenant/forms/index', [
            'forms' => $forms,
            'formTypes' => $formTypes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type', 'sort_by', 'sort_direction']),
        ]);
    }

    public function create(Request $request)
    {

        // Get available form types
        $formTypes = [
            'inspection' => 'Inspection Form',
            'maintenance' => 'Maintenance Form',
            'safety' => 'Safety Checklist',
            'quality' => 'Quality Control',
            'feedback' => 'Feedback Form',
            'report' => 'Report Form',
            'custom' => 'Custom Form',
        ];

        return Inertia::render('tenant/forms/create', [
            'formTypes' => $formTypes,
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'schema' => 'required|array',
            'schema.sections' => 'required|array',
            'schema.sections.*.title' => 'required|string',
            'schema.sections.*.fields' => 'array',
            'schema.sections.*.fields.*.name' => 'required|string',
            'schema.sections.*.fields.*.type' => 'required|string|in:text,textarea,number,email,phone,date,datetime,datetime-local,select,radio,checkbox,file,signature',
            'schema.sections.*.fields.*.label' => 'required|string',
            'schema.sections.*.fields.*.required' => 'boolean',
            'schema.sections.*.fields.*.options' => 'array|nullable',
        ]);

        $form = Form::create([
            'tenant_id' => $this->tenantId,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'schema' => $validated['schema'],
        ]);

        return redirect()->route('tenant.forms.show', $form)
            ->with('success', 'Form created successfully.');
    }


        public function update(Request $request, Form $form)
    {
        
        // Ensure form belongs to current tenant
        if ($form->tenant_id !== $this->tenantId) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'schema' => 'required|array',
            'schema.sections' => 'required|array',
            'schema.sections.*.title' => 'required|string',
            'schema.sections.*.fields' => 'array',
            'schema.sections.*.fields.*.name' => 'required|string',
            'schema.sections.*.fields.*.type' => 'required|string|in:text,textarea,number,email,phone,date,datetime,datetime-local,select,radio,checkbox,file,signature',
            'schema.sections.*.fields.*.label' => 'required|string',
            'schema.sections.*.fields.*.required' => 'boolean',
            'schema.sections.*.fields.*.options' => 'array|nullable',
        ]);

        $form->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'schema' => $validated['schema'],
        ]);

        return redirect()->route('tenant.forms.show', $form)
            ->with('success', 'Form updated successfully.');
    }

    public function show(Form $form)
    {
        
        // Ensure form belongs to current tenant
        if ($form->tenant_id !== $this->tenantId) {
            abort(404);
        }

        $form->load(['responses.user', 'responses.job']);

        // Get response statistics
        $responseStats = [
            'total' => $form->responses()->count(),
            'submitted' => $form->responses()->where('is_submitted', true)->count(),
            'draft' => $form->responses()->where('is_submitted', false)->count(),
            'this_week' => $form->responses()->where('created_at', '>=', now()->startOfWeek())->count(),
            'this_month' => $form->responses()->where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        // Get recent responses
        $recentResponses = $form->responses()
            ->with(['user', 'job'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get completion rate by day for the last 30 days
        $completionData = DB::table('form_responses')
            ->where('form_id', $form->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN is_submitted = 1 THEN 1 ELSE 0 END) as submitted')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('tenant/forms/show', [
            'form' => $form,
            'responseStats' => $responseStats,
            'recentResponses' => $recentResponses,
            'completionData' => $completionData,
        ]);
    }

    public function edit(Form $form)
    {

        
        // Ensure form belongs to current tenant
        if ($form->tenant_id !== $this->tenantId) {
            abort(404);
        }

        // Get available form types
        $formTypes = [
            'inspection' => 'Inspection Form',
            'maintenance' => 'Maintenance Form',
            'safety' => 'Safety Checklist',
            'quality' => 'Quality Control',
            'feedback' => 'Feedback Form',
            'report' => 'Report Form',
            'custom' => 'Custom Form',
        ];

        return Inertia::render('tenant/forms/edit', [
            'form' => $form,
            'formTypes' => $formTypes,
        ]);
    }



    public function destroy(Form $form)
    {
        
        // Ensure form belongs to current tenant
        if ($form->tenant_id !== $this->tenantId) {
            abort(404);
        }

        // Check if form has responses
        if ($form->responses()->count() > 0) {
            return back()->with('error', 'Cannot delete form with existing responses.');
        }

        $form->delete();

        return redirect()->route('tenant.forms.index')
            ->with('success', 'Form deleted successfully.');
    }
}