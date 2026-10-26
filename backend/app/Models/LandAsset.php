<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LandAsset extends Model
{
    protected $fillable = [
        'opd_id',
        'location_id',
        'asset_category_id',
        'land_right_id',
        'acquisition_source_id',
        'register_number',
        'name',
        'area',
        'acquisition_year',
        'acquisition_date',
        'usage',
        'price',
        'description',
        'field_condition',
    ];

    protected function casts(): array
    {
        return [
            'area' => 'decimal:2',
            'price' => 'decimal:2',
            'acquisition_year' => 'integer',
            'acquisition_date' => 'date:Y-m-d',
        ];
    }

    public function opd(): BelongsTo
    {
        return $this->belongsTo(Opd::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function assetCategory(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function landRight(): BelongsTo
    {
        return $this->belongsTo(LandRight::class);
    }

    public function acquisitionSource(): BelongsTo
    {
        return $this->belongsTo(AcquisitionSource::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function coordinates(): HasMany
    {
        return $this->hasMany(AssetCoordinate::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AssetPhoto::class);
    }
}
