<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Opd extends Model
{
    protected $fillable = [
        'kode',
        'nama',
        'alamat',
    ];

    public function landAssets(): HasMany
    {
        return $this->hasMany(LandAsset::class);
    }
}
