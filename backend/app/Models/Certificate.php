<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'land_asset_id',
        'status',
        'description',
    ];

    public function landAsset(): BelongsTo
    {
        return $this->belongsTo(LandAsset::class);
    }
}
