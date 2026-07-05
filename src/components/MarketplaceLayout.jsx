import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Bell, ShoppingCart, LogOut, Info, Store, Users, User, Wallet, Package, Activity, Settings, LayoutGrid, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ChatbotWidget from './ChatbotWidget';

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100";
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendUrl}${normalizedAvatar}`;
};

export default function MarketplaceLayout() {
  const { cartItemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (user && user.role === 'supplier') {
    return <Navigate to="/dashboard" replace />;
  }

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.7rem 1rem',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '0.9rem',
    textDecoration: 'none',
    background: isActive ? 'rgba(255,255,255,0.92)' : 'transparent',
    color: isActive ? '#047857' : 'rgba(255,255,255,0.82)',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="dashboard-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ background: '#047857' }}>
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

        <div style={{ padding: '1.25rem 1.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/newlogo.png" 
            alt="Freshlync logo" 
            style={{ height: '72px', width: 'auto', display: 'block', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 1rem', gap: '0.15rem' }}>
          <NavLink to="/marketplace" end style={navItemStyle}><Store size={19} /> Marketplace</NavLink>
          {user?.role !== 'buyer' && (
            <NavLink to="/marketplace/suppliers" style={navItemStyle}><Users size={19} /> Suppliers</NavLink>
          )}
          <NavLink to="/marketplace/billing" style={navItemStyle}><Wallet size={19} /> Billing & Credit</NavLink>
          <NavLink to="/marketplace/shipments" style={navItemStyle}><LayoutGrid size={19} /> My Shipments</NavLink>
          <NavLink to="/marketplace/inventory" style={navItemStyle}><Package size={19} /> Purchase History</NavLink>
          <NavLink to="/marketplace/analytics" style={navItemStyle}><Activity size={19} /> Analytics</NavLink>

          {/* Cart shortcut */}
          <NavLink to="/marketplace/cart" style={({ isActive }) => ({ ...navItemStyle({ isActive }), marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1rem' })}>
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={19} />
              {cartItemCount > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, background: '#f25c54', color: 'white', fontSize: '0.6rem', fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </div>
            Cart {cartItemCount > 0 && `(${cartItemCount})`}
          </NavLink>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <NavLink to="/setup/preferences" style={navItemStyle}><Settings size={19} /> Settings</NavLink>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.7rem 1rem', color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500, fontSize: '0.9rem', borderRadius: 8 }}>
            <LogOut size={19} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header style={{ height: '68px', background: 'white', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ display: 'none', marginRight: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Marketplace</h1>
              <div className="header-subtitle" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Discover premium fish, meat, and vegetables</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Cart button in header */}
            <button onClick={() => navigate('/marketplace/cart')} style={{ position: 'relative', color: 'var(--color-text-main)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem' }}>
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/dashboard/notifications')}
              style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Notifications"
            >
              <Bell size={20} />
            </button>
            <button style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Info size={20} /></button>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                title="User menu"
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', border: '2px solid #047857' }}>
                  <img src={getAvatarUrl(user?.avatar)} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      {user?.company || user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {user?.role || 'buyer'}
                    </div>
                  </div>
                  
                  {/* Menu items */}
                  <button 
                    onClick={() => { setShowUserDropdown(false); navigate('/account/settings'); }}
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
                    <Settings size={15} /> Settings
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

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </main>

      {/* AI Chatbot Widget — customer-facing only */}
      <ChatbotWidget />
    </div>
  );
}
