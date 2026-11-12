
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('land_assets', function (Blueprint $table) {
            $table->dropUnique('land_assets_opd_register_unique');
        });
    }

    public function down(): void
    {
        // Tidak mengembalikan unique index karena
        // data kantor memang memperbolehkan nomor register duplikat.
    }
};
