import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/EmptyState';
import SEO from '../../components/SEO';

const getProductImageUrl = (item) => {
  const imgPath = item.image || item.img || item.imagePath;
  if (!imgPath) return null;
  if (imgPath.startsWith('http') || imgPath.startsWith('data:')) {
    return imgPath;
  }
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
  return `${backendUrl}${normalizedPath}`;
};

const formatItemPrice = (item) => {
  const priceVal = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
  if (isNaN(priceVal)) return item.price;
  return `£${priceVal.toFixed(2)}${item.unit ? ` / ${item.unit}` : ''}`;
};

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: 1000, margin: '0 auto' }}>
      <SEO title="Cart" />

      <button onClick={() => navigate('/marketplace')} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)',
        marginBottom: '2rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <ArrowLeft size={18} /> Continue Shopping
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Shopping Cart</h1>
        {cart.length > 0 && (
          <button onClick={clearCart} style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          subtitle="Browse the marketplace and add fresh products to your order."
          action={() => navigate('/marketplace')}
          actionLabel="Browse Products"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map((item, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                  {getProductImageUrl(item) && (
                    <img 
                      src={getProductImageUrl(item)} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatItemPrice(item)}</p>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => updateQuantity(item.name, item.quantity - 1)} style={{ padding: '0.4rem 0.7rem', background: 'var(--color-background)', border: 'none', cursor: 'pointer' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0.4rem 1rem', fontWeight: 600, minWidth: 36, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.name, item.quantity + 1)} style={{ padding: '0.4rem 0.7rem', background: 'var(--color-background)', border: 'none', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ minWidth: 90, textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                  {formatItemPrice(item)}
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>× {item.quantity}</div>
                </div>

                <button onClick={() => removeFromCart(item.name)} style={{ color: '#DC2626', padding: '0.4rem', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ position: 'sticky', top: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {cart.map((item, idx) => {
                const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.name} × {item.quantity}</span>
                    <span>{isNaN(num) ? item.price : `£${(num * item.quantity).toFixed(2)}`}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span>£{cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Delivery</span>
                <span style={{ color: '#16A34A' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>£{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/marketplace/checkout')}>
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
