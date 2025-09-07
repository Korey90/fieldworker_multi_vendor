<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class JobAssignment extends Model
{
    use HasFactory, HasUuids;
    
    protected $fillable = [
        'job_id',
        'worker_id',
        'role',
        'status',
        'assigned_at',
        'completed_at',
        'notes',
        'data',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
        'data' => 'array',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }

    /**
     * Get status badge class
     */
    protected function statusBadge(): Attribute
    {
        return Attribute::make(
            get: fn() => match($this->status) {
                'assigned' => 'info',
                'in_progress' => 'warning',
                'completed' => 'success',
                'cancelled' => 'danger',
                default => 'secondary'
            }
        );
    }

    /**
     * Check if assignment is active
     */
    public function isActive(): bool
    {
        return in_array($this->status, ['assigned', 'in_progress']);
    }

    /**
     * Check if assignment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
