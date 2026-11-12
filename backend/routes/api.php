
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LandAssetController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\AssetCoordinateController;
use App\Http\Controllers\Api\AssetPhotoController;

// Login: dapat diakses tanpa login
Route::post('/login', [AuthController::class, 'login']);

// Data master: publik, hanya untuk membaca
Route::get('/opds', [MasterDataController::class, 'opds']);
Route::get('/locations', [MasterDataController::class, 'locations']);
Route::get('/asset-categories', [MasterDataController::class, 'assetCategories']);
Route::get('/land-rights', [MasterDataController::class, 'landRights']);
Route::get('/acquisition-sources', [MasterDataController::class, 'acquisitionSources']);

// Data aset: publik hanya untuk membaca
Route::apiResource('land-assets', LandAssetController::class)
    ->only(['index', 'show']);

// Sertifikat: publik hanya untuk membaca
Route::apiResource('land-assets.certificates', CertificateController::class)
    ->only(['index', 'show'])
    ->scoped();

// Koordinat: publik hanya untuk membaca
Route::apiResource('land-assets.coordinates', AssetCoordinateController::class)
    ->only(['index', 'show'])
    ->scoped();

// Foto: publik hanya untuk membaca
Route::apiResource('land-assets.photos', AssetPhotoController::class)
    ->only(['index', 'show'])
    ->scoped();

// Endpoint yang memerlukan login
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
        ]);
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Hanya admin yang boleh menambah, mengubah, dan menghapus
    Route::middleware('admin')->group(function () {
        Route::apiResource('land-assets', LandAssetController::class)
            ->except(['index', 'show']);

        Route::apiResource('land-assets.certificates', CertificateController::class)
            ->only(['store', 'update', 'destroy'])
            ->scoped();

        Route::apiResource('land-assets.coordinates', AssetCoordinateController::class)
            ->only(['store', 'update', 'destroy'])
            ->scoped();

        Route::apiResource('land-assets.photos', AssetPhotoController::class)
            ->only(['store', 'update', 'destroy'])
            ->scoped();
    });
});
