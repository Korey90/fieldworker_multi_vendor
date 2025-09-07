<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Asset extends Model
{
    use HasUuids, SoftDeletes, HasFactory;

    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'description',
        'asset_type',
        'serial_number',
        'purchase_date',
        'purchase_cost',
        'current_value',
        'status',
        'assigned_to',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'purchase_date' => 'date',
        'purchase_cost' => 'decimal:2',
        'current_value' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function currentAssignment(): BelongsTo
    {
        return $this->belongsTo(Worker::class, 'assigned_to');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'entity_id')->where('entity_type', self::class);
    }
}
