<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkerAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'region',
        'county',
    ];

    // Relacja do pracownika
    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
