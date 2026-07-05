import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LayoutDashboard, Package, ShoppingBag, BarChart3, ShieldCheck, HelpCircle, Settings, LogOut, Edit2, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function SupplierDashboard() {
  const navigate = useNavigate();

  const products = [
    { sku: 'KALE-001', name: 'Organic Curly Kale', category: 'Vegetables', price: '$2.45 / kg', stock: '1250', unit: 'kg', status: 'In Stock' },
    { sku: 'PEPP-042', name: 'Mixed Bell Peppers', category: 'Vegetables', price: '$1.80 / kg', stock: '42', unit: 'kg', status: 'Low Stock' },
    { sku: 'SALM-091', name: 'Atlantic Salmon', category: 'Fish', price: '$24.99 / kg', stock: '850', unit: 'kg', status: 'In Stock' },
  ];

  return (
    <div className="dashboard-layout" style={{ fontFamily: 'var(--font-sans)' }}>
      <SEO title="Supplier Dashboard" />
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <img src="/newlogo.png" alt="Freshlync logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 1rem', gap: '0.25rem' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.9)', color: 'var(--color-text-main)', borderRadius: '8px', fontWeight: 500 }}>
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)' }}>
            <Package size={20} /> Inventory
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)' }}>
            <ShoppingBag size={20} /> Orders
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)' }}>
            <BarChart3 size={20} /> Analytics
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)' }}>
            <ShieldCheck size={20} /> Compliance
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)' }}>
            <HelpCircle size={20} /> Support
          </a>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <a href="#" onClick={() => navigate('/setup/preferences')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.8)' }}>
            <Settings size={20} /> Settings
          </a>
          <a href="#" onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', color: '#FCA5A5' }}>
            <LogOut size={20} /> Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header style={{ height: '72px', background: 'white', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Supplier Dashboard</h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Welcome back, GreenEarth Organics</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Search orders, stock..." style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '999px', border: '1px solid var(--color-border)', outline: 'none', width: '300px', background: 'var(--color-background)' }} />
            </div>
            <button style={{ color: 'var(--color-text-muted)' }}>
              <Bell size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/setup/profile')}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ textAlign: 'left', display: 'none' }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>James Miller</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Logistics Lead</div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutDashboard size={20} />
                </div>
                <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, height: 'max-content' }}>+12.5%</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Sales</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>$142,580.00</div>
            </div>
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} />
                </div>
                <div style={{ background: '#F1F5F9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, height: 'max-content' }}>8 Pending</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Orders to Fulfill</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>24</div>
            </div>
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, height: 'max-content' }}>Critical</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Low Stock Alert</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>03 <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Items</span></div>
            </div>
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, height: 'max-content' }}>Top Tier</div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Supplier Rating</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>4.92 <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>/ 5.0</span></div>
            </div>
          </div>

          {/* Table Area */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Inventory Management</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Update stock volumes and product details</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Filter</button>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Export CSV</button>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>PRODUCT</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>WHOLESALE PRICE</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>STOCK VOLUME</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#E2E8F0' }}></div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.price}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="text" defaultValue={p.stock} style={{ width: '80px', padding: '0.25rem 0.5rem', border: `1px solid ${p.status === 'Low Stock' ? '#FCA5A5' : 'var(--color-border)'}`, borderRadius: '4px' }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>{p.unit}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: p.status === 'In Stock' ? '#DCFCE7' : '#FEE2E2', color: p.status === 'In Stock' ? '#166534' : '#991B1B', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button style={{ color: 'var(--color-text-muted)', marginRight: '1rem' }}><Edit2 size={18} /></button>
                      <button style={{ color: 'var(--color-text-muted)' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <div>Showing 1-10 of 48 products</div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'white' }}>&lt;</button>
                <button style={{ padding: '0.25rem 0.75rem', background: 'var(--color-primary)', color: 'white', borderRadius: '4px', border: 'none' }}>1</button>
                <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'white' }}>2</button>
                <button style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'white' }}>&gt;</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
