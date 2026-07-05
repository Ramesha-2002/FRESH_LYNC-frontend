import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate    = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]       = useState('Customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Map UI role labels to backend enum values
      const roleMap = { Customer: 'buyer', Supplier: 'supplier' };
      const user = await register({ name: fullName, email, password, role: roleMap[role] || 'buyer' });
      navigate('/setup/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-layout" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000)' }}>
      <SEO title="Request Access" />
      
      {/* Left Side - Copy */}
      <div className="auth-left-content">
        <Link to="/" style={{ display: 'inline-block' }}>
          <img src="/footerlogo.png" alt="FreshLync logo" className="auth-logo" style={{ marginBottom: '-0.5rem', width: '340px', height: 'auto', cursor: 'pointer' }} />
        </Link>
        
        <div className="auth-left-text-group">
          <h1 className="auth-huge-title">BEYOND<br/><span>DISTRIBUTION</span></h1>
          <p className="auth-sub-desc">
            Connect with a transparent, highly efficient network of farmers, suppliers, logistics providers, and fresh produce buyers.
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

        <form onSubmit={handleRegister}>
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

          {/* Full Name field */}
          <div className="auth-input-group">
            <label className="auth-input-label-white">Full Name / Business Name</label>
            <input 
              type="text" 
              className="auth-input-field-white" 
              placeholder="Enter your name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
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
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#F87171', padding: '0.85rem 1.1rem', borderRadius: 10, fontSize: '0.875rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          {/* Neon Sign Up Button */}
          <button type="submit" className="auth-btn-neon" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign up'}
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
          <button type="button" className="auth-social-btn">
            <svg className="auth-social-icon" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.465 0-6.277-2.812-6.277-6.277s2.812-6.277 6.277-6.277c1.5 0 2.875.525 3.96 1.437l3.117-3.118C18.995 1.95 15.827 1 12.24 1 6.033 1 12.24 6.033 1 12.24s5.033 11.24 11.24 11.24c5.898 0 10.747-4.256 11.24-10.285h-11.24z"/>
            </svg>
            Google
          </button>
          <button type="button" className="auth-social-btn">
            <svg className="auth-social-icon" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.98.08 2.16-.52 2.82-1.33z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Footer Link */}
        <div className="auth-footer-prompt-white">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
