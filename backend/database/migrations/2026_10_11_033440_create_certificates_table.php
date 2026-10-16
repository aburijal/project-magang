
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('land_asset_id')
                ->constrained('land_assets')
                ->cascadeOnDelete();

            $table->date('certificate_date')->nullable();
            $table->string('certificate_number', 100)->nullable();
            $table->string('status', 50)->default('belum_diketahui');
            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
