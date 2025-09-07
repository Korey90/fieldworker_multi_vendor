<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormResponse extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'form_id',
        'tenant_id',
        'user_id', 
        'job_id',
        'response_data',
        'is_submitted',
        'submitted_at',
    ];

    protected $casts = [
        'response_data' => 'array',
        'is_submitted' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(Signature::class);
    }
}
