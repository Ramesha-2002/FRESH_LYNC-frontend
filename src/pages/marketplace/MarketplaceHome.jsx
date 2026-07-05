import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ShoppingCart, Star } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../services/api';

const CATEGORIES = ['All', 'Fish', 'Meat', 'Vegetables', 'Dairy', 'Grains', 'Other'];
const PRICE_RANGES = [
  { label: 'Any Price', max: null },
  { label: 'Under £5',  max: 5 },
  { label: 'Under £20', max: 20 },
  { label: 'Under £50', max: 50 },
];

export default function MarketplaceHome() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('search') || '';
  });
  const [category, setCategory]   = useState('All');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [addedId, setAddedId]     = useState(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (priceRange.max) params.maxPrice = priceRange.max;
      const data = await productService.getProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, category, priceRange, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // debounce search
  useEffect(() => { setPage(1); }, [search, category, priceRange]);

  const handleAddToCart = (p, e) => {
    e.stopPropagation();
    addToCart({ id: p._id, name: p.name, price: p.displayPrice, unit: p.unit, image: p.image, supplierName: user?.role === 'buyer' ? 'FreshLync' : p.supplierName });
    setAddedId(p._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-sans)' }}>
      <SEO title="Marketplace" />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Fresh Marketplace</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Browse premium fish, meat, and vegetables from certified suppliers.</p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input className="input-field" placeholder={user?.role === 'buyer' ? "Search products..." : "Search products, suppliers..."} value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={14} /></button>}
        </div>

        <select value={priceRange.label} onChange={e => setPriceRange(PRICE_RANGES.find(r => r.label === e.target.value))}
          style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.875rem', cursor: 'pointer', background: 'white' }}>
          {PRICE_RANGES.map(r => <option key={r.label}>{r.label}</option>)}
        </select>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '0.45rem 1rem', borderRadius: 999, fontWeight: 600, fontSize: '0.82rem',
            border: `2px solid ${category === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: category === cat ? 'var(--color-primary)' : 'white',
            color: category === cat ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.2s',
          }}>{cat}</button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner fullPage={false} message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState icon={Filter} title="No products found" subtitle="Try a different search or category." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {products.map(p => (
              <div key={p._id} className="product-card card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/marketplace/product/${p._id}`)}>
                <div style={{ height: 180, background: '#E2E8F0', overflow: 'hidden', position: 'relative' }}>
                  {p.image ? (
                    <img src={getImageUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)' }}>
                      <span style={{ fontSize: '3rem' }}>{p.category === 'Fish' ? '🐟' : p.category === 'Meat' ? '🥩' : '🥬'}</span>
                    </div>
                  )}
                  <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'white', borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>{p.category}</span>
                  {p.stock < 50 && p.stock > 0 && (
                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#FEF3C7', borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, color: '#B45309' }}>Low Stock</span>
                  )}
                  {p.stock === 0 && (
                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#FEE2E2', borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, color: '#991B1B' }}>Out of Stock</span>
                  )}
                </div>

                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{user?.role === 'buyer' ? 'FreshLync' : (p.supplierName || 'Supplier')}</div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.name}</h3>

                  {p.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <Star size={13} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.rating.toFixed(1)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({p.reviews})</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>£{Number(p.displayPrice).toFixed(2)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>/{p.unit}</span>
                    </div>
                    <button
                      disabled={p.stock === 0 || addedId === p._id}
                      onClick={e => handleAddToCart(p, e)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.875rem',
                        borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                        background: addedId === p._id ? '#16A34A' : p.stock === 0 ? '#E2E8F0' : 'var(--color-primary)',
                        color: p.stock === 0 ? 'var(--color-text-muted)' : 'white', transition: 'all 0.2s',
                      }}>
                      <ShoppingCart size={14} />
                      {addedId === p._id ? 'Added!' : p.stock === 0 ? 'Sold Out' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${n === page ? 'var(--color-primary)' : 'var(--color-border)'}`, background: n === page ? 'var(--color-primary)' : 'white', color: n === page ? 'white' : 'var(--color-text-main)', fontWeight: 700, cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
