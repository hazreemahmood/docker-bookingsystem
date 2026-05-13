import api from './api';

export const authService = {
  register: (name, email, password, passwordConfirmation) => {
    return api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  },

  login: (email, password) => {
    return api.post('/auth/login', {
      email,
      password,
    });
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  getCurrentUser: () => {
    return api.get('/auth/me');
  },
};
