<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Signature extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'form_response_id',
        'user_id',
        'signatory_name',
        'signatory_role',
        'signature_path',
        'signature_image_path',
        'document_hash',
        'signed_at',
        'metadata',
        'name',
        'role',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function formResponse(): BelongsTo
    {
        return $this->belongsTo(FormResponse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
