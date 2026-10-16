<?php

namespace Database\Seeders;

use App\Models\LandRight;
use Illuminate\Database\Seeder;

class LandRightSeeder extends Seeder
{
    public function run(): void
    {
        LandRight::firstOrCreate(
            ['kode' => 'HAK-PAKAI'],
            [
                'nama' => 'Hak Pakai',
                'keterangan' => 'Jenis hak atas tanah',
            ]
        );
    }
}
