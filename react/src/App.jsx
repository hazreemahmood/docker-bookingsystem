import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import BookingForm from './pages/User/BookingForm';
import AdminDashboard from './pages/Admin/Dashboard';
import PendingBookings from './pages/Admin/PendingBookings';
import ApprovedBookings from './pages/Admin/ApprovedBookings';

function ProtectedRoute({ children, admin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (admin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/create"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id/edit"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute admin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute admin={true}>
              <PendingBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approved"
          element={
            <ProtectedRoute admin={true}>
              <ApprovedBookings />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
