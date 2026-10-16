<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'land_asset_id',
        'certificate_date',
        'certificate_number',
        'status',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'certificate_date' => 'date',
        ];
    }

    public function landAsset(): BelongsTo
    {
        return $this->belongsTo(LandAsset::class);
    }
}
