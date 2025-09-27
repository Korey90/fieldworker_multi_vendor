<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Crypt;

class Worker extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'location_id',
        'employee_number',
        'first_name',
        'last_name',
        'dob',
        'phone',
        'email',
        'insurance_number', // wrażliwe → szyfrowane
        'hire_date',
        'hourly_rate',
        'status',
        'data', // dodatkowe info w JSON
    ];

    protected $casts = [
        'data' => 'array',
        'hire_date' => 'datetime',
    ];

    /**
     * Accessor/Mutator dla insurance_number (szyfrowanie w bazie)
     */
    protected function insuranceNumber(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? Crypt::decryptString($value) : null,
            set: fn ($value) => $value ? Crypt::encryptString($value) : null,
        );
    }

    // 🔹 Relacje
    public function address(): HasOne
    {
        return $this->hasOne(WorkerAddress::class);
    }


    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'worker_skills', 'worker_id', 'skill_id')
            ->withPivot(['level']);
    }

    public function jobAssignments(): HasMany
    {
        return $this->hasMany(JobAssignment::class);
    }

    public function currentJob()
    {
        return $this->hasOneThrough(
            Job::class,
            JobAssignment::class,
            'worker_id', // FK w job_assignments
            'id',        // PK w tenant_jobs
            'id',        // PK w workers
            'job_id'     // FK w job_assignments
        )->where('job_assignments.status', 'in_progress');
    }

    //public function currentJob(): BelongsTo
    //{
    //    return $this->belongsTo(Job::class, 'current_job_id');
    //}

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