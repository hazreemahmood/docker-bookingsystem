import api from './api';

export const serviceService = {
  getServices: () => {
    return api.get('/services');
  },

  getService: (id) => {
    return api.get(`/services/${id}`);
  },
};
