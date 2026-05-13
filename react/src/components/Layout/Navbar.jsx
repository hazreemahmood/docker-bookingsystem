import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, CalendarPlus, Users, BarChart3, CalendarCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-xl font-bold text-slate-950 cursor-pointer" onClick={() => navigate('/')}>
            Booking System
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="text-sm text-slate-600">
              Welcome, <span className="font-semibold text-slate-900">{user?.name}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <BarChart3 size={18} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/admin/pending')}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Users size={18} />
                    Pending
                  </button>
                  <button
                    onClick={() => navigate('/admin/approved')}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <CalendarCheck size={18} />
                    Confirmed
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Home size={18} />
                    My Bookings
                  </button>
                  <button
                    onClick={() => navigate('/booking/create')}
                    className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <CalendarPlus size={18} />
                    New Booking
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
