<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandAsset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LandAssetController extends Controller
{
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
        ])->latest()->paginate(10);

        return response()->json($assets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'opd_id' => ['required', 'exists:opds,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'asset_category_id' => ['required', 'exists:asset_categories,id'],
            'land_right_id' => ['nullable', 'exists:land_rights,id'],
            'acquisition_source_id' => ['nullable', 'exists:acquisition_sources,id'],
            'register_number' => ['required', 'string', 'max:50'],
            'area' => ['nullable', 'numeric', 'min:0'],
            'acquisition_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'usage' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'field_condition' => ['nullable', 'string'],
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

        return response()->json(['data' => $land_asset]);
    }

    public function update(Request $request, LandAsset $land_asset)
    {
        $validated = $request->validate([
            'opd_id' => ['sometimes', 'required', 'exists:opds,id'],
            'location_id' => ['sometimes', 'required', 'exists:locations,id'],
            'asset_category_id' => ['sometimes', 'required', 'exists:asset_categories,id'],
            'land_right_id' => ['sometimes', 'nullable', 'exists:land_rights,id'],
            'acquisition_source_id' => ['sometimes', 'nullable', 'exists:acquisition_sources,id'],
            'register_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('land_assets', 'register_number')
                    ->where('opd_id', $request->input('opd_id', $land_asset->opd_id))
                    ->ignore($land_asset->id),
            ],
            'area' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'acquisition_year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:2100'],
            'usage' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'description' => ['sometimes', 'nullable', 'string'],
            'field_condition' => ['sometimes', 'nullable', 'string'],
        ]);

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

    public function destroy(LandAsset $land_asset)
    {
        $land_asset->delete();

        return response()->json([
            'message' => 'Aset tanah berhasil dihapus.',
        ]);
    }
}
