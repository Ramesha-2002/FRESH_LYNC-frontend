import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, TrendingUp, Calendar, RefreshCw, Landmark } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { analyticsService } from '../../services/analyticsService';
import { useNotification } from '../../context/NotificationContext';

export default function Earnings() {
  const { showToast } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getEarnings();
      setData(res);
    } catch {
      showToast('Failed to load earnings data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading financial overview..." />;

  const { revenueSummary, payouts, breakdown } = data || {};

  const cardStyle = {
    background: 'white',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '130px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const getPayoutStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'Pending':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'Available':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <div>
      <SEO title="Earnings & Payouts" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Earnings & Payouts</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Track your revenue, payouts, and financial transactions.</p>
        </div>
        <button className="btn-secondary" onClick={loadEarnings} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Revenue Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={cardStyle} className="spotlight-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Gross Earned</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#16A34A" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              £{Number(revenueSummary?.totalEarned || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Lifetime Gross Earnings</span>
          </div>
        </div>

        <div style={cardStyle} className="spotlight-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Available for Payout</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#2563EB" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              £{Number(revenueSummary?.availablePayout || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>Ready to withdraw</span>
          </div>
        </div>

        <div style={cardStyle} className="spotlight-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Pending Clearance</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={18} color="#D97706" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              £{Number(revenueSummary?.pendingPayout || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>Awaiting clearance</span>
          </div>
        </div>

        <div style={cardStyle} className="spotlight-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Completed Payouts</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={18} color="#9333EA" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              £{Number(revenueSummary?.completedPayout || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#9333EA', fontWeight: 600 }}>Transferred to bank</span>
          </div>
        </div>
      </div>

      {/* Grid: Order Breakdown + Payout History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left: Transaction Breakdown */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order Earnings Breakdown</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Detailed breakdown of recent orders and platform commission fees.</p>
          </div>
          {breakdown?.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No transactions recorded.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ background: 'var(--color-background)' }}>
                <tr>
                  {['Order ID', 'Date', 'Gross', 'Fee (10%)', 'Net Earned', 'Status'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 700, fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown?.map((item, i) => {
                  const sc = getPayoutStatusStyle(item.status);
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>{item.orderId}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{item.date}</td>
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500 }}>£{item.amount.toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#EF4444' }}>-£{item.fee.toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: '#16A34A' }}>£{item.net.toFixed(2)}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ background: sc.bg, color: sc.text, padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Payout History */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Payout History</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Recent transfers to your verified bank account.</p>
          </div>
          {payouts?.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No payouts completed yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {payouts?.map((payout, i) => {
                const sc = getPayoutStatusStyle(payout.status);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: i > 0 ? '1px solid var(--color-border)' : 'none', hover: { background: '#f8fafc' } }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>{payout.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{payout.date} · {payout.method}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>£{payout.amount.toFixed(2)}</div>
                      <span style={{ background: sc.bg, color: sc.text, padding: '0.15rem 0.45rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, marginTop: '0.25rem', display: 'inline-block' }}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
