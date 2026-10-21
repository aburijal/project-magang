<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandAsset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LandAssetController extends Controller
{
    /**
     * Menampilkan daftar aset tanah.
     */
    public function index()
    {
        $assets = LandAsset::with([
            'opd',
            'location',
            'assetCategory',
            'landRight',
            'acquisitionSource',
            'certificates',
            'coordinates',
            'photos',
        ])
            ->latest()
            ->paginate(10);

        return response()->json($assets);
    }

    /**
     * Menambahkan aset tanah baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opd_id' => [
                'required',
                'exists:opds,id',
            ],
            'location_id' => [
                'required',
                'exists:locations,id',
            ],
            'asset_category_id' => [
                'required',
                'exists:asset_categories,id',
            ],
            'land_right_id' => [
                'nullable',
                'exists:land_rights,id',
            ],
            'acquisition_source_id' => [
                'nullable',
                'exists:acquisition_sources,id',
            ],
            'register_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('land_assets', 'register_number')
                    ->where('opd_id', $request->input('opd_id')),
            ],
            'area' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'acquisition_year' => [
                'nullable',
                'integer',
                'min:1900',
                'max:2100',
            ],
            'usage' => [
                'nullable',
                'string',
            ],
            'price' => [
                'nullable',
                'numeric',
                'min:0',
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'field_condition' => [
                'nullable',
                'string',
            ],
        ]);

        $asset = LandAsset::create($validated);

        return response()->json([
            'message' => 'Aset tanah berhasil ditambahkan.',
            'data' => $asset->load([
                'opd',
                'location',
                'assetCategory',
                'landRight',
                'acquisitionSource',
            ]),
        ], 201);
    }

    /**
     * Menampilkan detail satu aset tanah.
     */
    public function show(LandAsset $land_asset)
    {
        $land_asset->load([
            'opd',
            'location',
            'assetCategory',
            'landRight',
            'acquisitionSource',
            'certificates',
            'coordinates',
            'photos',
        ]);

        return response()->json([
            'data' => $land_asset,
        ]);
    }

    /**
     * Memperbarui aset tanah.
     * Mendukung pembaruan sebagian data menggunakan PATCH.
     */
    public function update(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'opd_id' => [
                'sometimes',
                'required',
                'exists:opds,id',
            ],
            'location_id' => [
                'sometimes',
                'required',
                'exists:locations,id',
            ],
            'asset_category_id' => [
                'sometimes',
                'required',
                'exists:asset_categories,id',
            ],
            'land_right_id' => [
                'sometimes',
                'nullable',
                'exists:land_rights,id',
            ],
            'acquisition_source_id' => [
                'sometimes',
                'nullable',
                'exists:acquisition_sources,id',
            ],
            'register_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('land_assets', 'register_number')
                    ->where(
                        'opd_id',
                        $request->input('opd_id', $land_asset->opd_id)
                    )
                    ->ignore($land_asset->id),
            ],
            'area' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],
            'acquisition_year' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1900',
                'max:2100',
            ],
            'usage' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'price' => [
                'sometimes',
                'nullable',
                'numeric',
                'min:0',
            ],
            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],
            'field_condition' => [
                'sometimes',
                'nullable',
                'string',
            ],
        ]);

        // Periksa kombinasi OPD dan nomor register yang efektif.
        $opdId = $validated['opd_id'] ?? $land_asset->opd_id;

        $registerNumber = $validated['register_number']
            ?? $land_asset->register_number;

        $duplicate = LandAsset::where('opd_id', $opdId)
            ->where('register_number', $registerNumber)
            ->where('id', '!=', $land_asset->id)
            ->exists();

        if ($duplicate) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'register_number' => [
                    'Nomor register tersebut sudah digunakan oleh OPD yang dipilih.',
                ],
            ]);
        }

        $land_asset->update($validated);

        return response()->json([
            'message' => 'Aset tanah berhasil diperbarui.',
            'data' => $land_asset->fresh()->load([
                'opd',
                'location',
                'assetCategory',
                'landRight',
                'acquisitionSource',
            ]),
        ]);
    }

    /**
     * Menghapus aset tanah beserta file fotonya.
     */
    public function destroy(LandAsset $land_asset)
    {
        $photoPaths = $land_asset->photos()
            ->pluck('file_path')
            ->all();

        DB::transaction(function () use ($land_asset) {
            $land_asset->delete();
        });

        // Hapus file setelah transaksi database berhasil.
        foreach ($photoPaths as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        return response()->json([
            'message' => 'Aset tanah berhasil dihapus.',
        ]);
    }
}
