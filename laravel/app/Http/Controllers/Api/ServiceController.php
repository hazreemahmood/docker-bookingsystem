<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::all();

        return response()->json([
            'services' => $services,
        ]);
    }

    public function show($id)
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'message' => 'Service not found',
            ], 404);
        }

        return response()->json([
            'service' => $service,
        ]);
    }
}
