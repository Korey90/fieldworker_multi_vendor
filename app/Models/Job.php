<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Job extends Model
{
    use HasUuids, SoftDeletes, HasFactory;

    protected $table = 'tenant_jobs';

    protected $fillable = [
        'tenant_id',
        'title',
        'description',
        'location_id',
        'status',
        'scheduled_at',
        'completed_at',
        'data',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'data' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }
    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(Worker::class, 'job_assignments', 'job_id', 'worker_id')
                    ->withTimestamps()
                    ->whereNull('job_assignments.deleted_at'); // Ignore soft deleted assignments
    }

    public function forms(): BelongsToMany
    {
        return $this->belongsToMany(Form::class, 'job_forms', 'job_id', 'form_id')
                    ->withPivot('order', 'is_required')
                    ->withTimestamps();
    }

    public function user(): HasMany
    {
        return $this->hasMany(User::class, 'assigned_user_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(JobAssignment::class, 'job_id');
    }

    public function formResponses(): HasMany
    {
        return $this->hasMany(FormResponse::class, 'job_id');
    }
}
