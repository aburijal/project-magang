<?php

namespace Database\Seeders;

use App\Models\Opd;
use Illuminate\Database\Seeder;

class OpdSeeder extends Seeder
{
    public function run(): void
    {
        Opd::firstOrCreate(
            ['kode' => 'BPKD-PPBMD'],
            [
                'nama' => 'BPKD-PPBMD',
                'alamat' => null,
            ]
        );
    }
}
