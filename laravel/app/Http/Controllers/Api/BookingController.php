<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    private const SLOT_TIMES = ['09:00', '11:00', '13:00', '15:00'];
    private const SLOT_DURATION_MINUTES = 120;

    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|string|email',
            'booking_date' => 'required|date|after:today',
            'time_slot' => 'required|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        $service = Service::find($request->service_id);

        if (!$this->isValidSlot($request->time_slot)) {
            return response()->json([
                'message' => 'Please choose one of the available 2-hour time slots',
            ], 422);
        }

        if ($this->slotIsTaken($request->service_id, $request->booking_date, $request->time_slot)) {
            return response()->json([
                'message' => 'This time slot is not available',
            ], 422);
        }

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'service_id' => $request->service_id,
            'customer_name' => $request->customer_name,
            'customer_email' => $request->customer_email,
            'booking_date' => $request->booking_date,
            'time_slot' => $request->time_slot,
            'duration_minutes' => self::SLOT_DURATION_MINUTES,
            'price' => $service->base_price,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking->load('service'),
        ], 201);
    }

    public function index(Request $request)
    {
        $bookings = Booking::where('user_id', auth()->id())
            ->with('service')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function show($id)
    {
        $booking = Booking::with('service', 'user')->find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'booking' => $booking,
        ]);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($request->input('status') === 'cancelled') {
            $booking->update(['status' => 'cancelled']);

            return response()->json([
                'message' => 'Booking cancelled successfully',
                'booking' => $booking->load('service'),
            ]);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending bookings can be edited',
            ], 422);
        }

        $request->validate([
            'service_id' => 'required|exists:services,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|string|email',
            'booking_date' => 'required|date|after:today',
            'time_slot' => 'required|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        if (!$this->isValidSlot($request->time_slot)) {
            return response()->json([
                'message' => 'Please choose one of the available 2-hour time slots',
            ], 422);
        }

        if ($this->slotIsTaken($request->service_id, $request->booking_date, $request->time_slot, $booking->id)) {
            return response()->json([
                'message' => 'This time slot is not available',
            ], 422);
        }

        $service = Service::find($request->service_id);

        $booking->update([
            'service_id' => $request->service_id,
            'customer_name' => $request->customer_name,
            'customer_email' => $request->customer_email,
            'booking_date' => $request->booking_date,
            'time_slot' => $request->time_slot,
            'duration_minutes' => self::SLOT_DURATION_MINUTES,
            'price' => $service->base_price,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking->load('service'),
        ]);
    }

    public function destroy($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully',
        ]);
    }

    public function adminIndex(Request $request)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $status = $request->query('status', 'pending');
        $statuses = $status === 'approved'
            ? ['confirmed', 'booked']
            : explode(',', $status);

        $bookings = Booking::whereIn('status', $statuses)
            ->with('service', 'user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function approve($id)
    {
        return $this->confirm($id);
    }

    public function confirm($id)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        $booking->update(['status' => 'confirmed']);

        return response()->json([
            'message' => 'Booking confirmed successfully',
            'booking' => $booking->load('service', 'user'),
        ]);
    }

    public function book($id)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Only confirmed bookings can be marked as booked',
            ], 422);
        }

        $booking->update(['status' => 'booked']);

        return response()->json([
            'message' => 'Booking marked as booked successfully',
            'booking' => $booking->load('service', 'user'),
        ]);
    }

    public function complete($id)
    {
        return $this->book($id);
    }

    public function reject($id)
    {
        if (!auth()->user()->isAdmin()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'message' => 'Booking not found',
            ], 404);
        }

        $booking->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Booking rejected successfully',
            'booking' => $booking,
        ]);
    }

    private function isValidSlot($timeSlot)
    {
        return in_array($timeSlot, self::SLOT_TIMES, true);
    }

    private function slotIsTaken($serviceId, $bookingDate, $timeSlot, $ignoreBookingId = null)
    {
        return Booking::where('service_id', $serviceId)
            ->where('booking_date', $bookingDate)
            ->where('time_slot', $timeSlot)
            ->whereIn('status', ['pending', 'confirmed', 'booked', 'approved'])
            ->when($ignoreBookingId, function ($query) use ($ignoreBookingId) {
                return $query->where('id', '!=', $ignoreBookingId);
            })
            ->exists();
    }
}
