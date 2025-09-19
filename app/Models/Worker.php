<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Worker extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'location_id',
        'employee_number',
        'hire_date',
        'hourly_rate',
        'status',
        'data',
        'first_name',
        'last_name',
    ];

    protected $casts = [
        'data' => 'array',
        'hire_date' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'worker_skills')
            ->withPivot(['level']);
    }

    public function jobAssignments(): HasMany
    {
        return $this->hasMany(JobAssignment::class);
    }

    public function currentJob(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'current_job_id');
    }

    public function formResponses(): HasMany
    {
        return $this->hasMany(FormResponse::class, 'user_id', 'user_id');
    }

    public function certifications(): BelongsToMany
    {
        return $this->belongsToMany(Certification::class, 'worker_certifications')
            ->withPivot(['issued_at', 'expires_at']);
    }
}
