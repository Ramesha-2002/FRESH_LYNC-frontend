import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import SEO from '../../components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      <SEO title="Forgot Password — FreshLync" />

      {/* Left banner — same as Login */}
      <div
        className="split-left"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=2000)' }}
      >
        <div className="split-left-content">
          <div style={{ marginBottom: '4rem' }}>
            <img src="/newlogo.png" alt="FreshLync logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
          </div>
          <h1>Forgot Your<br /><span>Password?</span></h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '500px', lineHeight: 1.6 }}>
            No worries — it happens. Enter your email and we'll send you a secure reset link valid for 1 hour.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Secure</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>SHA-256 Encrypted Token</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>1 Hour</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Link Expiry for Safety</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="split-right">
        <div style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginBottom: '2rem', fontWeight: 500, padding: 0 }}
          >
            <ArrowLeft size={18} /> Back to Login
          </button>

          {!sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Mail size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reset Password</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Enter the email linked to your FreshLync account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ width: '100%', marginBottom: '1.5rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Remember your password?{' '}
                  <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(21,128,61,0.15)' }}>
                <CheckCircle size={36} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Check Your Email</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '340px', margin: '0 auto 2rem' }}>
                If <strong>{email}</strong> is registered with FreshLync, you'll receive a password reset link shortly. Check your spam folder too.
              </p>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#166534' }}>
                🔒 The reset link expires in <strong>1 hour</strong> and can only be used once.
              </div>
              <Link
                to="/login"
                className="btn-primary"
                style={{ display: 'inline-block', textDecoration: 'none', padding: '0.75rem 2rem' }}
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
