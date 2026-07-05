import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Download, ExternalLink, MapPin, ChevronDown, ChevronUp, Package, Calendar, RefreshCw, Thermometer, CheckCircle2 } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { orderService } from '../../services/orderService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

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

const STATUS_STYLE = {
  'Pending Payment Verification': { bg: '#E0F2FE', text: '#0369A1' },
  Pending:      { bg: '#FEF3C7', text: '#B45309' },
  'In Transit': { bg: '#DBEAFE', text: '#1E40AF' },
  Delivered:    { bg: '#DCFCE7', text: '#166534' },
  Cancelled:    { bg: '#FEE2E2', text: '#991B1B' },
};

const TRACKING_STEPS = [
  { label: 'Order Placed', desc: 'Supplier confirmed' },
  { label: 'Processing', desc: 'Packing at warehouse' },
  { label: 'Dispatched', desc: 'Carrier received' },
  { label: 'In Transit', desc: 'On route via cold chain' },
  { label: 'Delivered', desc: 'Signed at loading dock' }
];

export default function MarketplaceShipments() {
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isUploadingMap, setIsUploadingMap] = useState({});

  const handleReuploadSlip = async (orderId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.", "error");
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, JPEG, PNG, and PDF formats are accepted.", "error");
      return;
    }

    setIsUploadingMap(prev => ({ ...prev, [orderId]: true }));
    try {
      const uploadRes = await orderService.uploadPaymentSlip(file);
      const updatedOrder = await orderService.reuploadSlip(orderId, uploadRes.filePath);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentSlip: updatedOrder.paymentSlip, paymentStatus: updatedOrder.paymentStatus, status: updatedOrder.status } : o));
      showToast("Payment slip resubmitted successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to resubmit payment slip.", "error");
    } finally {
      setIsUploadingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({ limit: 50 });
      setOrders(data.orders || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleExport = () => {
    const header = 'Order ID,Date,Total,Status,ItemsCount\n';
    const rows = filtered.map(o => {
      const id = o._id.slice(-6).toUpperCase();
      const date = new Date(o.createdAt).toLocaleDateString('en-GB');
      return `ORD-${id},${date},£${o.total?.toFixed(2)},${o.status},${o.items?.length || 0}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-shipments.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending Payment Verification':
        return 0;
      case 'Pending':
        return 1; // Order Placed, Processing in progress
      case 'Processing':
        return 2;
      case 'Dispatched':
        return 3;
      case 'In Transit':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 1;
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading shipments..." />;

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', fontFamily: 'var(--font-sans)' }}>
      <SEO title="My Shipments" />
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Shipments</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Track and monitor active cold chain shipments inbound from your suppliers.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'].map(s => {
          const count = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.5rem 1rem', borderRadius: '999px', fontWeight: 600, border: active ? 'none' : '1px solid var(--color-border)',
              background: active ? 'var(--color-primary)' : 'white',
              color: active ? 'white' : 'var(--color-text-main)', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Table grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No shipments found for this filter.
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>ORDER ID</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>SUPPLIERS</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>TOTAL VALUE</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isOpen = expandedId === o._id;
                const orderId = o._id.slice(-6).toUpperCase();
                const sc = STATUS_STYLE[o.status] || STATUS_STYLE['Pending'];
                const suppliersInvolved = [...new Set(o.items?.map(item => user?.role === 'buyer' ? 'FreshLync' : (item.supplierName || 'Supplier')))];

                const currentStep = getStepIndex(o.status);

                return (
                  <React.Fragment key={o._id}>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', background: isOpen ? '#f0fdf4' : '' }} onClick={() => setExpandedId(isOpen ? null : o._id)}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>ORD-{orderId}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {suppliersInvolved.map((sup, i) => (
                            <span key={i} style={{ background: '#e2e8f0', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500 }}>
                              {sup}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>£{o.total?.toFixed(2)}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          background: sc.bg, 
                          color: sc.text, 
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ background: '#f8fafc' }}>
                        <td colSpan={6} style={{ padding: '1.5rem' }}>
                          
                          {/* Payment Slip Awaiting Approval Warning Banner */}
                          {o.status === 'Pending Payment Verification' && (
                            <div style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0369A1', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ fontWeight: 700 }}>Order Awaiting Payment Verification</div>
                              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                                Your order has been registered and is currently awaiting administrator review of your uploaded payment slip. Suppliers will begin processing your items once verified.
                              </p>
                              {o.paymentSlip && (
                                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                  <span>Uploaded Document:</span>
                                  <a href={getProductImageUrl({ image: o.paymentSlip })} target="_blank" rel="noreferrer" style={{ color: '#0284C7', fontWeight: 600 }}>
                                    View Receipt
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Rejected Slip Re-upload Warning Banner */}
                          {o.paymentMethod === 'bank' && o.paymentStatus === 'Rejected' && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>⚠️ Payment Slip Rejected</div>
                              <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                Your uploaded payment slip was rejected by the administrator. Please upload a valid payment receipt to confirm your order.
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <label className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                                  {isUploadingMap[o._id] ? 'Uploading...' : 'Upload New Payment Slip'}
                                  <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,.pdf" 
                                    onChange={(e) => handleReuploadSlip(o._id, e)} 
                                    style={{ display: 'none' }} 
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Visual Step Timeline */}
                          {o.status !== 'Cancelled' ? (
                            <div style={{ background: 'white', borderRadius: 10, padding: '1.5rem', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                                Shipment Tracking Timeline
                              </h4>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
                                {/* Horizontal timeline line */}
                                <div style={{ position: 'absolute', top: '15px', left: '2rem', right: '2rem', height: '3px', background: '#E2E8F0', zIndex: 1 }}>
                                  <div style={{ width: `${currentStep > 0 ? ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100 : 0}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.4s ease' }}></div>
                                </div>

                                {TRACKING_STEPS.map((step, index) => {
                                  const stepNum = index + 1;
                                  const isCompleted = stepNum <= currentStep;
                                  const isCurrent = stepNum === currentStep;

                                  return (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1, textAlign: 'center' }}>
                                      <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: isCompleted ? 'var(--color-primary)' : 'white',
                                        border: `2px solid ${isCompleted ? 'var(--color-primary)' : '#CBD5E1'}`,
                                        color: isCompleted ? 'white' : '#64748B',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem',
                                        boxShadow: isCurrent ? '0 0 0 4px rgba(4,120,87,0.15)' : 'none',
                                        transition: 'all 0.3s ease'
                                      }}>
                                        {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                                      </div>
                                      <div style={{ fontSize: '0.82rem', fontWeight: isCompleted ? 700 : 500, color: isCompleted ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                                        {step.label}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                                        {step.desc}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                              ⚠️ This shipment was cancelled. Please contact customer support for resolution or payout disputes.
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                            {/* Products grouped by Supplier */}
                            <div style={{ background: 'white', borderRadius: 10, padding: '1.25rem', border: '1px solid var(--color-border)' }}>
                              <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Package size={15} style={{ color: 'var(--color-primary)' }} /> Items & Supplier Shipment Statuses
                              </h4>

                              {(o.supplierStatuses || []).map((supStatus, i) => {
                                const supItems = o.items?.filter(item => item.supplier === supStatus.supplier) || [];
                                const supplierName = user?.role === 'buyer' ? 'FreshLync' : (supItems[0]?.supplierName || 'Supplier');
                                const ssc = STATUS_STYLE[supStatus.status] || STATUS_STYLE['Pending'];

                                return (
                                  <div key={i} style={{ marginBottom: i < o.supplierStatuses.length - 1 ? '1.25rem' : 0, borderBottom: i < o.supplierStatuses.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < o.supplierStatuses.length - 1 ? '1rem' : 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{supplierName}</span>
                                      <span style={{ background: ssc.bg, color: ssc.text, padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                                        {supStatus.status}
                                      </span>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                      {supItems.map((item, idx) => (
                                        <li key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                          <span>{item.name} ×{item.quantity} {item.unit}</span>
                                          <span style={{ fontWeight: 600 }}>£{(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}

                              {(!o.supplierStatuses || o.supplierStatuses.length === 0) && (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {o.items?.map((item, idx) => (
                                    <li key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                      <span>{item.name} ×{item.quantity} {item.unit}</span>
                                      <span style={{ fontWeight: 600 }}>£{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Delivery & Cold Chain Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              
                              {/* Address */}
                              <div style={{ background: 'white', borderRadius: 10, padding: '1.25rem', border: '1px solid var(--color-border)' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <MapPin size={15} style={{ color: 'var(--color-primary)' }} /> Delivery Details
                                </h4>
                                {o.delivery ? (
                                  <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                                      {o.delivery.firstName} {o.delivery.lastName}
                                    </div>
                                    <div>{o.delivery.address}</div>
                                    <div>{o.delivery.city}, {o.delivery.postcode}</div>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                      <Calendar size={13} /> Placed: {new Date(o.createdAt).toLocaleDateString('en-GB')}
                                    </div>
                                  </div>
                                ) : (
                                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>No delivery details available.</p>
                                )}
                              </div>

                              {/* Cold Chain widget */}
                              <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: 10, padding: '1.25rem', border: '1px solid #bfdbfe' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    ❄️ Cold Chain Monitor
                                  </span>
                                  <span style={{ background: '#3b82f6', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>LIVE FEED</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
                                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e3a8a' }}>3.2°C</span>
                                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Stable (Threshold &lt; 4°C)</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#1e40af', opacity: 0.8 }}>
                                  Sensors report active cooling refrigeration operating normally. Last ping: Just now.
                                </div>
                              </div>

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
    </main>
  );
}
