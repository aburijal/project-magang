
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('land_asset_id')
                ->constrained('land_assets')
                ->cascadeOnDelete();

            $table->string('file_path', 255);
            $table->string('file_name', 255)->nullable();
            $table->text('description')->nullable();

            $table->timestamps();

            $table->index('land_asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_photos');
    }
};
