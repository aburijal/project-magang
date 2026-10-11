
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('land_assets', function (Blueprint $table) {
            $table->id();

            // Foreign key ke tabel master
            $table->foreignId('opd_id')
                ->constrained('opds')
                ->restrictOnDelete();

            $table->foreignId('location_id')
                ->constrained('locations')
                ->restrictOnDelete();

            $table->foreignId('asset_category_id')
                ->constrained('asset_categories')
                ->restrictOnDelete();

            $table->foreignId('land_right_id')
                ->nullable()
                ->constrained('land_rights')
                ->nullOnDelete();

            $table->foreignId('acquisition_source_id')
                ->nullable()
                ->constrained('acquisition_sources')
                ->nullOnDelete();

            // Data aset tanah
            $table->string('register_number', 50);
            $table->decimal('area', 15, 2)->nullable();
            $table->unsignedSmallInteger('acquisition_year')->nullable();
            $table->text('usage')->nullable();
            $table->decimal('price', 20, 2)->nullable();
            $table->text('description')->nullable();
            $table->text('field_condition')->nullable();

            $table->timestamps();

            // Nomor register unik dalam satu OPD
            $table->unique(
                ['opd_id', 'register_number'],
                'land_assets_opd_register_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('land_assets');
    }
};
