/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const loading = false;

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.errors?.email?.[0]
          || error.response?.data?.message
          || 'Login failed',
        { cause: error }
      );
    }
  };

  const register = async (name, email, password, passwordConfirmation) => {
    try {
      const response = await authService.register(name, email, password, passwordConfirmation);
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message
          || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
          || 'Registration failed',
        { cause: error }
      );
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!token,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
