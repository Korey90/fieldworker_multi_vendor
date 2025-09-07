<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Certification extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'authority',
        'validity_period_months',
        'is_active',
        'tenant_id',
    ];

    protected $casts = [
        'validity_period_months' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the tenant that owns the certification.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(Worker::class, 'worker_certifications')
            ->withPivot(['issued_at', 'expires_at']);
    }
}
