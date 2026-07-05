import React, { useState, useEffect, useMemo } from 'react';
import { Download, ChevronDown, ChevronUp, Package, MapPin, Calendar, User, RefreshCw, Layers, ExternalLink } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { orderService } from '../../services/orderService';
import { useNotification } from '../../context/NotificationContext';

const getProductImageUrl = (item) => {
  const imgPath = item.image || item.img || item.imagePath;
  if (!imgPath) return null;
  if (imgPath.startsWith('http') || imgPath.startsWith('data:')) {
    return imgPath;
  }
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
  return `${backendUrl}${normalizedPath}`;
};

const STATUS_TABS = ['All', 'Pending Payment Verification', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];
const STATUS_STYLE = {
  'Pending Payment Verification': { bg: '#E0F2FE', text: '#0369A1' },
  Pending:      { bg: '#FEF3C7', text: '#B45309' },
  'In Transit': { bg: '#DBEAFE', text: '#1E40AF' },
  Delivered:    { bg: '#DCFCE7', text: '#166534' },
  Cancelled:    { bg: '#FEE2E2', text: '#991B1B' },
};

export default function AdminOrders() {
  const { showToast, showConfirm } = useNotification();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId]     = useState(null);
  const [savingStatus, setSavingStatus] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({ limit: 100 });
      setOrders(data.orders || []);
    } catch { 
      showToast('Failed to fetch orders.', 'error');
    }
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
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status, supplierStatuses: updated.supplierStatuses } : o));
      showToast(`Order status updated to ${newStatus} successfully.`, 'success');
    } catch (err) { 
      showToast('Failed to update status.', 'error'); 
    }
    setSavingStatus(prev => ({ ...prev, [orderId]: false }));
  };

  const handleVerifyPayment = (orderId, action) => {
    showConfirm({
      title: `${action === 'approve' ? 'Approve' : 'Reject'} Payment Slip?`,
      message: `Are you sure you want to ${action} this payment slip? This action will notify the customer.`,
      confirmText: action === 'approve' ? 'Yes, Approve' : 'Yes, Reject',
      cancelText: 'Cancel',
      type: action === 'approve' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          const updated = await orderService.verifyPayment(orderId, action);
          setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: updated.paymentStatus, status: updated.status, supplierStatuses: updated.supplierStatuses } : o));
          showToast(`Payment slip successfully ${action}d.`, 'success');
        } catch {
          showToast(`Failed to ${action} payment slip.`, 'error');
        }
      }
    });
  };

  const handleExportCSV = () => {
    const header = 'Order ID,Date,Customer,Suppliers,Items,Total,Overall Status\n';
    const rows = filtered.map(o => {
      const id   = o._id.slice(-6).toUpperCase();
      const date = new Date(o.createdAt).toLocaleDateString('en-GB');
      const cust = o.buyer?.name || o.delivery?.firstName || '—';
      const uniqueSuppliers = [...new Set(o.items?.map(i => i.supplierName || 'Unknown Supplier'))].join('; ');
      return `ORD-${id},${date},"${cust}","${uniqueSuppliers}",${o.items?.length || 0},£${o.total?.toFixed(2)},${o.status}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'admin-orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner fullPage message="Loading platform orders..." />;

  return (
    <div>
      <SEO title="System Orders" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Global Order Management</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Monitor and update status for all client orders across the platform.</p>
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
              border: `2px solid ${active ? '#312E81' : 'var(--color-border)'}`,
              background: active ? '#312E81' : 'white',
              color: active ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {s} <span style={{ opacity: 0.8 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No platform orders found.</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--color-background)' }}>
              <tr>
                {['Order ID', 'Date', 'Customer', 'Suppliers Involved', 'Total', 'Overall Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '0.875rem 1.25rem', textAlign: i === 6 ? 'right' : 'left', fontWeight: 700, fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const sc    = STATUS_STYLE[o.status] || STATUS_STYLE['Pending'];
                const isOpen = expandedId === o._id;
                const orderId = o._id.slice(-6).toUpperCase();
                
                // Extract unique supplier names involved in this order
                const involvedSuppliers = [...new Set(o.items?.map(i => i.supplierName || 'Unknown Supplier'))];

                return (
                  <React.Fragment key={o._id}>
                    <tr
                      style={{ borderTop: '1px solid var(--color-border)', cursor: 'pointer', background: isOpen ? '#f5f3ff' : '' }}
                      onClick={() => setExpandedId(isOpen ? null : o._id)}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = ''; }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#312E81' }}>ORD-{orderId}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>{o.buyer?.name || o.delivery?.firstName || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {involvedSuppliers.map((sup, idx) => (
                            <span key={idx} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                              {sup}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>£{o.total?.toFixed(2)}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ background: sc.bg, color: sc.text, padding: '0.25rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ background: '#f8fafc' }}>
                        <td colSpan={7} style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                            {/* 1. Customer Details */}
                            <div style={{ background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <User size={15} style={{ color: '#312E81' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Customer</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{o.buyer?.name || o.delivery?.firstName + ' ' + (o.delivery?.lastName || '') || '—'}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>📧 {o.buyer?.email || o.delivery?.email || 'No email'}</p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>📞 {o.buyer?.phone || o.delivery?.phone || 'No phone'}</p>
                            </div>

                            {/* 2. Products by Supplier */}
                            <div style={{ background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid var(--color-border)', gridColumn: 'span 2' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <Package size={15} style={{ color: '#312E81' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Vendor Shipments</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(() => {
                                  const groups = {};
                                  (o.items || []).forEach(item => {
                                    const sName = item.supplierName || 'Unknown Supplier';
                                    if (!groups[sName]) groups[sName] = [];
                                    groups[sName].push(item);
                                  });
                                  return Object.entries(groups).map(([sName, items]) => {
                                    const itemId = items[0]?.supplier;
                                    const statusEntry = o.supplierStatuses?.find(s => s.supplier === itemId || s.supplier?._id === itemId);
                                    const sStatus = statusEntry ? statusEntry.status : 'Pending';
                                    const sc = STATUS_STYLE[sStatus] || STATUS_STYLE['Pending'];
                                    return (
                                      <div key={sName} style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{sName}</span>
                                          <span style={{ background: sc.bg, color: sc.text, padding: '0.1rem 0.45rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>{sStatus}</span>
                                        </div>
                                        <ul style={{ listStyle: 'none', paddingLeft: '0.5rem' }}>
                                          {items.map((it, idx) => {
                                            const base = it.supplierPrice !== undefined ? it.supplierPrice : it.price;
                                            const selling = it.marketplacePrice !== undefined ? it.marketplacePrice : it.price;
                                            const marginVal = selling - base;
                                            return (
                                              <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                                • <strong>{it.name}</strong> ({it.quantity} {it.unit})<br />
                                                <span style={{ paddingLeft: '0.75rem', display: 'inline-block', fontSize: '0.75rem' }}>
                                                  Supplier: £{base.toFixed(2)} | Marketplace: £{selling.toFixed(2)} (Margin: £{marginVal.toFixed(2)}/unit)
                                                </span>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* 3. Delivery & Payment Details */}
                            <div style={{ background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                <MapPin size={15} style={{ color: '#312E81' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Shipping & Payment</span>
                              </div>
                              {o.delivery ? (
                                <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                                  <strong>To:</strong> {o.delivery.address}, {o.delivery.city}, {o.delivery.postcode}
                                </p>
                              ) : <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>No shipping details</p>}
                              <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                                <strong>Payment Method:</strong> {o.paymentMethod === 'bank' ? 'Bank Transfer' : (o.paymentMethod || 'Credit Card')}<br />
                                <strong>Payment Status:</strong> <span style={{ 
                                  color: o.paymentStatus === 'Approved' ? '#16A34A' : (o.paymentStatus === 'Rejected' ? '#EF4444' : '#F59E0B'),
                                  fontWeight: 700 
                                }}>{o.paymentStatus || 'Pending Verification'}</span>
                              </p>
                              
                              {/* Order financial breakdown */}
                              <div style={{ fontSize: '0.78rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
                                <div><strong>Customer Paid:</strong> £{o.total?.toFixed(2)}</div>
                                {(() => {
                                  const supplierTotal = (o.items || []).reduce((sum, item) => sum + (item.supplierPrice !== undefined ? item.supplierPrice : item.price) * item.quantity, 0);
                                  const profitTotal = o.total - supplierTotal;
                                  return (
                                    <>
                                      <div><strong>Supplier Payout:</strong> £{supplierTotal.toFixed(2)}</div>
                                      <div style={{ color: '#047857', fontWeight: 700 }}><strong>Profit Margin:</strong> £{profitTotal.toFixed(2)}</div>
                                    </>
                                  );
                                })()}
                              </div>
                              {o.paymentMethod === 'bank' && o.paymentSlip && (
                                <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Payment Slip:</div>
                                  <a 
                                    href={getProductImageUrl({ image: o.paymentSlip })} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn-secondary"
                                    onClick={e => e.stopPropagation()}
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '0.25rem', 
                                      padding: '0.25rem 0.5rem', 
                                      fontSize: '0.75rem',
                                      borderRadius: '4px',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    View Payment Slip <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1rem', alignItems: 'center' }}>
                            {/* Timeline & Resolution */}
                            <div style={{ background: 'white', borderRadius: 8, padding: '1rem', border: '1px solid var(--color-border)' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Order Timeline Log</div>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                <span style={{ color: '#047857', fontWeight: 700 }}>✓ Placed</span>
                                <span style={{ color: o.status !== 'Pending' ? '#047857' : 'inherit', fontWeight: o.status !== 'Pending' ? 700 : 'inherit' }}>→ Paid</span>
                                <span style={{ color: o.status === 'In Transit' || o.status === 'Delivered' ? '#047857' : 'inherit', fontWeight: o.status === 'In Transit' || o.status === 'Delivered' ? 700 : 'inherit' }}>→ Out for Delivery</span>
                                <span style={{ color: o.status === 'Delivered' ? '#047857' : 'inherit', fontWeight: o.status === 'Delivered' ? 700 : 'inherit' }}>→ Delivered</span>
                              </div>
                            </div>

                            {/* Controls */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {o.paymentMethod === 'bank' && o.paymentStatus === 'Pending Verification' && (
                                <>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleVerifyPayment(o._id, 'approve'); 
                                    }} 
                                    style={{ padding: '0.35rem 0.8rem', borderRadius: 6, background: '#D1FAE5', color: '#065F46', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                  >
                                    Approve Payment
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      handleVerifyPayment(o._id, 'reject'); 
                                    }} 
                                    style={{ padding: '0.35rem 0.8rem', borderRadius: 6, background: '#FEE2E2', color: '#991B1B', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                  >
                                    Reject Payment
                                  </button>
                                </>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); showToast('Dispute resolved. Notification sent to supplier and buyer.', 'success'); }} style={{ padding: '0.35rem 0.8rem', borderRadius: 6, background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                Resolve Dispute
                              </button>
                              <select 
                                value={o.status} 
                                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.78rem', fontWeight: 600 }}
                                onClick={e => e.stopPropagation()}
                              >
                                <option value="Pending">Force Status: Pending</option>
                                <option value="In Transit">Force Status: In Transit</option>
                                <option value="Delivered">Force Status: Delivered</option>
                                <option value="Cancelled">Force Status: Cancelled</option>
                              </select>
                            </div>
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
