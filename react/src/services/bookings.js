import api from './api';

export const bookingService = {
  createBooking: (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  getUserBookings: () => {
    return api.get('/bookings');
  },

  getBooking: (id) => {
    return api.get(`/bookings/${id}`);
  },

  updateBooking: (id, data) => {
    return api.patch(`/bookings/${id}`, data);
  },

  deleteBooking: (id) => {
    return api.delete(`/bookings/${id}`);
  },

  getAdminBookings: (status = 'pending') => {
    return api.get('/admin/bookings', { params: { status } });
  },

  approveBooking: (id) => {
    return api.patch(`/admin/bookings/${id}/approve`);
  },

  confirmBooking: (id) => {
    return api.patch(`/admin/bookings/${id}/confirm`);
  },

  markBooked: (id) => {
    return api.patch(`/admin/bookings/${id}/book`);
  },

  rejectBooking: (id) => {
    return api.patch(`/admin/bookings/${id}/reject`);
  },

  getAdminStats: () => {
    return api.get('/admin/stats');
  },
};
