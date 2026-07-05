import React, { useState, useEffect } from 'react';
import { User, Building2, Mail, Phone, Globe, Upload, Check, Save } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendUrl}${normalizedAvatar}`;
};

const STATUS_BADGE = {
  unverified: { text: 'Unverified', bg: '#F3F4F6', color: '#4B5563' },
  pending: { text: 'Pending Verification', bg: '#FEF3C7', color: '#D97706' },
  approved: { text: 'Approved', bg: '#D1FAE5', color: '#059669' },
  rejected: { text: 'Rejected', bg: '#FEE2E2', color: '#DC2626' },
  information_requested: { text: 'Info Requested', bg: '#E0F2FE', color: '#0284C7' },
  expired: { text: 'Expired', bg: '#F3F4F6', color: '#6B7280' },
};

export default function SupplierProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotification();
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    bankName: '',
    accountNumber: '',
    sortCode: '',
    avatar: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('business');

  useEffect(() => {
    if (user) {
      setForm({
        businessName: user.company || '',
        contactName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        website: user.website || '',
        address: user.address || '',
        description: user.description || '',
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        sortCode: user.sortCode || '',
        avatar: null
      });
      if (user.avatar) {
        setPreview(getAvatarUrl(user.avatar));
      } else {
        setPreview(null);
      }
    }
  }, [user]);

  useEffect(() => {
    console.log('[SupplierProfile] AuthContext user changed. Current avatar:', user?.avatar);
  }, [user]);

  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    setSaved(false);
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('avatar', file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'business') {
        const fd = new FormData();
        if (user?.role !== 'admin') {
          fd.append('company', form.businessName);
          fd.append('website', form.website);
          fd.append('address', form.address);
          fd.append('description', form.description);
        }
        fd.append('name', form.contactName);
        fd.append('email', form.email);
        fd.append('phone', form.phone || '');
        if (form.avatar) {
          fd.append('avatar', form.avatar);
        }
        console.log('[SupplierProfile] Sending profile update FormData...');
        const updated = await authService.updateProfile(fd);
        console.log('[SupplierProfile] Profile update response avatar:', updated?.avatar);
        updateUser(updated);
        console.log('[SupplierProfile] AuthContext user.avatar after updateUser call:', updated?.avatar);
        setSaved(true);
        showToast('Business details updated successfully.', 'success');
      } else if (tab === 'banking') {
        const payload = {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          sortCode: form.sortCode
        };
        const updated = await authService.updateProfile(payload);
        updateUser(updated);
        setSaved(true);
        showToast('Banking information updated successfully.', 'success');
      } else if (tab === 'security') {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
          showToast('All password fields are required.', 'error');
          setLoading(false);
          return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          showToast('New passwords do not match.', 'error');
          setLoading(false);
          return;
        }
        if (passwordForm.newPassword.length < 6) {
          showToast('Password must be at least 6 characters long.', 'error');
          setLoading(false);
          return;
        }
        await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password changed successfully.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <SEO title={user?.role === 'admin' ? "Admin Profile" : "Supplier Profile"} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
          <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: preview ? 'transparent' : (user?.role === 'admin' ? 'linear-gradient(135deg, #312E81, #4F46E5)' : 'linear-gradient(135deg, #15803d, #1f9d55)'), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid white', boxShadow: user?.role === 'admin' ? '0 4px 16px rgba(49,46,129,0.3)' : '0 4px 16px rgba(21,128,61,0.3)' }}>
            {preview ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={36} style={{ color: 'white' }} />}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            <Upload size={12} style={{ color: 'white' }} />
          </div>
        </label>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>{user?.role === 'admin' ? (user.name || 'Admin Profile') : (form.businessName || 'Business Profile')}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{form.email}</p>
        </div>
        {saved && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#DCFCE7', color: '#16A34A', padding: '0.4rem 0.875rem', borderRadius: 999, fontWeight: 600, fontSize: '0.85rem' }}>
            <Check size={14} /> Saved
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem', gap: '0' }}>
        {[
          ['business', user?.role === 'admin' ? 'Profile Details' : 'Business Info'],
          user?.role !== 'admin' && ['banking', 'Banking'],
          ['security', 'Security']
        ].filter(Boolean).map(([key, label]) => (
          <button key={key} type="button" onClick={() => { setTab(key); setSaved(false); }} style={{ padding: '0.75rem 1.5rem', fontWeight: 600, fontSize: '0.9rem', borderBottom: `3px solid ${tab === key ? 'var(--color-primary)' : 'transparent'}`, color: tab === key ? 'var(--color-primary)' : 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {tab === 'business' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '1rem' }}>{user?.role === 'admin' ? 'Account Details' : 'Company Details'}</h3>
                </div>
                {user?.role === 'supplier' && (
                  <span style={{
                    background: STATUS_BADGE[user.verificationStatus]?.bg || '#F3F4F6',
                    color: STATUS_BADGE[user.verificationStatus]?.color || '#4B5563',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {STATUS_BADGE[user.verificationStatus]?.text || 'Unverified'}
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {user?.role !== 'admin' && (
                  <PF label="Business Name *">
                    <input className="input-field" value={form.businessName} onChange={e => set('businessName', e.target.value)} required />
                  </PF>
                )}
                <PF label={user?.role === 'admin' ? "Full Name *" : "Contact Name *"}>
                  <input className="input-field" value={form.contactName} onChange={e => set('contactName', e.target.value)} required />
                </PF>
                <PF label={user?.role === 'admin' ? "Email Address *" : "Business Email *"}>
                  <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
                </PF>
                <PF label="Phone">
                  <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </PF>
                {user?.role !== 'admin' && (
                  <>
                    <PF label="Website" colSpan={2}>
                      <input className="input-field" value={form.website} onChange={e => set('website', e.target.value)} />
                    </PF>
                    <PF label="Address" colSpan={2}>
                      <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
                    </PF>
                    <PF label="Business Description" colSpan={2}>
                      <textarea className="input-field" value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                    </PF>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'banking' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem' }}>💳 Banking Details</h3>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: 10, padding: '0.875rem', fontSize: '0.85rem', color: '#92400E', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              ⚠️ Bank details are encrypted and used solely for payment processing. Never share these credentials with anyone.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <PF label="Bank Name" colSpan={2}>
                <input className="input-field" value={form.bankName} onChange={e => set('bankName', e.target.value)} placeholder="e.g. Barclays Business" />
              </PF>
              <PF label="Account Number">
                <input className="input-field" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="12345678" type="password" />
              </PF>
              <PF label="Sort Code">
                <input className="input-field" value={form.sortCode} onChange={e => set('sortCode', e.target.value)} placeholder="00-00-00" />
              </PF>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>🔒 Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PF label="Current Password">
                <input className="input-field" type="password" placeholder="••••••••" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} />
              </PF>
              <PF label="New Password">
                <input className="input-field" type="password" placeholder="••••••••" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} />
              </PF>
              <PF label="Confirm New Password">
                <input className="input-field" type="password" placeholder="••••••••" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} />
              </PF>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => {
            if (user) {
              setForm({
                businessName: user.company || '',
                contactName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                website: user.website || '',
                address: user.address || '',
                description: user.description || '',
                bankName: user.bankName || '',
                accountNumber: user.accountNumber || '',
                sortCode: user.sortCode || '',
                avatar: null
              });
              setPreview(getAvatarUrl(user.avatar));
            }
          }}>Discard</button>
        </div>
      </form>
    </div>
  );
}

function PF({ label, children, colSpan }) {
  return (
    <div style={{ gridColumn: colSpan ? `span ${colSpan}` : undefined }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--color-text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}
