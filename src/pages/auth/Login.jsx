import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [role, setRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const user = await loginWithGoogle(tokenResponse.access_token, role === 'Customer' ? 'buyer' : 'supplier');
        if (user.role === 'buyer') navigate('/marketplace');
        else if (user.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Google Sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Sign-in was unsuccessful.');
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'buyer') navigate('/marketplace');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-layout" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000)' }}>
      <SEO title="Login" />

      {/* Left Side - Copy */}
      <div className="auth-left-content">
        <Link to="/" style={{ display: 'inline-block' }}>
          <img src="/footerlogo.png" alt="FreshLync logo" className="auth-logo" style={{ marginBottom: '-0.5rem', width: '340px', height: 'auto', cursor: 'pointer' }} />
        </Link>

        <div className="auth-left-text-group">
          <h1 className="auth-huge-title">BEYOND<br /><span>DISTRIBUTION</span></h1>
          <p className="auth-sub-desc">
            Optimizing the journey from farm to table with real-time data, live logistics monitoring, and sustainable supply chain coordination.
          </p>
        </div>
      </div>

      {/* Right Side - Floating Glass Card */}
      <div className="auth-glass-card">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="auth-back-btn-glass"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <form onSubmit={handleLogin}>
          {/* Account Type selector */}
          <div className="auth-input-group">
            <label className="auth-input-label-white">Account Type</label>
            <div className="role-segment-control-glass">
              {['Customer', 'Supplier'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`role-segment-btn-glass ${role === r ? 'active' : 'inactive'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Email field */}
          <div className="auth-input-group">
            <label className="auth-input-label-white">Email</label>
            <input
              type="email"
              className="auth-input-field-white"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password field */}
          <div className="auth-input-group">
            <label className="auth-input-label-white">Password</label>
            <div className="auth-input-wrapper-white">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field-white"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle-dark"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.82rem' }}>Forgot password?</Link>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#F87171', padding: '0.85rem 1.1rem', borderRadius: 10, fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Neon Sign in Button */}
          <button type="submit" className="auth-btn-neon" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Or Divider */}
        <div className="auth-divider-container">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        {/* Social Buttons */}
        <div className="auth-social-row">
          <button type="button" className="auth-social-btn" onClick={() => handleGoogleLogin()}>
            <svg className="auth-social-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 10.2v3.8h5.3c-.2 1.4-1.7 4.1-5.3 4.1-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.6-2.5C16.6 3.6 14.5 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12S6.7 21.5 12 21.5c6 0 10-4.2 10-10.3 0-.7-.1-1.2-.2-1.7H12z" />
            </svg>
            Google
          </button>

          <button type="button" className="auth-social-btn">
            <svg className="auth-social-icon" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.98.08 2.16-.52 2.82-1.33z" />
            </svg>
            Apple
          </button>
        </div>

        {/* Footer Link */}
        <div className="auth-footer-prompt-white">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
