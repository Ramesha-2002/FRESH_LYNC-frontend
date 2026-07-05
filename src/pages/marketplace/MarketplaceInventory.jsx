import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Filter, ShoppingCart, RefreshCw, Trash2, Calendar, Clock } from 'lucide-react';
import SEO from '../../components/SEO';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../services/api';



export default function MarketplaceInventory() {
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [recurringTemplates, setRecurringTemplates] = useState([]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({ limit: 100 });
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Load recurring templates from localStorage
    const templates = JSON.parse(localStorage.getItem('freshlync_recurring_orders') || '[]');
    setRecurringTemplates(templates);
  }, []);

  const handleDeleteTemplate = (id) => {
    const updated = recurringTemplates.filter(t => t.id !== id);
    setRecurringTemplates(updated);
    localStorage.setItem('freshlync_recurring_orders', JSON.stringify(updated));
    showToast('Recurring order schedule cancelled successfully.', 'success');
  };

  // Extract purchased products from historical orders
  const purchasedItems = useMemo(() => {
    const itemsMap = {};
    
    // Process real orders
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      (order.items || []).forEach(item => {
        const productId = item.product || item._id;
        if (!productId) return;
        if (!itemsMap[productId]) {
          itemsMap[productId] = {
            id: productId,
            name: item.name,
            price: item.price,
            unit: item.unit || 'kg',
            supplierName: user?.role === 'buyer' ? 'FreshLync' : (item.supplierName || 'Supplier'),
            category: item.category || (item.name.toLowerCase().includes('salmon') || item.name.toLowerCase().includes('fish') ? 'Fish' : item.name.toLowerCase().includes('beef') || item.name.toLowerCase().includes('meat') ? 'Meat' : 'Vegetables'),
            lastPurchased: orderDate,
            image: item.image || null,
          };
        }
      });
    });

    return Object.values(itemsMap);
  }, [orders]);

  const filteredItems = useMemo(() => {
    return purchasedItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.supplierName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [purchasedItems, search, categoryFilter]);

  const handleBuyAgain = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      image: item.image,
      supplierName: item.supplierName
    });
    showToast(`${item.name} added to cart!`, 'success');
  };

  const getCategoryImage = (category, itemImage) => {
    if (itemImage) {
      return getImageUrl(itemImage);
    }
    switch (category) {
      case 'Fish':
        return '🐟';
      case 'Meat':
        return '🥩';
      case 'Vegetables':
        return '🥬';
      default:
        return '📦';
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading purchase history..." />;

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', fontFamily: 'var(--font-sans)' }}>
      <SEO title="Purchase History & Reorders" />

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Purchase History & Reorders</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Reorder products from your past transactions with one-click re-stocking.</p>
        </div>
        <button onClick={fetchHistory} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Refresh History
        </button>
      </div>

      {/* Active Recurring Templates Area */}
      {recurringTemplates.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            🔁 Active Recurring Schedules
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {recurringTemplates.map((template) => (
              <div key={template.id} className="card" style={{ background: '#f8fafc', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{template.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> Schedule: {template.frequency.toUpperCase()}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTemplate(template.id)} style={{ color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px' }} title="Cancel schedule">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Items included:</div>
                  <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                    {template.items?.map((it, idx) => (
                      <li key={idx}>{it.name} ({it.quantity} {it.unit})</li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--color-border)', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Next Reorder Run:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={12} /> {template.nextDelivery}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder={user?.role === 'buyer' ? "Search past purchased products..." : "Search past purchased products or suppliers..."}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 8, border: '1px solid var(--color-border)', outline: 'none', boxSizing: 'border-box' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: '0.875rem', background: 'white', cursor: 'pointer' }}
        >
          <option value="All">All Categories</option>
          <option value="Fish">Fish & Seafood</option>
          <option value="Meat">Meat & Poultry</option>
          <option value="Vegetables">Vegetables & Greens</option>
        </select>
      </div>

      {/* Purchase History Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>PRODUCT</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>SUPPLIER</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>CATEGORY</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>LAST UNIT PRICE</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>LAST PURCHASED</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  {orders.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '1rem' }}>No purchase history yet</div>
                      <div style={{ fontSize: '0.875rem' }}>Your orders will appear here after your first purchase.</div>
                    </div>
                  ) : (
                    'No products match your current search or filter.'
                  )}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const imgSource = getCategoryImage(item.category, item.image);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                          {typeof imgSource === 'string' && imgSource.startsWith('http') ? (
                            <img src={imgSource} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.25rem' }}>{imgSource}</span>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{item.name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{item.supplierName}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>£{Number(item.price).toFixed(2)} / {item.unit}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{item.lastPurchased}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button className="btn-primary" onClick={() => handleBuyAgain(item)} style={{ padding: '0.45rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShoppingCart size={14} /> Buy Again
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
