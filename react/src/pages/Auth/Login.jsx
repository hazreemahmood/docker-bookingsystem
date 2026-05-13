import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
const labelClass = 'text-sm font-medium text-slate-700';
const buttonClass = 'w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-700">Booking System</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Welcome back</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={buttonClass}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              Register here
            </button>
          </p>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo credentials</p>
          <p className="mt-2 text-sm text-slate-700">user@example.com / password</p>
          <p className="text-sm text-slate-700">admin@example.com / password</p>
        </div>
      </div>
    </div>
  );
}
