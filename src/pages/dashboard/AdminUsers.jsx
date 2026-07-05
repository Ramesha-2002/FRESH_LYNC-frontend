import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, CheckCircle, XCircle, RefreshCw,
  ShieldCheck, Truck, User, Crown, Filter, MoreVertical,
  ChevronLeft, ChevronRight, Mail, Building2, Calendar,
  BadgeCheck, Trash2, Award, ShoppingBag, ShieldAlert, Star
} from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';

const ROLES = [
  { value: '',         label: 'All Users',  color: '#6B7280', bg: '#F3F4F6' },
  { value: 'buyer',    label: 'Buyers',     color: '#1D4ED8', bg: '#DBEAFE' },
  { value: 'supplier', label: 'Suppliers',  color: '#047857', bg: '#D1FAE5' },
  { value: 'admin',    label: 'Admins',     color: '#6D28D9', bg: '#EDE9FE' },
];

const ROLE_META = {
  buyer:    { icon: User,        color: '#1D4ED8', bg: '#DBEAFE', label: 'Buyer'    },
  supplier: { icon: Truck,       color: '#047857', bg: '#D1FAE5', label: 'Supplier' },
  admin:    { icon: ShieldCheck, color: '#6D28D9', bg: '#EDE9FE', label: 'Admin'    },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.buyer;
  const Icon = meta.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      background: meta.bg, color: meta.color,
      padding: '0.25rem 0.65rem', borderRadius: 999,
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}

function VerifiedBadge({ verified, suspended }) {
  if (suspended) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: '#FEE2E2', color: '#991B1B',
        padding: '0.2rem 0.6rem', borderRadius: 999,
        fontSize: '0.72rem', fontWeight: 700,
      }}>
        <ShieldAlert size={11} /> Suspended
      </span>
    );
  }
  return verified ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: '#D1FAE5', color: '#065F46',
      padding: '0.2rem 0.6rem', borderRadius: 999,
      fontSize: '0.72rem', fontWeight: 700,
    }}>
      <CheckCircle size={11} /> Verified
    </span>
  ) : (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: '#FEF3C7', color: '#92400E',
      padding: '0.2rem 0.6rem', borderRadius: 999,
      fontSize: '0.72rem', fontWeight: 700,
    }}>
      <XCircle size={11} /> Unverified
    </span>
  );
}

function Avatar({ name, size = 38 }) {
  const colors = ['#6366F1','#8B5CF6','#EC4899','#14B8A6','#F59E0B','#10B981','#3B82F6','#EF4444'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      letterSpacing: '-0.5px',
    }}>
      {name?.slice(0, 2).toUpperCase() || 'NA'}
    </div>
  );
}

export default function AdminUsers() {
  const { showToast } = useNotification();
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [role, setRole]         = useState('');
  const [page, setPage]         = useState(1);
  const [verifying, setVerifying] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const LIMIT = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ role, search, page, limit: LIMIT });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }, [role, search, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [role, page]);

  const handleVerify = async (userId, userName) => {
    setVerifying(userId);
    try {
      await adminService.verifySupplier(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: true } : u));
      if (selectedUser?._id === userId) {
        setSelectedUser(prev => ({ ...prev, isVerified: true }));
      }
      showToast(`${userName} has been verified successfully.`, 'success');
    } catch {
      showToast('Failed to verify supplier.', 'error');
    }
    setVerifying(null);
  };

  const handleToggleSuspend = (userObj) => {
    const nextSuspended = !userObj.isSuspended;
    setUsers(prev => prev.map(u => u._id === userObj._id ? { ...u, isSuspended: nextSuspended } : u));
    if (selectedUser?._id === userObj._id) {
      setSelectedUser(prev => ({ ...prev, isSuspended: nextSuspended }));
    }
    showToast(`User ${userObj.name} has been ${nextSuspended ? 'Suspended' : 'Reactivated'} successfully.`, 'success');
  };

  const handleChangeStaffRole = (userId, newRole) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, staffRole: newRole } : u));
    if (selectedUser?._id === userId) {
      setSelectedUser(prev => ({ ...prev, staffRole: newRole }));
    }
    showToast(`Staff role updated to ${newRole} successfully.`, 'success');
  };

  const totalPages = Math.ceil(total / LIMIT);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <SEO title="User Management" />

      {/* Main Grid: list + profile drawer side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1.2fr 0.8fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Users List */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={22} style={{ color: '#6D28D9' }} /> User Operations Directory
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Manage registered buyers, suppliers, and toggle system administrative access roles.
              </p>
            </div>
            <button
              onClick={fetchUsers}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>

          {/* Stat Chips */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); setPage(1); }}
                style={{
                  padding: '0.45rem 1.1rem', borderRadius: 999, fontWeight: 600, fontSize: '0.82rem',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  background: role === r.value ? r.color : 'white',
                  color: role === r.value ? 'white' : r.color,
                  border: `2px solid ${r.color}`,
                  boxShadow: role === r.value ? `0 2px 8px ${r.color}44` : 'none',
                }}
              >
                {r.label} {role === r.value && total > 0 ? `(${total})` : ''}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: 480 }}>
            <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem 1rem 0.7rem 2.8rem',
                borderRadius: 10, border: '1px solid var(--color-border)',
                outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box',
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            />
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>User</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Joined</th>
                  <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center' }}>
                      <LoadingSpinner message="Loading users..." />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <Users size={40} style={{ marginBottom: '0.75rem', opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                      <div style={{ fontWeight: 600 }}>No users found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try adjusting your search or filter</div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        borderBottom: idx < users.length - 1 ? '1px solid var(--color-border)' : 'none',
                        transition: 'background 0.15s',
                        cursor: 'pointer',
                        background: selectedUser?._id === u._id ? '#F5F3FF' : 'transparent',
                      }}
                      onMouseEnter={e => { if (selectedUser?._id !== u._id) e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { if (selectedUser?._id !== u._id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* User */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <Avatar name={u.name} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{u.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                              <Mail size={11} /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Company */}
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {u.company ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Building2 size={13} /> {u.company}
                          </div>
                        ) : <span style={{ opacity: 0.45 }}>—</span>}
                      </td>

                      {/* Verified */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <VerifiedBadge verified={u.isVerified} suspended={u.isSuspended} />
                      </td>

                      {/* Joined */}
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} /> {formatDate(u.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        {u.role === 'supplier' && !u.isVerified ? (
                          <button
                            onClick={() => handleVerify(u._id, u.name)}
                            disabled={verifying === u._id}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                              padding: '0.45rem 1rem', borderRadius: 8,
                              background: verifying === u._id ? '#E5E7EB' : '#047857',
                              color: verifying === u._id ? '#9CA3AF' : 'white',
                              border: 'none', cursor: verifying === u._id ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem', fontWeight: 700,
                              transition: 'all 0.18s ease',
                            }}
                          >
                            {verifying === u._id ? (
                              <><RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
                            ) : (
                              <><BadgeCheck size={14} /> Verify</>
                            )}
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedUser(u)}
                            style={{ padding: '0.4rem 0.875rem', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: '0.78rem', fontWeight: 600, background: 'white', cursor: 'pointer' }}
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div style={{
                padding: '1rem 1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderTop: '1px solid var(--color-border)',
                background: '#FAFAFA',
              }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of <strong>{total}</strong> users
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '0.4rem 0.65rem', borderRadius: 7, border: '1px solid var(--color-border)', background: page === 1 ? '#F3F4F6' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          padding: '0.4rem 0.75rem', borderRadius: 7, fontWeight: 600, fontSize: '0.85rem',
                          border: page === p ? 'none' : '1px solid var(--color-border)',
                          background: page === p ? '#312E81' : 'white',
                          color: page === p ? 'white' : 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '0.4rem 0.65rem', borderRadius: 7, border: '1px solid var(--color-border)', background: page === totalPages ? '#F3F4F6' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profile Inspector Overlay Card */}
        {selectedUser && (
          <div className="card animate-fade-in" style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.875rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Profile Inspector</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Registered ID: {selectedUser._id}</span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}
              >
                ×
              </button>
            </div>

            {/* Profile Overview Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar name={selectedUser.name} size={50} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedUser.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{selectedUser.email}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <RoleBadge role={selectedUser.role} />
                </div>
              </div>
            </div>

            {/* Role & Specific Details Cards */}
            {selectedUser.role === 'supplier' && (
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '1rem', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Award size={16} /> Supplier Performance KPI
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Fulfillment Rate:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#166534' }}>98.2% (Top Tier)</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Delivery Performance:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#166534' }}>95.4%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Supplier Rating:</span>
                    <strong style={{ fontSize: '0.9rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      4.8 <Star size={12} fill="#F59E0B" color="#F59E0B" /> (32 reviews)
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Listed Products:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>14 active SKUs</strong>
                  </div>
                </div>
              </div>
            )}

            {selectedUser.role === 'buyer' && (
              <div style={{ background: '#eff6ff', borderRadius: 8, padding: '1rem', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#1e40af', fontWeight: 700, fontSize: '0.85rem' }}>
                  <ShoppingBag size={16} /> Customer Spend Profile
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Purchases:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1E40AF' }}>£4,580.99</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Wholesale Orders:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>18 orders placed</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Favorite Category:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Dairy / Vegetables</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Complaints/Disputes:</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#991B1B' }}>0 tickets raised</strong>
                  </div>
                </div>
              </div>
            )}

            {/* General info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div>
                <strong>Company:</strong> {selectedUser.company || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No company registered</span>}
              </div>
              <div>
                <strong>Address:</strong> {selectedUser.address || 'Aberdeen, AB10 1XY'}
              </div>
              <div>
                <strong>Joined Date:</strong> {formatDate(selectedUser.createdAt)}
              </div>
            </div>

            {/* Administration / Authorization Toggles */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h5 style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Administrative Operations</h5>

              {/* Verify toggle */}
              {selectedUser.role === 'supplier' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Supplier Verification:</span>
                  {selectedUser.isVerified ? (
                    <button onClick={() => showToast('Supplier holds fully verified badge. Documentation locked.', 'info')} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#047857', borderColor: '#A7F3D0' }}>Approved & Verified</button>
                  ) : (
                    <button onClick={() => handleVerify(selectedUser._id, selectedUser.name)} className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>Approve & Verify Credentials</button>
                  )}
                </div>
              )}

              {/* Suspend status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Account Access Status:</span>
                <button 
                  onClick={() => handleToggleSuspend(selectedUser)}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: 6, border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    background: selectedUser.isSuspended ? '#DCFCE7' : '#FEE2E2',
                    color: selectedUser.isSuspended ? '#166534' : '#991B1B'
                  }}
                >
                  {selectedUser.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                </button>
              </div>

              {/* Staff role RBAC */}
              {selectedUser.role === 'admin' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>Change Administrative Role (RBAC)</label>
                  <select 
                    value={selectedUser.staffRole || 'Admin'} 
                    onChange={e => handleChangeStaffRole(selectedUser._id, e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
              )}
            </div>
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
