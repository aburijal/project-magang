<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('asset_photos', 'photo_type')) {
            Schema::table('asset_photos', function (Blueprint $table) {
                $table->string('photo_type', 50)->nullable()->after('file_name');
            });
        }
    }

    public function down(): void
    {
        // Tidak menghapus kolom untuk melindungi data
        // yang mungkin sudah ada sebelum migration ini.
    }
};
