import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import SEO from '../../components/SEO';

function generateOrderId() {
  return 'FL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const orderId = React.useRef(generateOrderId()).current;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem' }}>
      <SEO title="Order Placed!" />
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        {/* Animated success circle */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
          border: '3px solid #16A34A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem',
          animation: 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
          <CheckCircle size={52} style={{ color: '#16A34A' }} />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#16A34A' }}>Order Placed!</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
          Thank you for your order. We'll confirm your order shortly and begin preparing your fresh produce.
        </p>

        {/* Order ID */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '0.75rem 1.5rem', margin: '1.5rem 0', fontFamily: 'monospace' }}>
          <Package size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>Order #{orderId}</span>
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', margin: '1.5rem 0 2rem', textAlign: 'left' }}>
          {[
            { label: 'Order Confirmed', detail: 'Now', done: true },
            { label: 'Supplier Notified', detail: 'Within 1 hour', done: true },
            { label: 'Packing & Dispatch', detail: 'Within 24 hours', done: false },
            { label: 'Delivery', detail: '1–3 business days', done: false },
          ].map(({ label, detail, done }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: i < 3 ? '1rem' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? '#16A34A' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done && <CheckCircle size={14} style={{ color: 'white' }} />}
                </div>
                {i < 3 && <div style={{ width: 2, flex: 1, background: done ? '#16A34A' : 'var(--color-border)', minHeight: 24, marginTop: 2 }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/marketplace')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={16} /> Back to Marketplace
          </button>
          <button className="btn-secondary" onClick={() => navigate('/marketplace/shipments')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Track Orders <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
