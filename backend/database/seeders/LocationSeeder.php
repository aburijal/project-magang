<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        Location::firstOrCreate([
            'kecamatan' => 'Banda Sakti',
            'gampong' => 'Mon Geudong',
        ], [
            'alamat' => null,
        ]);
    }
}
