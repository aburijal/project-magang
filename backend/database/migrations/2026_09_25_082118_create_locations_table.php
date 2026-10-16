
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('kecamatan', 100);
            $table->string('gampong', 150)->nullable();
            $table->text('alamat')->nullable();
            $table->timestamps();

            $table->index(['kecamatan', 'gampong']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
