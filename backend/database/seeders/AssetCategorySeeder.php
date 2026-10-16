<?php

namespace Database\Seeders;

use App\Models\AssetCategory;
use Illuminate\Database\Seeder;

class AssetCategorySeeder extends Seeder
{
    public function run(): void
    {
        AssetCategory::firstOrCreate(
            ['kode' => 'TANAH'],
            [
                'nama' => 'Tanah',
                'keterangan' => 'Aset tanah',
            ]
        );
    }
}
