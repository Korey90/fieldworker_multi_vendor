<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TenantQuota extends Model
{
    use HasFactory, HasUuids;
    
    protected $fillable = [
        'tenant_id',
        'quota_type',
        'quota_limit',
        'current_usage',
        'status',
        'reset_date',
        'metadata',
    ];

    protected $casts = [
        'quota_limit' => 'integer',
        'current_usage' => 'integer',
        'reset_date' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the tenant that owns this quota
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if quota is exceeded
     */
    public function isExceeded(): bool
    {
        return $this->quota_limit >= 0 && $this->current_usage > $this->quota_limit;
    }

    /**
     * Check if quota is unlimited
     */
    public function isUnlimited(): bool
    {
        return $this->quota_limit < 0;
    }

    /**
     * Get usage percentage
     */
    public function getUsagePercentage(): float
    {
        if ($this->isUnlimited() || $this->quota_limit == 0) {
            return 0;
        }
        
        return round(($this->current_usage / $this->quota_limit) * 100, 2);
    }

    /**
     * Increment usage
     */
    public function incrementUsage(int $amount = 1): bool
    {
        $this->increment('current_usage', $amount);
        
        // Update status if exceeded
        if ($this->isExceeded()) {
            $this->update(['status' => 'exceeded']);
        }
        
        return true;
    }

    /**
     * Reset usage (usually for cyclic quotas)
     */
    public function resetUsage(): bool
    {
        return $this->update([
            'current_usage' => 0,
            'status' => 'active',
            'reset_date' => $this->quota_type === 'jobs' ? now()->addMonth() : null,
        ]);
    }

    /**
     * Scopes
     */
    public function scopeForTenant($query, string $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('quota_type', $type);
    }

    public function scopeExceeded($query)
    {
        return $query->where('status', 'exceeded');
    }
}
