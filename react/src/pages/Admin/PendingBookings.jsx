import { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookings';
import { Check, X, AlertCircle } from 'lucide-react';
import { formatBookingDate, formatTimeSlot } from '../../utils/dateTime';
import toast from 'react-hot-toast';

const panelClass = 'rounded-2xl border border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur';
const confirmButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60';
const rejectButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60';

export default function PendingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function fetchPendingBookings() {
    try {
      const response = await bookingService.getAdminBookings('pending');
      setBookings(response.data.bookings);
    } catch {
      toast.error('Failed to fetch pending bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await bookingService.confirmBooking(id);
      toast.success('Booking confirmed!');
      fetchPendingBookings();
    } catch {
      toast.error('Failed to confirm booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await bookingService.rejectBooking(id);
      toast.success('Booking rejected');
      fetchPendingBookings();
    } catch {
      toast.error('Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-teal-700">Admin Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Pending Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <div className={`${panelClass} px-6 py-14 text-center`}>
          <AlertCircle size={44} className="mx-auto mb-4 text-slate-300" />
          <p className="font-medium text-slate-700">No pending bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className={`${panelClass} p-5 sm:p-6`}>
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</p>
                  <p className="mt-1 font-semibold text-slate-950">{booking.customer_name}</p>
                  <p className="text-sm text-slate-500">{booking.customer_email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Service</p>
                  <p className="mt-1 font-semibold text-slate-950">{booking.service.name}</p>
                  <p className="text-sm text-slate-500">{formatBookingDate(booking.booking_date)}</p>
                  <p className="text-sm text-slate-500">{formatTimeSlot(booking.time_slot)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Price</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">${booking.price}</p>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                  <p className="mt-1 text-sm text-slate-700">{booking.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(booking.id)}
                  disabled={actionLoading === booking.id}
                  className={confirmButtonClass}
                >
                  <Check size={18} />
                  Confirm
                </button>
                <button
                  onClick={() => handleReject(booking.id)}
                  disabled={actionLoading === booking.id}
                  className={rejectButtonClass}
                >
                  <X size={18} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
