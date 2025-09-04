<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FormResponse extends Model
{
    use HasUuids;

    protected $fillable = [
        'form_id',
        'tenant_job_id',
        'worker_id',
        'answers',
    ];

    protected $casts = [
        'answers' => 'array',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'tenant_job_id');
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(Signature::class);
    }
}
