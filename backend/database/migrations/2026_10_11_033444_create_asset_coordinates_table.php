
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_coordinates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('land_asset_id')
                ->constrained('land_assets')
                ->cascadeOnDelete();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('coordinate_format', 30)->nullable();
            $table->text('description')->nullable();

            $table->timestamps();

            $table->index('land_asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_coordinates');
    }
};
