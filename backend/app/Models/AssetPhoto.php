<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetPhoto extends Model
{
    protected $fillable = [
        'land_asset_id',
        'file_path',
        'file_name',
        'photo_type',
        'description',
    ];

    public function landAsset(): BelongsTo
    {
        return $this->belongsTo(LandAsset::class);
    }
}
