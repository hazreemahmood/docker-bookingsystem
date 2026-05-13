import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceService } from '../../services/services';
import { bookingService } from '../../services/bookings';
import { TIME_SLOTS } from '../../utils/dateTime';
import toast from 'react-hot-toast';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
const labelClass = 'text-sm font-medium text-slate-700';
const primaryButtonClass = 'rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButtonClass = 'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60';

export default function BookingForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service_id: '',
    customer_name: '',
    customer_email: '',
    booking_date: '',
    time_slot: '',
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFormData() {
      try {
        const [servicesResponse, bookingResponse] = await Promise.all([
          serviceService.getServices(),
          isEditing ? bookingService.getBooking(id) : Promise.resolve(null),
        ]);

        setServices(servicesResponse.data.services);

        if (bookingResponse) {
          const booking = bookingResponse.data.booking;

          setFormData({
            service_id: String(booking.service_id),
            customer_name: booking.customer_name,
            customer_email: booking.customer_email,
            booking_date: booking.booking_date,
            time_slot: booking.time_slot,
            notes: booking.notes || '',
          });
        }
      } catch {
        toast.error(isEditing ? 'Failed to load booking' : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    }

    fetchFormData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.time_slot) {
      toast.error('Please choose a time slot');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        await bookingService.updateBooking(id, formData);
        toast.success('Booking updated successfully.');
      } else {
        await bookingService.createBooking(formData);
        toast.success('Booking created successfully! Awaiting admin approval.');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-teal-700">Customer Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          {isEditing ? 'Edit Booking' : 'Create Booking'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
        <div>
          <label className={labelClass}>Service *</label>
          <select
            name="service_id"
            className={inputClass}
            value={formData.service_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.base_price} ({service.duration_minutes}min)
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Your Name *</label>
          <input
            type="text"
            name="customer_name"
            className={inputClass}
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            name="customer_email"
            className={inputClass}
            value={formData.customer_email}
            onChange={handleChange}
            required
          />
        </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Booking Date *</label>
          <input
            type="date"
            name="booking_date"
            className={inputClass}
            value={formData.booking_date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <p className={labelClass}>Time Slot *</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {TIME_SLOTS.map((slot) => {
              const selected = formData.time_slot === slot.value;

              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, time_slot: slot.value }))}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-teal-500 bg-teal-50 shadow-sm ring-4 ring-teal-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-950">{slot.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{slot.range}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div>

        <div>
          <label className={labelClass}>Special Requests (Optional)</label>
          <textarea
            name="notes"
            className={inputClass}
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requests or notes..."
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={submitting}
            className={primaryButtonClass}
          >
            {submitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Booking')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={secondaryButtonClass}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
