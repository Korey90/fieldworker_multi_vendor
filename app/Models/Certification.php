<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Certification extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'authority',
        'validity_period_months',
    ];

    protected $casts = [
        'validity_period_months' => 'integer',
    ];

    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(Worker::class, 'worker_certifications')
            ->withPivot(['issued_at', 'expires_at']);
    }
}
