
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asset_photos', function (Blueprint $table) {
            $table->string('photo_type', 30)
                ->default('foto_tambahan')
                ->after('file_name');
        });
    }

    public function down(): void
    {
        Schema::table('asset_photos', function (Blueprint $table) {
            $table->dropColumn('photo_type');
        });
    }
};
