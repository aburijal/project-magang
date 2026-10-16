<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetCoordinate extends Model
{
    protected $fillable = [
        'land_asset_id',
        'latitude',
        'longitude',
        'coordinate_format',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function landAsset(): BelongsTo
    {
        return $this->belongsTo(LandAsset::class);
    }
}
