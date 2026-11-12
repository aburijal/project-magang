<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('land_assets', 'name')) {
            Schema::table('land_assets', function (Blueprint $table) {
                $table->string('name', 255)->nullable();
            });
        }

        if (!Schema::hasColumn('land_assets', 'acquisition_date')) {
            Schema::table('land_assets', function (Blueprint $table) {
                $table->date('acquisition_date')->nullable();
            });
        }
    }

    public function down(): void
    {
        // Tidak menghapus kolom untuk melindungi data
        // yang mungkin sudah ada sebelum migration ini.
    }
};