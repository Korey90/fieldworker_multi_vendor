<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tenant extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'tenants';

    protected $fillable = [
        'name',
        'sector',
        'data',
        'slug',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Get the tenant's status from data field
     */
    public function getStatusAttribute(): string
    {
        $data = $this->data ?? [];
        
        // Ensure $data is an array
        if (is_string($data)) {
            $data = json_decode($data, true) ?? [];
        }
        
        return $data['status'] ?? 'inactive';
    }

    /**
     * Set the tenant's status in data field
     */
    public function setStatusAttribute($value): void
    {
        $data = $this->data ?? [];
        
        // Ensure $data is an array
        if (is_string($data)) {
            $data = json_decode($data, true) ?? [];
        }
        
        $data['status'] = $value;
        $this->data = $data;
    }

    /**
     * Get tenant settings from data field
     */
    public function getSettingsAttribute(): array
    {
        return $this->data ?? [];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tenant_id');
    }

    public function workers(): HasMany
    {
        return $this->hasMany(Worker::class, 'tenant_id');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'tenant_id');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'tenant_id');
    }

    public function forms(): HasMany
    {
        return $this->hasMany(Form::class, 'tenant_id');
    }

    public function roles(): HasMany
    {
        return $this->hasMany(Role::class, 'tenant_id');
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'tenant_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'tenant_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class, 'tenant_id');
    }

    public function quota(): HasOne
    {
        return $this->hasOne(TenantQuota::class, 'tenant_id');
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'tenant_features', 'tenant_id', 'feature_id');
    }

    public function sectorModel(): BelongsTo
    {
        return $this->belongsTo(Sector::class, 'sector', 'code');
    }
}
