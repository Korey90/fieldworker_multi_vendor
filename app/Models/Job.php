<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Job extends Model
{
    use HasUuids, SoftDeletes;

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
        return $this->belongsTo(Tenat::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(JobAssignment::class, 'tenant_job_id');
    }

    public function formResponses(): HasMany
    {
        return $this->hasMany(FormResponse::class, 'tenant_job_id');
    }
}
