<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Form extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'schema',
    ];

    protected $casts = [
        'schema' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenat::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(FormResponse::class);
    }
}
