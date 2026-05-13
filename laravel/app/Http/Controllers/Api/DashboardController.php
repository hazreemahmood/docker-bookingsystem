<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $bookedBookings = Booking::where('status', 'booked')->count();
        $rejectedBookings = Booking::where('status', 'rejected')->count();
        $totalRevenue = Booking::whereIn('status', ['confirmed', 'booked'])->sum('price');

        return response()->json([
            'stats' => [
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'confirmed_bookings' => $confirmedBookings,
                'booked_bookings' => $bookedBookings,
                'approved_bookings' => $confirmedBookings + $bookedBookings,
                'rejected_bookings' => $rejectedBookings,
                'total_revenue' => round($totalRevenue, 2),
            ],
        ]);
    }
}
