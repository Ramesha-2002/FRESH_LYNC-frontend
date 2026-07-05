import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { analyticsService } from '../../services/analyticsService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: badgeColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} style={{ color: badgeColor }} />
        </div>
        <span style={{ background: badgeColor + '22', color: badgeColor, padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, height: 'max-content' }}>{badge}</span>
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');


  useEffect(() => {
    const load = async () => {
      try {
        const [summary, ordersData] = await Promise.all([
          analyticsService.getSummary(),
          orderService.getOrders({ limit: 5 }),
        ]);
        setStats(summary);
        setOrders(ordersData.orders || []);
      } catch (e) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading dashboard..." />;
  if (error)   return <div style={{ padding: '2rem', color: '#DC2626' }}>{error}</div>;

  const STATUS_STYLE = {
    Pending:      { bg: '#FEF3C7', text: '#B45309' },
    'In Transit': { bg: '#DBEAFE', text: '#1E40AF' },
    Delivered:    { bg: '#DCFCE7', text: '#166534' },
    Cancelled:    { bg: '#FEE2E2', text: '#991B1B' },
  };

  const latestLog = user?.verificationHistory && user.verificationHistory.length > 0
    ? user.verificationHistory[user.verificationHistory.length - 1]
    : null;

  const notes = latestLog ? latestLog.notes : '';

  return (
    <div>
      <SEO title="Dashboard Overview" />

      {user?.role === 'supplier' && user?.verificationStatus !== 'approved' && (
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          background: user.verificationStatus === 'rejected' ? '#FEF2F2' : user.verificationStatus === 'information_requested' ? '#EFF6FF' : '#FFFBEB',
          borderColor: user.verificationStatus === 'rejected' ? '#FEE2E2' : user.verificationStatus === 'information_requested' ? '#DBEAFE' : '#FEF3C7',
          color: user.verificationStatus === 'rejected' ? '#991B1B' : user.verificationStatus === 'information_requested' ? '#1E40AF' : '#B45309',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                {user.verificationStatus === 'rejected' ? 'Business Verification Rejected' : user.verificationStatus === 'information_requested' ? 'Additional Information Requested' : 'Business Verification Pending'}
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                {user.verificationStatus === 'rejected' ? (
                  <>Your registration was rejected. Reason: <strong>{notes || 'Please review your uploaded documents.'}</strong>. You must resubmit correct documents.</>
                ) : user.verificationStatus === 'information_requested' ? (
                  <>The compliance team requested updates: <strong>{notes || 'Please upload the missing details.'}</strong></>
                ) : (
                  <>Your profile is pending admin approval. You cannot publish products or receive orders until approved.</>
                )}
              </div>
            </div>
          </div>
          {(user.verificationStatus === 'rejected' || user.verificationStatus === 'information_requested') && (
            <button 
              onClick={() => navigate('/setup/verification')} 
              style={{
                background: user.verificationStatus === 'rejected' ? '#EF4444' : '#3B82F6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              Update Verification Details
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon={TrendingUp}   label="Total Revenue"    value={`£${Number(stats?.totalRevenue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}  badge="+Sales"    badgeColor="#16A34A" />
        <StatCard icon={ShoppingBag}  label="Total Orders"     value={stats?.totalOrders ?? '—'}    badge={`${(stats?.totalOrders || 0) - (stats?.deliveredOrders || 0)} Pending`} badgeColor="#64748B" />
        <StatCard icon={Package}      label="Low Stock Items"  value={stats?.lowStockCount ?? '—'}  badge="Alert"     badgeColor="#DC2626" />
        <StatCard icon={ShieldCheck}  label="Fulfillment Rate" value={`${stats?.fulfillmentRate ?? 0}%`} badge="Top Tier" badgeColor="#16A34A" />
      </div>


      {/* Recent Orders */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>Recent Orders</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Latest 5 incoming orders</div>
          </div>
          <button className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/dashboard/orders')}>View All</button>
        </div>

        {orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--color-background)' }}>
              <tr>
                {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h, i) => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: i === 4 ? 'right' : 'left', fontWeight: 700, fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const sc = STATUS_STYLE[o.status] || STATUS_STYLE['Pending'];
                return (
                  <tr key={o._id} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>#{o._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>{o.buyer?.name || o.delivery?.firstName || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>£{o.total?.toFixed(2)}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ background: sc.bg, color: sc.text, padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
