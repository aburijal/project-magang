<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetCoordinate;
use App\Models\LandAsset;
use Illuminate\Http\Request;

class AssetCoordinateController extends Controller
{
    public function index(LandAsset $land_asset)
    {
        return response()->json(
            $land_asset->coordinates()->latest()->get()
        );
    }

    public function store(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'coordinate_format' => ['nullable', 'string', 'max:30'],
            'description' => ['nullable', 'string'],
        ]);

        $coordinate = $land_asset->coordinates()->create($validated);

        return response()->json([
            'message' => 'Koordinat aset berhasil ditambahkan.',
            'data' => $coordinate,
        ], 201);
    }

    public function show(
        LandAsset $land_asset,
        AssetCoordinate $coordinate
    ) {
        $this->ensureCoordinateBelongsToAsset($land_asset, $coordinate);

        return response()->json($coordinate);
    }

    public function update(
        Request $request,
        LandAsset $land_asset,
        AssetCoordinate $coordinate
    ) {
        $this->ensureCoordinateBelongsToAsset($land_asset, $coordinate);

        $validated = $request->validate([
            'latitude' => ['sometimes', 'required', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'required', 'numeric', 'between:-180,180'],
            'coordinate_format' => ['sometimes', 'nullable', 'string', 'max:30'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $coordinate->update($validated);

        return response()->json([
            'message' => 'Koordinat aset berhasil diperbarui.',
            'data' => $coordinate->fresh(),
        ]);
    }

    public function destroy(
        LandAsset $land_asset,
        AssetCoordinate $coordinate
    ) {
        $this->ensureCoordinateBelongsToAsset($land_asset, $coordinate);

        $coordinate->delete();

        return response()->json([
            'message' => 'Koordinat aset berhasil dihapus.',
        ]);
    }

    private function ensureCoordinateBelongsToAsset(
        LandAsset $land_asset,
        AssetCoordinate $coordinate
    ): void {
        abort_unless(
            (int) $coordinate->land_asset_id === (int) $land_asset->id,
            404,
            'Koordinat tidak ditemukan pada aset tanah tersebut.'
        );
    }
}
