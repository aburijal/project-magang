<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\Location;
use App\Models\AssetCategory;
use App\Models\LandRight;
use App\Models\AcquisitionSource;

class MasterDataController extends Controller
{
    public function opds()
    {
        return response()->json(
            Opd::orderBy('nama')->get()
        );
    }

    public function locations()
    {
        return response()->json(
            Location::orderBy('kecamatan')
                ->orderBy('gampong')
                ->get()
        );
    }

    public function assetCategories()
    {
        return response()->json(
            AssetCategory::orderBy('nama')->get()
        );
    }

    public function landRights()
    {
        return response()->json(
            LandRight::orderBy('nama')->get()
        );
    }

    public function acquisitionSources()
    {
        return response()->json(
            AcquisitionSource::orderBy('nama')->get()
        );
    }
}
