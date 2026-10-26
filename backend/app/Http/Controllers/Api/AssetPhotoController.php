<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetPhoto;
use App\Models\LandAsset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetPhotoController extends Controller
{
    public function index(LandAsset $land_asset)
    {
        $photos = $land_asset->photos()
            ->latest()
            ->get()
            ->map(fn($photo) => $this->formatPhoto($photo));

        return response()->json($photos);
    }

    public function store(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'photo' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
            'photo_type' => [
                'required',
                'in:denah,foto_tambahan',
            ],
            'description' => ['nullable', 'string'],
        ]);

        $file = $request->file('photo');
        $path = $file->store('asset-photos', 'public');

        $photo = $land_asset->photos()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'photo_type' => $validated['photo_type'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Foto aset berhasil diunggah.',
            'data' => $this->formatPhoto($photo),
        ], 201);
    }

    public function show(LandAsset $land_asset, AssetPhoto $photo)
    {
        $this->ensurePhotoBelongsToAsset($land_asset, $photo);

        return response()->json($this->formatPhoto($photo));
    }

    public function update(
        Request $request,
        LandAsset $land_asset,
        AssetPhoto $photo
    ) {
        $this->ensurePhotoBelongsToAsset($land_asset, $photo);

        $validated = $request->validate([
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $photo->update($validated);

        return response()->json([
            'message' => 'Keterangan foto berhasil diperbarui.',
            'data' => $this->formatPhoto($photo->fresh()),
        ]);
    }

    public function destroy(LandAsset $land_asset, AssetPhoto $photo)
    {
        $this->ensurePhotoBelongsToAsset($land_asset, $photo);

        if (Storage::disk('public')->exists($photo->file_path)) {
            Storage::disk('public')->delete($photo->file_path);
        }

        $photo->delete();

        return response()->json([
            'message' => 'Foto aset berhasil dihapus.',
        ]);
    }

    private function ensurePhotoBelongsToAsset(
        LandAsset $land_asset,
        AssetPhoto $photo
    ): void {
        abort_unless(
            (int) $photo->land_asset_id === (int) $land_asset->id,
            404,
            'Foto tidak ditemukan pada aset tanah tersebut.'
        );
    }

    private function formatPhoto(AssetPhoto $photo): array
    {
        return [
            'id' => $photo->id,
            'land_asset_id' => $photo->land_asset_id,
            'file_path' => $photo->file_path,
            'file_name' => $photo->file_name,
            'photo_type' => $photo->photo_type,
            'photo_url' => Storage::disk('public')->url($photo->file_path),
            'description' => $photo->description,
            'created_at' => $photo->created_at,
            'updated_at' => $photo->updated_at,
        ];
    }
}
