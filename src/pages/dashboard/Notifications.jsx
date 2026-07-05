import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, Package, ShieldCheck, Check, Trash2, RefreshCw, Layers } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { analyticsService } from '../../services/analyticsService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICONS = {
  order: { icon: ShoppingBag, color: '#2563EB', bg: '#DBEAFE' },
  stock: { icon: Package, color: '#EF4444', bg: '#FEE2E2' },
  system: { icon: ShieldCheck, color: '#16A34A', bg: '#DCFCE7' },
  payout: { icon: Layers, color: '#9333EA', bg: '#F3E8FF' }
};

export default function Notifications() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [list, setList] = useState([]);

  const handleNotificationClick = async (item) => {
    // Mark as read if unread
    if (!item.read) {
      try {
        await analyticsService.markNotificationAsRead(item.id);
        setList(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
      } catch (err) {
        console.error('Failed to mark notification as read on click:', err);
      }
    }

    // Navigate to relevant page
    const type = item.type;
    const titleLower = (item.title || '').toLowerCase();
    const messageLower = (item.message || '').toLowerCase();
    const isBuyer = user?.role === 'buyer';
    const isAdmin = user?.role === 'admin';

    const isPaymentRelated = titleLower.includes('payment') || messageLower.includes('payment') || titleLower.includes('slip') || messageLower.includes('slip');

    if (isPaymentRelated) {
      if (isAdmin) navigate('/admin/orders');
      else if (isBuyer) navigate('/marketplace/shipments');
      else navigate('/dashboard/orders');
    } else if (type === 'stock' || titleLower.includes('product') || titleLower.includes('listing') || messageLower.includes('product') || messageLower.includes('listing')) {
      if (isAdmin) navigate('/admin/inventory');
      else if (isBuyer) navigate('/marketplace/inventory');
      else navigate('/dashboard/inventory');
    } else if (type === 'order' || titleLower.includes('order') || messageLower.includes('order')) {
      if (isAdmin) navigate('/admin/orders');
      else if (isBuyer) navigate('/marketplace/shipments');
      else navigate('/dashboard/orders');
    } else if (type === 'payout' || titleLower.includes('payout') || titleLower.includes('earnings') || messageLower.includes('payout') || messageLower.includes('earnings')) {
      if (isAdmin) navigate('/admin');
      else if (isBuyer) navigate('/marketplace');
      else navigate('/dashboard/earnings');
    } else if (titleLower.includes('verification') || titleLower.includes('verify') || messageLower.includes('verification') || messageLower.includes('verify')) {
      if (isAdmin) navigate('/admin/profile');
      else if (isBuyer) navigate('/setup/profile');
      else navigate('/dashboard/profile');
    } else {
      if (isAdmin) navigate('/admin');
      else if (isBuyer) navigate('/marketplace');
      else navigate('/dashboard');
    }
  };
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getNotifications();
      setList(res);
    } catch {
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await analyticsService.markNotificationAsRead(id);
      setList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      showToast('Notification marked as read.', 'success');
    } catch {
      showToast('Failed to mark notification as read.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await analyticsService.deleteNotification(id);
      setList(prev => prev.filter(n => n.id !== id));
      showToast('Notification deleted.', 'success');
    } catch {
      showToast('Failed to delete notification.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await analyticsService.markAllNotificationsAsRead();
      setList(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read.', 'success');
    } catch {
      showToast('Failed to mark notifications as read.', 'error');
    }
  };


  const filtered = list.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (loading) return <LoadingSpinner fullPage message="Loading notification feed..." />;

  return (
    <div>
      <SEO title="Notification Center" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Notification Center</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Stay up to date with order alerts, stock warnings, and payouts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {list.some(n => !n.read) && (
            <button className="btn-secondary" onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
              <Check size={16} /> Mark All Read
            </button>
          )}
          <button className="btn-secondary" onClick={loadNotifications} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        {['all', 'unread', 'read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
              border: 'none',
              background: filter === tab ? 'var(--color-primary)' : 'transparent',
              color: filter === tab ? 'white' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            {tab} ({tab === 'all' ? list.length : tab === 'unread' ? list.filter(n => !n.read).length : list.filter(n => n.read).length})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Bell size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
            No notifications found in this view.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((item, i) => {
              const typeMeta = TYPE_ICONS[item.type] || { icon: Bell, color: '#475569', bg: '#F1F5F9' };
              const Icon = typeMeta.icon;

              return (
                <div
                  key={item.id}
                  className="notification-row"
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem 1.5rem',
                    borderTop: i > 0 ? '1px solid var(--color-border)' : 'none',
                    background: item.read ? 'white' : 'rgba(16, 185, 129, 0.03)',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      background: typeMeta.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignContent: 'center',
                      justifyItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={20} color={typeMeta.color} style={{ margin: 'auto' }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: item.read ? 600 : 700, color: '#1e293b' }}>
                        {item.title}
                        {!item.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', marginLeft: '0.5rem', verticalAlign: 'middle' }} />}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {item.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center' }}>
                    {!item.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                        title="Mark as Read"
                        style={{ padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', border: 'none', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center' }}
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      title="Delete"
                      style={{ padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', border: 'none', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
