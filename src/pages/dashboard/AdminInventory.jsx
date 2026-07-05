import React, { useState, useEffect, useMemo } from 'react';
import { Package, Filter, Download, ExternalLink, Search, CheckCircle, AlertOctagon, Trash2, ShieldAlert } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { productService } from '../../services/productService';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl } from '../../services/api';

const CATEGORIES = ['All', 'Fish', 'Meat', 'Vegetables', 'Dairy', 'Grains', 'Other'];

export default function AdminInventory() {
  const { showToast, showConfirm } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, depleted

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products (isActive true and false)
      const data = await productService.getProducts({ limit: 100 });
      setProducts(data.products || []);
    } catch {
      setError('Failed to fetch system inventory.');
      showToast('Failed to fetch system inventory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleApprove = async (id) => {
    try {
      // Toggle product approval (simulated by updating it)
      await productService.updateProduct(id, { isActive: true });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: true } : p));
      showToast('Product approved successfully.', 'success');
    } catch {
      showToast('Failed to approve product.', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      // Flag/Reject product (set isActive false)
      await productService.updateProduct(id, { isActive: false });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: false } : p));
      showToast('Product rejected successfully.', 'warning');
    } catch {
      showToast('Failed to reject product.', 'error');
    }
  };

  const handleDelete = (id) => {
    showConfirm({
      title: 'Remove Product Permanently',
      message: 'Are you sure you want to remove this product permanently? This action cannot be undone.',
      confirmText: 'Delete Product',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          await productService.deleteProduct(id);
          setProducts(prev => prev.filter(p => p._id !== id));
          showToast('Product deleted successfully.', 'success');
        } catch {
          showToast('Delete failed.', 'error');
        }
      }
    });
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.supplierName || '').toLowerCase().includes(q);
      const matchesCategory = category === 'All' || p.category === category;
      
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = p.stock > 0 && p.stock < 50;
      } else if (stockFilter === 'depleted') {
        matchesStock = p.stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, stockFilter]);

  const handleExportLogs = () => {
    const header = 'SKU,Product,Supplier,Category,Price,Unit,Stock,Status\n';
    const rows = filtered.map(p => {
      const status = p.stock === 0 ? 'Out of Stock' : (p.stock < 50 ? 'Low Stock' : 'Healthy');
      return `"${p.sku || '—'}","${p.name}","${p.supplierName || '—'}",${p.category},£${p.price.toFixed(2)},${p.unit},${p.stock},${status}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'system-inventory.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 50).length;
  const depletedCount = products.filter(p => p.stock === 0).length;

  if (loading) return <LoadingSpinner fullPage message="Loading global inventory..." />;

  return (
    <div>
      <SEO title="System Inventory" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontWeight: 800 }}>Global Inventory Directory</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Oversight and approval workflows for all wholesale product listings.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleExportLogs} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export Directory
          </button>
        </div>
      </div>

      {/* Inventory Alerts Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="card" onClick={() => setStockFilter('all')} style={{ cursor: 'pointer', border: stockFilter === 'all' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>All Listed SKUs</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#1E40AF' }}>{products.length}</div>
        </div>
        <div className="card" onClick={() => setStockFilter('low')} style={{ cursor: 'pointer', border: stockFilter === 'low' ? '2px solid #F59E0B' : '1px solid var(--color-border)', background: lowStockCount > 0 ? '#FFFBEB' : 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldAlert size={14} /> Low Stock Warning</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#B45309' }}>{lowStockCount}</div>
        </div>
        <div className="card" onClick={() => setStockFilter('depleted')} style={{ cursor: 'pointer', border: stockFilter === 'depleted' ? '2px solid #EF4444' : '1px solid var(--color-border)', background: depletedCount > 0 ? '#FEF2F2' : 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertOctagon size={14} /> Depleted Inventory</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#991B1B' }}>{depletedCount}</div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={17} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input-field" placeholder="Search by name, SKU, or supplier..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.8rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '0.45rem 1rem', borderRadius: 999, fontWeight: 700, fontSize: '0.8rem',
              background: category === cat ? 'var(--color-primary)' : 'white',
              color: category === cat ? 'white' : 'var(--color-text-muted)',
              border: `2px solid ${category === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer', transition: 'all 0.18s'
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
            <tr>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>PRODUCT (SKU)</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>SUPPLIER</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>CATEGORY</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>PRICE</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>GLOBAL STOCK</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700 }}>APPROVAL STATUS</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontWeight: 700 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No inventory records found.</td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isLow = p.stock > 0 && p.stock < 50;
                const isDepleted = p.stock === 0;
                const stockColor = isDepleted ? '#991B1B' : (isLow ? '#B45309' : 'var(--color-text-main)');
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)', background: p.isActive === false ? '#FAF5F5' : '' }}>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {p.image ? <img src={getImageUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} color="#94A3B8" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>SKU: {p.sku || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 500 }}>{p.supplierName || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Supplier: £{Number(p.basePrice || p.price).toFixed(2)} / {p.unit}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>Marketplace: £{Number(p.sellingPrice || p.price).toFixed(2)} / {p.unit}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: stockColor }}>
                      {p.stock} {p.unit} {isDepleted && '(Depleted)'} {isLow && '(Low)'}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {p.isActive === false ? (
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>Flagged / Inactive</span>
                      ) : (
                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>Approved</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      {p.isActive === false ? (
                        <button title="Approve Listing" onClick={() => handleApprove(p._id)} style={{ padding: '0.35rem', borderRadius: 6, border: 'none', background: '#DCFCE7', color: '#166534', cursor: 'pointer', marginRight: '0.5rem' }}>
                          <CheckCircle size={15} />
                        </button>
                      ) : (
                        <button title="Flag / Restrict" onClick={() => handleReject(p._id)} style={{ padding: '0.35rem', borderRadius: 6, border: 'none', background: '#FEF3C7', color: '#B45309', cursor: 'pointer', marginRight: '0.5rem' }}>
                          <AlertOctagon size={15} />
                        </button>
                      )}
                      <button title="Delete Listing" onClick={() => handleDelete(p._id)} style={{ padding: '0.35rem', borderRadius: 6, border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
