import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
const labelClass = 'text-sm font-medium text-slate-700';
const buttonClass = 'w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.passwordConfirmation
      );
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-700">Booking System</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Create account</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              className={inputClass}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              className={inputClass}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="password"
              className={inputClass}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input
              type="password"
              name="passwordConfirmation"
              className={inputClass}
              value={formData.passwordConfirmation}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={buttonClass}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
