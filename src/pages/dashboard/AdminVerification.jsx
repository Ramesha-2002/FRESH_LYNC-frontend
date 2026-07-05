import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert, RefreshCw, FileText, CheckCircle, XCircle, HelpCircle, Mail, Phone, MapPin, Building2, User, Calendar, ExternalLink, MessageSquare, AlertCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Requests', color: '#6B7280', bg: '#F3F4F6' },
  { value: 'pending', label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
  { value: 'approved', label: 'Approved', color: '#059669', bg: '#D1FAE5' },
  { value: 'rejected', label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
  { value: 'information_requested', label: 'Info Requested', color: '#0284C7', bg: '#E0F2FE' },
];

const STATUS_META = {
  unverified: { text: 'Unverified', color: '#6B7280', bg: '#F3F4F6', icon: HelpCircle },
  pending: { text: 'Pending Verification', color: '#D97706', bg: '#FEF3C7', icon: AlertCircle },
  approved: { text: 'Approved', color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  rejected: { text: 'Rejected', color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
  information_requested: { text: 'Info Requested', color: '#0284C7', bg: '#E0F2FE', icon: HelpCircle },
  expired: { text: 'Expired', color: '#6B7280', bg: '#F3F4F6', icon: HelpCircle },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.unverified;
  const Icon = meta.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      background: meta.bg, color: meta.color,
      padding: '0.25rem 0.65rem', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      <Icon size={12} /> {meta.text}
    </span>
  );
}

export default function AdminVerification() {
  const { showToast } = useNotification();
  const [searchParams] = useSearchParams();
  const supplierIdParam = searchParams.get('supplierId');
  const [suppliers, setSuppliers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Action state
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get all suppliers from backend
      const data = await adminService.getUsers({ role: 'supplier', limit: 100 });
      const suppliersList = data.users || [];
      setSuppliers(suppliersList);

      // Get global audit trail logs
      const logs = await adminService.getVerificationLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve verification data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (supplierIdParam && suppliers.length > 0) {
      const found = suppliers.find(s => s._id === supplierIdParam);
      if (found) {
        setSelectedSupplier(found);
      }
    }
  }, [supplierIdParam, suppliers]);

  const handleAction = async (status) => {
    if (!selectedSupplier) return;
    if (status !== 'approved' && !reviewNotes.trim()) {
      showToast('Please enter review notes/reason before performing this action.', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminService.verifySupplier(selectedSupplier._id, {
        status,
        notes: reviewNotes
      });

      showToast(`Verification status updated to ${status.replace('_', ' ')} successfully.`, 'success');
      setReviewNotes('');
      
      // Update local state list
      setSuppliers(prev => prev.map(s => s._id === selectedSupplier._id ? response : s));
      setSelectedSupplier(response);

      // Reload logs
      const logs = await adminService.getVerificationLogs();
      setAuditLogs(logs);
    } catch (err) {
      showToast('Failed to execute verification action.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getBackendUrl = (url) => {
    if (!url) return '';
    // If already an absolute URL (Cloudinary, http, https), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : `${window.location.protocol}//${window.location.hostname}:5000`;
    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${backendUrl}${normalized}`;
  };

  // Filter suppliers list
  const filteredSuppliers = suppliers.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
                        s.company?.toLowerCase().includes(search.toLowerCase()) ||
                        s.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = filter === 'all' || s.verificationStatus === filter;
    
    return matchSearch && matchStatus;
  });

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ position: 'relative', fontFamily: 'var(--font-sans)' }}>
      <SEO title="Business Verification Hub" />

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedSupplier ? '1.1fr 0.9fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Requests List */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldAlert size={24} style={{ color: '#D97706' }} /> Business Verification Hub
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Review, approve, or reject supplier business details and corporate compliance documents.
              </p>
            </div>
            <button
              onClick={fetchData}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); }}
                style={{
                  padding: '0.45rem 1.1rem', borderRadius: 999, fontWeight: 600, fontSize: '0.82rem',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  background: filter === f.value ? f.color : 'white',
                  color: filter === f.value ? 'white' : f.color,
                  border: `2px solid ${f.color}`,
                  boxShadow: filter === f.value ? `0 2px 8px ${f.color}44` : 'none',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 480 }}>
            <input
              type="text"
              placeholder="Search supplier, company, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem 1rem 0.7rem 1rem',
                borderRadius: 10, border: '1px solid var(--color-border)',
                outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box',
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            />
          </div>

          {/* Requests Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Supplier / Company</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tax ID / Type</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Documents</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>
                      <LoadingSpinner message="Loading requests..." />
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No verification requests found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s, idx) => (
                    <tr
                      key={s._id}
                      onClick={() => setSelectedSupplier(s)}
                      style={{
                        borderBottom: idx < filteredSuppliers.length - 1 ? '1px solid var(--color-border)' : 'none',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                        background: selectedSupplier?._id === s._id ? '#FFFBEB' : 'transparent',
                      }}
                      onMouseEnter={e => { if (selectedSupplier?._id !== s._id) e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { if (selectedSupplier?._id !== s._id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.company || s.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{s.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <StatusBadge status={s.verificationStatus} />
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)' }}>
                        <div>{s.verificationDetails?.taxId || '—'}</div>
                        <div style={{ fontSize: '0.75rem' }}>{s.verificationDetails?.businessType}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-main)', fontWeight: 600 }}>
                        {s.verificationDetails?.documents?.length || 0} files
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedSupplier(s)}
                          style={{ padding: '0.4rem 0.875rem', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.78rem', fontWeight: 600, background: 'white', cursor: 'pointer' }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Detailed Profile Inspector Overlay Card */}
        {selectedSupplier && (
          <div className="card animate-fade-in" style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.875rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Verification Request Inspector</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Supplier ID: {selectedSupplier._id}</span>
              </div>
              <button 
                onClick={() => { setSelectedSupplier(null); setReviewNotes(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}
              >
                ×
              </button>
            </div>

            {/* Profile Overview Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
              }}>
                {(selectedSupplier.company || selectedSupplier.name)?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedSupplier.company || selectedSupplier.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{selectedSupplier.email}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <StatusBadge status={selectedSupplier.verificationStatus} />
                </div>
              </div>
            </div>

            {/* Business details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#F8FAFC', borderRadius: 8, padding: '1rem', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
              <h5 style={{ fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>Business Profile</h5>
              
              <div><strong>Registration No:</strong> {selectedSupplier.verificationDetails?.businessRegistrationNumber || '—'}</div>
              <div><strong>Entity Type:</strong> {selectedSupplier.verificationDetails?.businessType || '—'}</div>
              <div><strong>Tax ID:</strong> {selectedSupplier.verificationDetails?.taxId || '—'}</div>
              <div><strong>Phone:</strong> {selectedSupplier.verificationDetails?.businessPhone || selectedSupplier.phone || '—'}</div>
              <div><strong>Email:</strong> {selectedSupplier.verificationDetails?.businessEmail || selectedSupplier.email || '—'}</div>
              <div style={{ display: 'flex', gap: '0.25rem' }}><MapPin size={14} style={{ flexShrink: 0 }} /> <span><strong>Address:</strong> {selectedSupplier.verificationDetails?.businessAddress || selectedSupplier.address || '—'}</span></div>
            </div>

            {/* Representative Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <h5 style={{ fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', margin: '0 0 0.15rem' }}>Primary Representative</h5>
              <div><strong>Name:</strong> {selectedSupplier.verificationDetails?.contactName || selectedSupplier.name}</div>
              <div><strong>Job Title:</strong> {selectedSupplier.verificationDetails?.contactJobTitle || '—'}</div>
              <div><strong>Email:</strong> {selectedSupplier.verificationDetails?.contactEmail || '—'}</div>
              <div><strong>Phone:</strong> {selectedSupplier.verificationDetails?.contactPhone || '—'}</div>
            </div>

            {/* Uploaded Documents */}
            <div>
              <h5 style={{ fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', margin: '0 0 0.5rem' }}>Corporate Documentation</h5>
              {(!selectedSupplier.verificationDetails?.documents || selectedSupplier.verificationDetails.documents.length === 0) ? (
                <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>No documents uploaded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedSupplier.verificationDetails.documents.map((doc, idx) => {
                    const rawUrl = getBackendUrl(doc.url);
                    const isPdf = doc.name?.toLowerCase().endsWith('.pdf') || rawUrl?.toLowerCase().includes('.pdf');
                    // PDFs: open via Google Docs Viewer so they render in-browser instead of downloading
                    const viewUrl = isPdf
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=false`
                      : rawUrl;
                    return (
                      <a
                        key={idx}
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: '0.8rem', textDecoration: 'none',
                          color: 'var(--color-text-main)', border: '1px solid var(--color-border)',
                          background: '#FAF5FF', cursor: 'pointer', transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F3E8FF'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FAF5FF'}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <FileText size={15} color="#8B5CF6" /> {doc.name}
                          {isPdf && <span style={{ fontSize: '0.68rem', background: '#EDE9FE', color: '#7C3AED', borderRadius: 4, padding: '0.1rem 0.4rem', fontWeight: 700 }}>PDF</span>}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8B5CF6', fontSize: '0.72rem', fontWeight: 700 }}>
                          View <ExternalLink size={12} />
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* History logs for this user */}
            <div>
              <h5 style={{ fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', margin: '0 0 0.5rem' }}>Review Timeline</h5>
              {(!selectedSupplier.verificationHistory || selectedSupplier.verificationHistory.length === 0) ? (
                <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>No timeline logs recorded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 150, overflowY: 'auto' }}>
                  {selectedSupplier.verificationHistory.map((h, idx) => (
                    <div key={idx} style={{ borderLeft: '2px solid #E2E8F0', paddingLeft: '0.75rem', paddingBottom: '0.25rem', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                        <strong style={{ textTransform: 'capitalize', color: STATUS_META[h.status]?.color }}>{h.status.replace('_', ' ')}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatDate(h.updatedAt)}</span>
                      </div>
                      <div style={{ color: '#475569', lineHeight: 1.3 }}>{h.notes || 'No comments provided.'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>By: {h.updatedByName || 'Admin'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Control Box */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                Compliance Review Notes / Feedback *
              </label>
              <textarea
                className="input-field"
                placeholder="Describe your request, reasons for rejection, or general notes..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                rows={3}
                style={{ resize: 'none', fontSize: '0.82rem' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('approved')}
                  style={{
                    flex: 1, padding: '0.5rem', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('information_requested')}
                  style={{
                    flex: 1.2, padding: '0.5rem', background: '#0284C7', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Request Info
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction('rejected')}
                  style={{
                    flex: 1, padding: '0.5rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 700, transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Audit Trail Log */}
      <div className="card" style={{ marginTop: '2.5rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--color-primary)" /> Platform Verification Audit Trail Logs
        </h3>
        
        {auditLogs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
            No verification actions have been logged yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 700 }}>Supplier</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 700 }}>Action</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 700 }}>Review Notes / Comments</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 700 }}>Conducted By</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--color-text-muted)' }}>{formatDate(log.updatedAt)}</td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <strong>{log.userCompany}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{log.userEmail}</div>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{
                        background: STATUS_META[log.status]?.bg || '#F3F4F6',
                        color: STATUS_META[log.status]?.color || '#4B5563',
                        padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 700, fontSize: '0.7rem'
                      }}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem', maxWidth: 320, color: '#334155', wordBreak: 'break-word' }}>{log.notes || '—'}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--color-text-muted)' }}>{log.updatedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
