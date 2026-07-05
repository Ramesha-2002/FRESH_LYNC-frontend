import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO';

export default function VerifyEmail() {
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    navigate('/setup/profile');
  };

  return (
    <div className="split-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      <SEO title="Verify Email" />
      {/* Left Side - Banner */}
      <div className="split-left" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=2000)' }}>
        <div className="split-left-content">
          <h1>Precision in every delivery.</h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '500px', lineHeight: 1.6 }}>
            Ensuring the freshest fish, meat, and vegetables reach your market through our rigorously optimized logistics network.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="split-right">
        <div style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
          <div style={{ marginBottom: '3rem' }}>
            <img src="/newlogo.png" alt="Freshlync logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
          </div>

          <div style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verify Your Email</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              We've sent a 6-digit verification code to your email. Please enter it below to activate your account.
            </p>

            <form onSubmit={handleVerify}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      width: '0', /* allows flex to size equally */
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      outline: 'none'
                    }}
                  />
                ))}
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>
                Verify & Continue
              </button>
            </form>

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Didn't receive a code? <a href="#" style={{ color: 'var(--color-primary)' }}>Resend Email</a>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={() => navigate('/login')} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 auto' }}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
