<?php

namespace Database\Seeders;

use App\Models\AcquisitionSource;
use Illuminate\Database\Seeder;

class AcquisitionSourceSeeder extends Seeder
{
    public function run(): void
    {
        AcquisitionSource::firstOrCreate(
            ['kode' => 'BELUM-DITENTUKAN'],
            [
                'nama' => 'Belum ditentukan',
                'keterangan' => 'Nilai sementara untuk pengujian',
            ]
        );
    }
}
