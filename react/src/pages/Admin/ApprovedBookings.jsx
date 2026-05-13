import { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookings';
import { AlertCircle, CalendarCheck } from 'lucide-react';
import { formatBookingDate, formatTimeSlot } from '../../utils/dateTime';
import toast from 'react-hot-toast';

const panelClass = 'rounded-2xl border border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur';
const actionButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';

export default function ApprovedBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function fetchApprovedBookings() {
    try {
      const response = await bookingService.getAdminBookings('confirmed,booked');
      setBookings(response.data.bookings);
    } catch {
      toast.error('Failed to fetch confirmed bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const handleMarkBooked = async (id) => {
    setActionLoading(id);
    try {
      await bookingService.markBooked(id);
      toast.success('Booking marked as booked');
      fetchApprovedBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      booked: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    };
    return `inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colors[status] || colors.confirmed}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-teal-700">Admin Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Confirmed / Booked</h1>
      </div>

      {bookings.length === 0 ? (
        <div className={`${panelClass} px-6 py-14 text-center`}>
          <AlertCircle size={44} className="mx-auto mb-4 text-slate-300" />
          <p className="font-medium text-slate-700">No confirmed bookings yet</p>
        </div>
      ) : (
        <div className={`${panelClass} overflow-hidden`}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Customer</th>
                <th className="px-5 py-4 text-left font-semibold">Service</th>
                <th className="px-5 py-4 text-left font-semibold">Date & Time</th>
                <th className="px-5 py-4 text-left font-semibold">Price</th>
                <th className="px-5 py-4 text-left font-semibold">Status</th>
                <th className="px-5 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-950">{booking.customer_name}</p>
                      <p className="text-sm text-slate-500">{booking.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{booking.service.name}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="block">{formatBookingDate(booking.booking_date)}</span>
                    <span className="text-xs text-slate-500">{formatTimeSlot(booking.time_slot)}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">${booking.price}</td>
                  <td className="px-5 py-4">
                    <span className={getStatusColor(booking.status)}>
                      {booking.status === 'approved' ? 'Confirmed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {booking.status === 'confirmed' || booking.status === 'approved' ? (
                      <button
                        onClick={() => handleMarkBooked(booking.id)}
                        disabled={actionLoading === booking.id}
                        className={actionButtonClass}
                      >
                        <CalendarCheck size={18} />
                        Mark Booked
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-slate-500">Booked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
