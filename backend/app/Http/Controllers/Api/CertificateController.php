<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\LandAsset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CertificateController extends Controller
{
    private const STATUSES = [
        'bersertifikat',
        'tidak_bersertifikat',
        'keterangan_lainnya',
    ];

    public function index(LandAsset $land_asset)
    {
        return response()->json(
            $land_asset->certificates()->latest()->get()
        );
    }

    public function store(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
            'description' => ['nullable', 'string'],
        ]);

        $certificate = $land_asset->certificates()->first();

        if ($certificate) {
            $certificate->update($validated);

            return response()->json([
                'message' => 'Status sertifikat berhasil diperbarui.',
                'data' => $certificate->fresh(),
            ]);
        }

        $certificate = $land_asset->certificates()->create($validated);

        return response()->json([
            'message' => 'Status sertifikat berhasil ditambahkan.',
            'data' => $certificate,
        ], 201);
    }

    public function show(
        LandAsset $land_asset,
        Certificate $certificate
    ) {
        $this->ensureCertificateBelongsToAsset($land_asset, $certificate);

        return response()->json($certificate);
    }

    public function update(
        Request $request,
        LandAsset $land_asset,
        Certificate $certificate
    ) {
        $this->ensureCertificateBelongsToAsset($land_asset, $certificate);

        $validated = $request->validate([
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in(self::STATUSES),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $certificate->update($validated);

        return response()->json([
            'message' => 'Status sertifikat berhasil diperbarui.',
            'data' => $certificate->fresh(),
        ]);
    }

    public function destroy(
        LandAsset $land_asset,
        Certificate $certificate
    ) {
        $this->ensureCertificateBelongsToAsset($land_asset, $certificate);

        $certificate->delete();

        return response()->json([
            'message' => 'Status sertifikat berhasil dihapus.',
        ]);
    }

    private function ensureCertificateBelongsToAsset(
        LandAsset $land_asset,
        Certificate $certificate
    ): void {
        abort_unless(
            (int) $certificate->land_asset_id === (int) $land_asset->id,
            404,
            'Status sertifikat tidak ditemukan pada aset tanah tersebut.'
        );
    }
}
