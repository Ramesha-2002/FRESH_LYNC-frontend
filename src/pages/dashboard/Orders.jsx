import React, { useState, useEffect, useMemo } from 'react';
import { Download, ChevronDown, ChevronUp, Package, MapPin, Calendar, User, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { orderService } from '../../services/orderService';
import { useNotification } from '../../context/NotificationContext';

const STATUS_TABS = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];
const STATUS_STYLE = {
  Pending:      { bg: '#FEF3C7', text: '#B45309' },
  'In Transit': { bg: '#DBEAFE', text: '#1E40AF' },
  Delivered:    { bg: '#DCFCE7', text: '#166534' },
  Cancelled:    { bg: '#FEE2E2', text: '#991B1B' },
};

export default function Orders() {
  const { showToast } = useNotification();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId]     = useState(null);
  const [savingStatus, setSavingStatus] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({ limit: 50 });
      setOrders(data.orders || []);
    } catch { showToast('Failed to fetch orders.', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() =>
    statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter),
  [orders, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setSavingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status } : o));
      showToast('Order status updated.', 'success');
    } catch { showToast('Failed to update status.', 'error'); }
    setSavingStatus(prev => ({ ...prev, [orderId]: false }));
  };

  const handleExportCSV = () => {
    const header = 'Order ID,Date,Customer,Items,Total,Status\n';
    const rows = filtered.map(o => {
      const id   = o._id.slice(-6).toUpperCase();
      const date = new Date(o.createdAt).toLocaleDateString('en-GB');
      const cust = o.buyer?.name || o.delivery?.firstName || '—';
      return `ORD-${id},${date},"${cust}",${o.items?.length || 0},£${o.total?.toFixed(2)},${o.status}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner fullPage message="Loading orders..." />;

  return (
    <div>
      <SEO title="Order Management" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Order Management</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Track and manage incoming marketplace orders.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}><RefreshCw size={15} /> Refresh</button>
          <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16} /> Export CSV</button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map(s => {
          const count = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.45rem 1rem', borderRadius: 999, fontWeight: 600, fontSize: '0.82rem',
              border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: active ? 'var(--color-primary)' : 'white',
              color: active ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {s} <span style={{ opacity: 0.8 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found for this filter.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--color-background)' }}>
              <tr>
                {['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '0.875rem 1.25rem', textAlign: i === 6 ? 'right' : 'left', fontWeight: 700, fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const sc    = STATUS_STYLE[o.status] || STATUS_STYLE['Pending'];
                const isOpen = expandedId === o._id;
                const orderId = o._id.slice(-6).toUpperCase();
                return (
                  <React.Fragment key={o._id}>
                    <tr
                      style={{ borderTop: '1px solid var(--color-border)', cursor: 'pointer', background: isOpen ? '#f0fdf4' : '' }}
                      onClick={() => setExpandedId(isOpen ? null : o._id)}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = ''; }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>ORD-{orderId}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>{o.buyer?.name || o.delivery?.firstName || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>{o.items?.length || 0} items</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>£{o.total?.toFixed(2)}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ background: sc.bg, color: sc.text, padding: '0.25rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ background: '#f0fdf4' }}>
                        <td colSpan={7} style={{ padding: '0 1.25rem 1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingTop: '0.75rem' }}>
                            <div style={{ background: 'white', borderRadius: 10, padding: '1rem', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                <Package size={14} style={{ color: 'var(--color-primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Products</span>
                              </div>
                              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {(o.items || []).map((item, i) => (
                                  <li key={i} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                                    {item.name} (Qty: {item.quantity} {item.unit} @ £{Number(item.price).toFixed(2)} = £{(item.price * item.quantity).toFixed(2)})
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div style={{ background: 'white', borderRadius: 10, padding: '1rem', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Delivery</span>
                              </div>
                              {o.delivery ? (
                                <>
                                  <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    {o.delivery.address}, {o.delivery.city}, {o.delivery.postcode}
                                  </p>
                                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    <Calendar size={13} /> {new Date(o.createdAt).toLocaleDateString('en-GB')}
                                  </div>
                                </>
                              ) : <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No delivery info</p>}
                            </div>

                            <div style={{ background: 'white', borderRadius: 10, padding: '1rem', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                <User size={14} style={{ color: 'var(--color-primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Customer</span>
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{o.buyer?.name || o.delivery?.firstName || '—'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>ORD-{orderId} · {o.items?.length} items</div>
                              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>£{o.total?.toFixed(2)}</div>
                            </div>
                          </div>

                          {/* Update Status */}
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Update status:</span>
                            {['Pending', 'In Transit', 'Delivered'].map(s => (
                              <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(o._id, s); }} disabled={savingStatus[o._id] || o.status === s}
                                style={{ padding: '0.3rem 0.875rem', borderRadius: 999, border: `1px solid ${STATUS_STYLE[s].text}`, background: o.status === s ? STATUS_STYLE[s].bg : 'white', color: STATUS_STYLE[s].text, fontSize: '0.8rem', fontWeight: 600, cursor: o.status === s ? 'default' : 'pointer', opacity: savingStatus[o._id] ? 0.6 : 1 }}>
                                {savingStatus[o._id] ? '...' : s}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
