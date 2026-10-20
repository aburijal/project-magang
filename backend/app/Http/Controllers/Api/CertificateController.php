<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\LandAsset;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(LandAsset $land_asset)
    {
        return response()->json(
            $land_asset->certificates()->latest()->get()
        );
    }

    public function store(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'certificate_date' => ['nullable', 'date'],
            'certificate_number' => ['nullable', 'string', 'max:100'],
            'status' => [
                'required',
                'string',
                'in:bersertifikat,belum_bersertifikat,belum_diketahui',
            ],
            'description' => ['nullable', 'string'],
        ]);

        $certificate = $land_asset->certificates()->create($validated);

        return response()->json([
            'message' => 'Sertifikat berhasil ditambahkan.',
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
            'certificate_date' => ['sometimes', 'nullable', 'date'],
            'certificate_number' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
            ],
            'status' => [
                'sometimes',
                'required',
                'string',
                'in:bersertifikat,belum_bersertifikat,belum_diketahui',
            ],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $certificate->update($validated);

        return response()->json([
            'message' => 'Sertifikat berhasil diperbarui.',
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
            'message' => 'Sertifikat berhasil dihapus.',
        ]);
    }

    private function ensureCertificateBelongsToAsset(
        LandAsset $land_asset,
        Certificate $certificate
    ): void {
        abort_unless(
            (int) $certificate->land_asset_id === (int) $land_asset->id,
            404,
            'Sertifikat tidak ditemukan pada aset tanah tersebut.'
        );
    }
}
