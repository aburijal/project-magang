<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandAsset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Opd;
use App\Models\Location;
use App\Models\AssetCategory;
use App\Models\LandRight;
use App\Models\AcquisitionSource;

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
            'name' => ['required', 'string', 'max:255'],
            'opd_name' => ['nullable', 'string', 'max:150'],
            'kecamatan' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string'],
            'register_number' => ['nullable', 'string', 'max:50'],
            'area' => ['nullable', 'numeric', 'min:0'],
            'acquisition_date' => ['nullable', 'date'],
            'land_right_name' => ['nullable', 'string', 'max:150'],
            'acquisition_source_name' => ['nullable', 'string', 'max:150'],
            'usage' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $asset = DB::transaction(function () use ($validated) {
            $opdName = trim($validated['opd_name'] ?? '');

            if ($opdName === '') {
                $opdName = 'Belum ditentukan';
            }

            $opd = Opd::firstOrCreate(
                ['nama' => $opdName],
                ['kode' => null]
            );

            $address = trim($validated['alamat']);

            $location = Location::firstOrCreate(
                [
                    'kecamatan' => $validated['kecamatan'],
                    'gampong' => $address,
                ],
                ['alamat' => $address]
            );

            $category = AssetCategory::where('nama', 'Tanah')->first();

            if (!$category) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'asset_category_id' => [
                        'Kategori Tanah belum tersedia di data master.',
                    ],
                ]);
            }


            $landRightId = null;

            if (!empty($validated['land_right_name'])) {
                $rightName = trim($validated['land_right_name']);

                // Samakan singkatan dari form dengan nama master database.
                $rightAliases = [
                    'HGB' => 'Hak Guna Bangunan',
                ];

                $rightName = $rightAliases[$rightName] ?? $rightName;

                $landRightId = LandRight::where('nama', $rightName)
                    ->value('id');
            }

            $sourceId = null;

            if (!empty($validated['acquisition_source_name'])) {
                $sourceName = trim($validated['acquisition_source_name']);

                $sourceAliases = [
                    'Lainnya' => 'Lainnya',
                ];

                $sourceName = $sourceAliases[$sourceName] ?? $sourceName;

                $sourceId = AcquisitionSource::firstOrCreate(
                    ['nama' => $sourceName]
                )->id;
            }


            $registerNumber = trim($validated['register_number'] ?? '');

            if ($registerNumber === '') {
                $registerNumber = 'AUTO-' . now()->format('YmdHisv');
            }

            $duplicate = LandAsset::where('opd_id', $opd->id)
                ->where('register_number', $registerNumber)
                ->exists();

            if ($duplicate) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'register_number' => [
                        'Nomor register sudah digunakan oleh OPD tersebut.',
                    ],
                ]);
            }

            return LandAsset::create([
                'opd_id' => $opd->id,
                'location_id' => $location->id,
                'asset_category_id' => $category->id,
                'land_right_id' => $landRightId,
                'acquisition_source_id' => $sourceId,
                'register_number' => $registerNumber,
                'name' => $validated['name'],
                'area' => $validated['area'] ?? null,
                'acquisition_date' => $validated['acquisition_date'] ?? null,
                'acquisition_year' => !empty($validated['acquisition_date'])
                    ? (int) substr($validated['acquisition_date'], 0, 4)
                    : null,
                'usage' => $validated['usage'] ?? null,
                'price' => $validated['price'] ?? null,
                'description' => $validated['description'] ?? null,
            ]);
        });

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
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'acquisition_date' => ['sometimes', 'nullable', 'date'],

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
