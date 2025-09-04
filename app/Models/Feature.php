<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'key',
        'name',
        'description',
    ];

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenat::class, 'tenant_features', 'feature_id', 'tenant_id');
    }
}
