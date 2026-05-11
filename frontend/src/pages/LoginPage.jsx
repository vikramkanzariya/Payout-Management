import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/payouts';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === 'ops') setForm({ email: 'ops@demo.com', password: 'ops123' });
    else setForm({ email: 'finance@demo.com', password: 'fin123' });
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">₹</div>
          <h1 className="login-title">Payout Management</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Quick Fill Buttons */}
        <div className="demo-credentials">
          <p className="demo-label">Demo Accounts</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo btn-demo--ops"
              onClick={() => fillCredentials('ops')}
            >
              OPS User
            </button>
            <button
              type="button"
              className="btn-demo btn-demo--finance"
              onClick={() => fillCredentials('finance')}
            >
              Finance User
            </button>
          </div>
        </div>

        {/* Error */}
        <ErrorMessage message={error} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className="form-input form-input--with-icon"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input form-input--with-icon form-input--with-action"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <Spinner size="sm" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
