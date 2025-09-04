<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobAssignment extends Model
{
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = ['tenant_job_id', 'worker_id'];

    protected $fillable = [
        'tenant_job_id',
        'worker_id',
        'role',
        'status',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'tenant_job_id');
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }
}
