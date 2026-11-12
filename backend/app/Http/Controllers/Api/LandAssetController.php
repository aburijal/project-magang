<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcquisitionSource;
use App\Models\AssetCategory;
use App\Models\AssetCoordinate;
use App\Models\AssetPhoto;
use App\Models\Certificate;
use App\Models\LandAsset;
use App\Models\LandRight;
use App\Models\Location;
use App\Models\Opd;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

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
            'nama' => ['required', 'string', 'max:255'],
            'opd' => ['required', 'string', 'max:150'],
            'kecamatan' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string', 'max:255'],

            'register' => ['required', 'string', 'max:50'],
            'luas' => ['nullable', 'numeric', 'min:0'],
            'tanggal' => ['nullable', 'date'],

            'hak' => [
                'nullable',
                'string',
                Rule::in([
                    'Hak Pakai',
                    'Hak Milik',
                    'Hak Pengelolaan',
                    'Hak Guna Bangunan',
                ]),
            ],

            'certificate_status' => [
                'required',
                'string',
                Rule::in([
                    'bersertifikat',
                    'tidak_bersertifikat',
                    'keterangan_lainnya',
                ]),
            ],
            'certificate_description' => ['nullable', 'string'],
            'penggunaan' => ['nullable', 'string'],
            'asal_usul' => [
                'nullable',
                'string',
                Rule::in(['Pembelian', 'Hibah', 'Penyerahan', 'Lainnya']),
            ],
            'nilai' => ['nullable', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string'],

            'latitude' => [
                'nullable',
                'required_with:longitude',
                'numeric',
                'between:-90,90',
            ],
            'longitude' => [
                'nullable',
                'required_with:latitude',
                'numeric',
                'between:-180,180',
            ],

            'denah' => ['required', 'image', 'max:5120'],
            'fotos' => ['nullable', 'array'],
            'fotos.*' => ['image', 'max:5120'],
        ]);

        $storedFiles = [];

        try {
            $asset = DB::transaction(function () use (
                $request,
                $validated,
                &$storedFiles
            ) {
                // 1. Cari atau buat OPD.
                $opd = Opd::firstOrCreate(
                    ['nama' => trim($validated['opd'])]
                );

                // 2. Cari atau buat lokasi.
                // Field alamat pada form digunakan sebagai nama gampong.
                $location = Location::firstOrCreate(
                    [
                        'kecamatan' => trim($validated['kecamatan']),
                        'gampong' => trim($validated['alamat']),
                    ],
                    [
                        'alamat' => null,
                    ]
                );

                // 3. Ambil kategori Tanah.
                $category = AssetCategory::firstOrCreate(
                    ['kode' => 'TANAH'],
                    [
                        'nama' => 'Tanah',
                        'keterangan' => 'Kategori aset tanah',
                    ]
                );

                // 4. Cari hak tanah.
                $landRight = !empty($validated['hak'])
                    ? LandRight::firstOrCreate(
                        ['nama' => $validated['hak']]
                    )
                    : null;

                // 5. Cari atau buat sumber perolehan.
                $sourceName = $validated['asal_usul']
                    ?? 'Belum ditentukan';

                $source = AcquisitionSource::firstOrCreate(
                    ['nama' => $sourceName]
                );

                // 7. Simpan aset utama.
                $asset = LandAsset::create([
                    'opd_id' => $opd->id,
                    'location_id' => $location->id,
                    'asset_category_id' => $category->id,
                    'land_right_id' => $landRight?->id,
                    'acquisition_source_id' => $source->id,

                    'name' => $validated['nama'],
                    'register_number' => $validated['register'],
                    'area' => $validated['luas'] ?? null,
                    'acquisition_date' => $validated['tanggal'] ?? null,
                    'acquisition_year' => !empty($validated['tanggal'])
                        ? (int) substr($validated['tanggal'], 0, 4)
                        : null,
                    'usage' => $validated['penggunaan'] ?? null,
                    'price' => $validated['nilai'] ?? null,
                    'description' => $validated['keterangan'] ?? null,
                ]);

                // 8. Simpan status sertifikat.
                $asset->certificates()->create([
                    'status' => $validated['certificate_status'],
                    'description' => $validated['certificate_description'] ?? null,
                ]);

                // 9. Simpan koordinat jika tersedia.
                if (
                    isset($validated['latitude']) &&
                    isset($validated['longitude'])
                ) {
                    $asset->coordinates()->create([
                        'latitude' => $validated['latitude'],
                        'longitude' => $validated['longitude'],
                        'coordinate_format' => 'decimal',
                    ]);
                }

                // 10. Simpan foto denah.
                $denah = $request->file('denah');

                $denahPath = $denah->store('asset-photos', 'public');

                $storedFiles[] = $denahPath;

                $asset->photos()->create([
                    'file_path' => $denahPath,
                    'file_name' => $denah->getClientOriginalName(),
                    'photo_type' => 'denah',
                    'description' => 'Foto denah aset',
                ]);

                // 11. Simpan foto tambahan.
                foreach ($request->file('fotos', []) as $photo) {
                    $photoPath = $photo->store('asset-photos', 'public');

                    $storedFiles[] = $photoPath;

                    $asset->photos()->create([
                        'file_path' => $photoPath,
                        'file_name' => $photo->getClientOriginalName(),
                        'photo_type' => 'tambahan',
                        'description' => 'Foto tambahan aset',
                    ]);
                }

                return $asset;
            });

            return response()->json([
                'message' => 'Aset tanah berhasil ditambahkan.',
                'data' => $asset->load([
                    'opd',
                    'location',
                    'assetCategory',
                    'landRight',
                    'acquisitionSource',
                    'certificates',
                    'coordinates',
                    'photos',
                ]),
            ], 201);
        } catch (Throwable $e) {
            // Hapus file jika proses database gagal.
            foreach ($storedFiles as $file) {
                Storage::disk('public')->delete($file);
            }

            throw $e;
        }
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
     */
    public function update(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'nama' => ['sometimes', 'required', 'string', 'max:255'],
            'opd' => ['sometimes', 'required', 'string', 'max:150'],
            'kecamatan' => ['sometimes', 'required', 'string', 'max:100'],
            'alamat' => ['sometimes', 'required', 'string', 'max:255'],

            'register' => ['sometimes', 'required', 'string', 'max:50'],
            'luas' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tanggal' => ['sometimes', 'nullable', 'date'],

            'hak' => [
                'sometimes',
                'nullable',
                'string',
                Rule::in([
                    'Hak Pakai',
                    'Hak Milik',
                    'Hak Pengelolaan',
                    'Hak Guna Bangunan',
                ]),
            ],

            'certificate_status' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    'bersertifikat',
                    'tidak_bersertifikat',
                    'keterangan_lainnya',
                ]),
            ],
            'certificate_description' => ['sometimes', 'nullable', 'string'],
            'penggunaan' => ['sometimes', 'nullable', 'string'],
            'asal_usul' => [
                'sometimes',
                'nullable',
                'string',
                Rule::in(['Pembelian', 'Hibah', 'Penyerahan', 'Lainnya']),
            ],
            'nilai' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'keterangan' => ['sometimes', 'nullable', 'string'],

            'latitude' => [
                'sometimes',
                'nullable',
                'required_with:longitude',
                'numeric',
                'between:-90,90',
            ],
            'longitude' => [
                'sometimes',
                'nullable',
                'required_with:latitude',
                'numeric',
                'between:-180,180',
            ],
        ]);

        $newOpdId = $land_asset->opd_id;

        if (isset($validated['opd'])) {
            $newOpd = Opd::firstOrCreate([
                'nama' => trim($validated['opd']),
            ]);

            $newOpdId = $newOpd->id;
        }

        DB::transaction(function () use (
            $validated,
            $land_asset,
            $newOpdId
        ) {
            $data = [];

            if (isset($validated['opd'])) {
                $data['opd_id'] = $newOpdId;
            }

            if (isset($validated['kecamatan']) || isset($validated['alamat'])) {
                $kecamatan = $validated['kecamatan']
                    ?? $land_asset->location->kecamatan;

                $gampong = $validated['alamat']
                    ?? $land_asset->location->gampong;

                $location = Location::firstOrCreate(
                    [
                        'kecamatan' => trim($kecamatan),
                        'gampong' => trim($gampong),
                    ],
                    ['alamat' => null]
                );

                $data['location_id'] = $location->id;
            }

            if (isset($validated['hak'])) {
                $landRight = $validated['hak']
                    ? LandRight::firstOrCreate(['nama' => $validated['hak']])
                    : null;

                $data['land_right_id'] = $landRight?->id;
            }

            if (array_key_exists('asal_usul', $validated)) {
                $source = AcquisitionSource::firstOrCreate(
                    ['nama' => $validated['asal_usul'] ?? 'Belum ditentukan']
                );

                $data['acquisition_source_id'] = $source->id;
            }

            if (isset($validated['nama'])) {
                $data['name'] = $validated['nama'];
            }

            if (isset($validated['register'])) {
                $data['register_number'] = $validated['register'];
            }

            if (array_key_exists('luas', $validated)) {
                $data['area'] = $validated['luas'];
            }

            if (array_key_exists('tanggal', $validated)) {
                $data['acquisition_date'] = $validated['tanggal'];
                $data['acquisition_year'] = $validated['tanggal']
                    ? (int) substr($validated['tanggal'], 0, 4)
                    : null;
            }

            if (array_key_exists('penggunaan', $validated)) {
                $data['usage'] = $validated['penggunaan'];
            }

            if (array_key_exists('nilai', $validated)) {
                $data['price'] = $validated['nilai'];
            }

            if (array_key_exists('keterangan', $validated)) {
                $data['description'] = $validated['keterangan'];
            }

            $land_asset->update($data);

            // Perbarui status sertifikat tanpa membuat riwayat baru.
            if (
                array_key_exists('certificate_status', $validated) ||
                array_key_exists('certificate_description', $validated)
            ) {
                $certificate = $land_asset->certificates()->first();

                if ($certificate) {
                    $certificateData = [];

                    if (array_key_exists('certificate_status', $validated)) {
                        $certificateData['status'] = $validated['certificate_status'];
                    }

                    if (array_key_exists('certificate_description', $validated)) {
                        $certificateData['description'] = $validated['certificate_description'];
                    }

                    $certificate->update($certificateData);
                } elseif (array_key_exists('certificate_status', $validated)) {
                    $land_asset->certificates()->create([
                        'status' => $validated['certificate_status'],
                        'description' => $validated['certificate_description'] ?? null,
                    ]);
                }
            }

            // Perbarui koordinat jika kedua field dikirim.
            if (
                isset($validated['latitude']) &&
                isset($validated['longitude'])
            ) {
                $land_asset->coordinates()->updateOrCreate(
                    [],
                    [
                        'latitude' => $validated['latitude'],
                        'longitude' => $validated['longitude'],
                        'coordinate_format' => 'decimal',
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Aset tanah berhasil diperbarui.',
            'data' => $land_asset->fresh()->load([
                'opd',
                'location',
                'assetCategory',
                'landRight',
                'acquisitionSource',
                'certificates',
                'coordinates',
                'photos',
            ]),
        ]);
    }

    /**
     * Menghapus aset tanah dan file fotonya.
     */
    public function destroy(LandAsset $land_asset)
    {
        $photoPaths = $land_asset->photos()
            ->pluck('file_path')
            ->all();

        DB::transaction(function () use ($land_asset) {
            $land_asset->delete();
        });

        foreach ($photoPaths as $path) {
            Storage::disk('public')->delete($path);
        }

        return response()->json([
            'message' => 'Aset tanah berhasil dihapus.',
        ]);
    }
}
