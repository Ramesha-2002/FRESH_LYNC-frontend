import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Leaf, User, ShieldCheck, Users, Plug, Settings, HelpCircle, Bell, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SetupLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navItems = user?.role === 'supplier' ? [
    { path: '/setup/profile', icon: User, label: 'Profile Setup', step: 1 },
    { path: '/setup/verification', icon: ShieldCheck, label: 'Business Verification', step: 2 },
    { path: '/setup/preferences', icon: Settings, label: 'Preferences', step: 3 },
  ] : [
    { path: '/setup/profile', icon: User, label: 'Profile Setup', step: 1 },
    { path: '/setup/preferences', icon: Settings, label: 'Preferences', step: 2 },
  ];


  return (
    <div className="setup-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <aside className="setup-sidebar">
        <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img 
              src="/newlogo.png" 
              alt="Freshlync logo" 
              style={{ height: '70px', width: 'auto', display: 'block', cursor: 'pointer' }} 
              onClick={() => window.location.href = '/'}
            />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Setup Progress</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 2rem',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: isActive ? 'rgba(21, 128, 61, 0.1)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                borderRight: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
              })}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '2rem' }}>
          <div style={{ background: 'var(--color-background)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Need Help?</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Our support team is available 24/7 to help you set up your team roles.
            </div>
          </div>
          <button onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontWeight: 500, borderRadius: '8px' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="setup-main">
        <header className="setup-header">
          <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <button onClick={() => navigate('/marketplace')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--color-text-main)', fontWeight: 500, cursor: 'pointer' }}>
              <ArrowLeft size={16} /> Back to Marketplace
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)' }}>
            <Bell size={20} />
            <HelpCircle size={20} />
          </div>
        </header>
        <div className="setup-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
