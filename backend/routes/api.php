
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LandAssetController;
use App\Http\Controllers\Api\MasterDataController;

// Login: tidak membutuhkan token
Route::post('/login', [AuthController::class, 'login']);

// Data master: dapat dibaca tanpa login
Route::get('/opds', [MasterDataController::class, 'opds']);
Route::get('/locations', [MasterDataController::class, 'locations']);
Route::get('/asset-categories', [MasterDataController::class, 'assetCategories']);
Route::get('/land-rights', [MasterDataController::class, 'landRights']);
Route::get('/acquisition-sources', [MasterDataController::class, 'acquisitionSources']);

// Endpoint yang wajib login
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
        ]);
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('land-assets', LandAssetController::class);
});
