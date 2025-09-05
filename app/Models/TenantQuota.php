<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TenantQuota extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'tenant_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'tenant_id',
        'max_users',
        'max_storage_mb',
        'max_jobs_per_month',
    ];

    protected $casts = [
        'max_users' => 'integer',
        'max_storage_mb' => 'integer',
        'max_jobs_per_month' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenat::class);
    }
}
