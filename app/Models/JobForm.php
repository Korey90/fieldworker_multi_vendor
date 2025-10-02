<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobForm extends Model
{
    use HasUuids;

    protected $fillable = [
        'job_id',
        'form_id',
        'order',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Form::class);
    }
}
