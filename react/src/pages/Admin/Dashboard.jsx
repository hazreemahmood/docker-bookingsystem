import { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookings';
import { BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const panelClass = 'rounded-2xl border border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const response = await bookingService.getAdminStats();
      setStats(response.data.stats);
    } catch {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.total_bookings,
      icon: BarChart3,
      color: 'bg-sky-50 text-sky-700 ring-sky-100',
    },
    {
      title: 'Pending Approval',
      value: stats.pending_bookings,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700 ring-amber-100',
    },
    {
      title: 'Confirmed',
      value: stats.confirmed_bookings,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    },
    {
      title: 'Booked',
      value: stats.booked_bookings,
      icon: CheckCircle,
      color: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    },
    {
      title: 'Rejected',
      value: stats.rejected_bookings,
      icon: XCircle,
      color: 'bg-rose-50 text-rose-700 ring-rose-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-teal-700">Admin Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${panelClass} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-xl p-3 ring-1`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${panelClass} p-6`}>
        <p className="text-sm font-medium text-slate-500">Revenue</p>
        <p className="mt-2 text-4xl font-bold text-slate-950">
          ${stats.total_revenue?.toFixed(2) || '0.00'}
        </p>
      </div>
    </div>
  );
}
