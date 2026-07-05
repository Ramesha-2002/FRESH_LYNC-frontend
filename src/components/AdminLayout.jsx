import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, LayoutDashboard, Truck, Package, Settings, LogOut, Info, Users, User, ShoppingBag, ShieldAlert, Trash2, Star, Menu, X } from 'lucide-react';
import { adminService } from '../services/adminService';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100";
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendUrl}${normalizedAvatar}`;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await adminService.getNotifications();
        setNotifications(notifs);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchNotifs();
    
    // Poll notifications every 5 seconds for real-time updates
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await analyticsService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await analyticsService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (n) => {
    try {
      if (!n.read) {
        await analyticsService.markNotificationAsRead(n.id);
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
      }
      
      const titleLower = (n.title || '').toLowerCase();
      const textLower = (n.text || '').toLowerCase();

      // Check if this is an order payment verification vs supplier verification
      const isPaymentRelated = titleLower.includes('payment') || textLower.includes('payment') || titleLower.includes('slip') || textLower.includes('slip');

      if (isPaymentRelated) {
        navigate(`/admin/orders`);
      } else if (n.supplierId || titleLower.includes('verification') || textLower.includes('verification') || titleLower.includes('verify') || textLower.includes('verify')) {
        const supParam = n.supplierId ? `?supplierId=${n.supplierId}` : '';
        navigate(`/admin/verification${supParam}`);
      } else if (titleLower.includes('appeal') || titleLower.includes('product') || titleLower.includes('listing') || titleLower.includes('inventory') || textLower.includes('appeal') || textLower.includes('product') || textLower.includes('listing') || textLower.includes('inventory')) {
        navigate(`/admin/inventory`);
      } else if (titleLower.includes('order') || textLower.includes('order')) {
        navigate(`/admin/orders`);
      } else if (titleLower.includes('review') || textLower.includes('review')) {
        navigate(`/admin/reviews`);
      } else {
        navigate(`/admin`);
      }
      setShowNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontWeight: 500,
    textDecoration: 'none',
    background: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
    color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.8)',
    transition: 'all 0.2s ease'
  });

  return (
    <div className="dashboard-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ background: '#064E3B' }}>
        {/* Mobile close button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="mobile-menu-close"
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', color: 'white',
            cursor: 'pointer', display: 'none'
          }}
        >
          <X size={22} />
        </button>

        <div style={{ padding: '2rem 1.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/newlogo.png" 
            alt="Freshlync logo" 
            style={{ height: '80px', width: 'auto', display: 'block', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 1rem', gap: '0.25rem' }}>
          <NavLink to="/admin" end style={navItemStyle}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" style={navItemStyle}>
            <ShoppingBag size={20} /> Orders
          </NavLink>
          <NavLink to="/admin/shipments" style={navItemStyle}>
            <Truck size={20} /> Shipments
          </NavLink>
          <NavLink to="/admin/inventory" style={navItemStyle}>
            <Package size={20} /> Inventory
          </NavLink>
          <NavLink to="/admin/users" style={navItemStyle}>
            <Users size={20} /> User Management
          </NavLink>
          <NavLink to="/admin/verification" style={navItemStyle}>
            <ShieldAlert size={20} /> Business Verification
          </NavLink>
          <NavLink to="/admin/reviews" style={navItemStyle}>
            <Star size={20} /> Reviews
          </NavLink>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <NavLink to="/setup/preferences" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
            <Settings size={20} /> System Settings
          </NavLink>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500 }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header style={{ height: '72px', background: 'white', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ display: 'none', marginRight: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Admin Portal</h1>
              <div className="header-subtitle" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Platform Overview & Operations</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="header-search-container" style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Search system-wide..." style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '999px', border: '1px solid var(--color-border)', outline: 'none', width: '300px', background: 'var(--color-background)' }} />
            </div>

            {/* Notification Bell with Badge and Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#EF4444', color: 'white',
                    fontSize: '0.65rem', fontWeight: 'bold',
                    width: '16px', height: '16px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute', right: 0, top: '2.5rem',
                  width: '320px', background: 'white', borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid var(--color-border)', zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{ fontSize: '0.72rem', color: 'var(--color-primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        No notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotifClick(n)}
                          style={{
                            padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9',
                            background: n.read ? 'white' : '#EEF2F6',
                            cursor: 'pointer', transition: 'background 0.2s',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: n.read ? '#4B5563' : 'black', margin: 0 }}>{n.title || 'Notification'}</p>
                            <p style={{ fontSize: '0.75rem', lineHeight: 1.3, color: '#64748B', margin: '0.15rem 0 0.25rem' }}>{n.text}</p>
                            <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', display: 'block' }}>{n.time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={(e) => handleDeleteNotif(e, n.id)}
                              title="Delete notification"
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                color: '#EF4444',
                                padding: '0.25rem',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <Trash2 size={14} />
                            </button>
                            {!n.read && (
                              <span style={{ width: '6px', height: '6px', background: '#EF4444', borderRadius: '50%', flexShrink: 0 }}></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Info size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} 
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }} 
                title="Admin menu"
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', border: '2px solid #064E3B' }}>
                  <img src={getAvatarUrl(user?.avatar)} alt="Admin User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: '2.5rem',
                  width: '200px', background: 'white', borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid var(--color-border)', zIndex: 1000,
                  overflow: 'hidden', padding: '0.5rem 0'
                }}>
                  {/* User info header */}
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name || 'Admin'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {user?.role || 'admin'}
                    </div>
                  </div>
                  
                  {/* Menu items */}
                  <button 
                    onClick={() => { setShowUserDropdown(false); navigate('/admin/profile'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.82rem', color: 'var(--color-text-main)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <User size={15} /> My Profile
                  </button>
                  <button 
                    onClick={() => { setShowUserDropdown(false); navigate('/setup/preferences'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.82rem', color: 'var(--color-text-main)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Settings size={15} /> System Settings
                  </button>
                  
                  <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.4rem 0' }} />
                  
                  <button 
                    onClick={() => { setShowUserDropdown(false); logout(); navigate('/login'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 1rem', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.82rem', color: '#EF4444', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
