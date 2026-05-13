import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookings';
import { Plus, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { formatBookingDate, formatTimeSlot } from '../../utils/dateTime';
import toast from 'react-hot-toast';

const pageClass = 'max-w-7xl mx-auto px-4 py-8 sm:py-10';
const panelClass = 'rounded-2xl border border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur';
const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';
const ghostButtonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';
const dangerButtonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchBookings() {
    try {
      const response = await bookingService.getUserBookings();
      setBookings(response.data.bookings);
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (booking) => {
    const confirmed = window.confirm(`Delete booking for ${booking.service.name} on ${formatBookingDate(booking.booking_date)}?`);

    if (!confirmed) {
      return;
    }

    try {
      await bookingService.deleteBooking(booking.id);
      toast.success('Booking deleted');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 ring-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      booked: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
      cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
    };
    return `inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colors[status] || colors.pending}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className={pageClass}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Customer Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">My Bookings</h1>
        </div>
        <button
          onClick={() => navigate('/booking/create')}
          className={primaryButtonClass}
        >
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className={`${panelClass} px-6 py-14 text-center`}>
          <AlertCircle size={44} className="mx-auto mb-4 text-slate-300" />
          <p className="font-medium text-slate-700">No bookings yet.</p>
        </div>
      ) : (
        <div className={`${panelClass} overflow-hidden`}>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Service</th>
                <th className="px-5 py-4 text-left font-semibold">Date</th>
                <th className="px-5 py-4 text-left font-semibold">Time</th>
                <th className="px-5 py-4 text-left font-semibold">Price</th>
                <th className="px-5 py-4 text-left font-semibold">Status</th>
                <th className="px-5 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-medium text-slate-950">{booking.service.name}</td>
                  <td className="px-5 py-4 text-slate-600">{formatBookingDate(booking.booking_date)}</td>
                  <td className="px-5 py-4 text-slate-600">{formatTimeSlot(booking.time_slot)}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">${booking.price}</td>
                  <td className="px-5 py-4">
                    <span className={getStatusColor(booking.status)}>
                      {booking.status === 'approved' ? 'Confirmed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/booking/${booking.id}/edit`)}
                        disabled={booking.status !== 'pending'}
                        className={ghostButtonClass}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(booking)}
                        className={dangerButtonClass}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
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
