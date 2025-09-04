<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'category',
        'description',
    ];

    public function workers(): BelongsToMany
    {
        return $this->belongsToMany(Worker::class, 'worker_skills');
    }
}
