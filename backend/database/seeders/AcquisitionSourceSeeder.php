<?php

namespace Database\Seeders;

use App\Models\AcquisitionSource;
use Illuminate\Database\Seeder;

class AcquisitionSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            ['kode' => 'BELUM-DITENTUKAN', 'nama' => 'Belum ditentukan'],
            ['kode' => 'PEMBELIAN', 'nama' => 'Pembelian'],
            ['kode' => 'HIBAH', 'nama' => 'Hibah'],
            ['kode' => 'PENYERAHAN', 'nama' => 'Penyerahan'],
            ['kode' => 'LAINNYA', 'nama' => 'Lainnya'],
        ];

        foreach ($sources as $source) {
            \App\Models\AcquisitionSource::updateOrCreate(
                ['kode' => $source['kode']],
                ['nama' => $source['nama']]
            );
        }
    }
}
