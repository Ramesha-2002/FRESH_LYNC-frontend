import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import SEO from '../../components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const token             = searchParams.get('token');

  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState('');

  // If no token in URL, show an error immediately
  const tokenMissing = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      setSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)  s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'][strength];

  return (
    <div className="split-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      <SEO title="Reset Password — FreshLync" />

      {/* Left banner */}
      <div
        className="split-left"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000)' }}
      >
        <div className="split-left-content">
          <div style={{ marginBottom: '4rem' }}>
            <img src="/newlogo.png" alt="FreshLync logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
          </div>
          <h1>Create a New<br /><span>Secure Password</span></h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '500px', lineHeight: 1.6 }}>
            Choose a strong password to keep your FreshLync account safe and secure.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>bcrypt</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Password Encryption</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Single Use</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Token Invalidated After Reset</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="split-right">
        <div style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginBottom: '2rem', fontWeight: 500, padding: 0 }}
          >
            <ArrowLeft size={18} /> Back to Login
          </button>

          {/* No token in URL */}
          {tokenMissing && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <AlertTriangle size={30} style={{ color: '#dc2626' }} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Invalid Reset Link</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                This reset link is missing or invalid. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.75rem 2rem' }}>
                Request New Link
              </Link>
            </div>
          )}

          {/* Success state */}
          {!tokenMissing && success && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(21,128,61,0.15)' }}>
                <CheckCircle size={36} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Password Reset!</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Your password has been updated successfully. Redirecting you to login...
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting in 3 seconds...
              </div>
            </div>
          )}

          {/* Form */}
          {!tokenMissing && !success && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <KeyRound size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>New Password</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Must be at least 6 characters</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* New password */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1, height: 4, borderRadius: 99,
                              background: i <= strength ? strengthColor : '#e2e8f0',
                              transition: 'background 0.3s',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: strengthColor, fontWeight: 600 }}>{strengthLabel}</div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="input-field"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ borderColor: confirmPassword && confirmPassword !== password ? '#ef4444' : undefined }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.35rem' }}>Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}{' '}
                    {error.toLowerCase().includes('expired') && (
                      <Link to="/forgot-password" style={{ color: '#991B1B', fontWeight: 600 }}>Request a new link →</Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ width: '100%', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
