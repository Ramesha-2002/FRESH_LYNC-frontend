import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, CheckCircle2, Clock3, MapPinned,
  Package2, ShieldCheck, Users, ShoppingBag, Star, Leaf,
  Fish, Beef, Wheat, Milk, Box, Lock, ChevronRight, Sparkles,
  Facebook, Linkedin, Mail, Phone, MapPin, Truck, Zap, Headphones,
  User, Sun, Moon
} from 'lucide-react';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import LandingReviews from '../components/LandingReviews';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

// ── Static fallback products shown when DB has nothing ───────────────────────
const FALLBACK_PRODUCTS = [
  { _id: '1', name: 'Atlantic Salmon Fillet', category: 'Fish',       price: 24.99, unit: 'kg', stock: 120, description: 'Fresh, wild-caught Atlantic salmon. Rich omega-3 content.', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', rating: 4.8, reviews: 142 },
  { _id: '2', name: 'Grass-Fed Angus Beef',  category: 'Meat',        price: 32.00, unit: 'kg', stock: 85,  description: 'Prime Angus beef, grass-fed and ethically raised.', image: 'https://images.unsplash.com/photo-1588347818036-c4b8b3a6d6e8?w=400&q=80', rating: 4.9, reviews: 98 },
  { _id: '3', name: 'Organic Curly Kale',    category: 'Vegetables',  price: 2.45,  unit: 'kg', stock: 350, description: 'Certified organic, harvested daily for peak freshness.', image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&q=80', rating: 4.7, reviews: 210 },
  { _id: '4', name: 'Whole Milk (Fresh)',     category: 'Dairy',       price: 1.20,  unit: 'L',  stock: 500, description: 'Full-fat fresh whole milk from local farms.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', rating: 4.6, reviews: 176 },
  { _id: '5', name: 'Mixed Bell Peppers',    category: 'Vegetables',  price: 1.80,  unit: 'kg', stock: 42,  description: 'Vibrant red, yellow, and green bell peppers.', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80', rating: 4.5, reviews: 88 },
  { _id: '6', name: 'Bluefin Tuna Steak',    category: 'Fish',        price: 45.50, unit: 'kg', stock: 30,  description: 'Premium sashimi-grade bluefin tuna, air-flown.', image: 'https://images.unsplash.com/photo-1568727349495-6d4e1dc2c1b5?w=400&q=80', rating: 4.9, reviews: 64 },
  { _id: '7', name: 'Sourdough Wheat Flour', category: 'Grains',      price: 0.95,  unit: 'kg', stock: 800, description: 'Stone-ground, artisan sourdough wheat flour.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80', rating: 4.4, reviews: 320 },
  { _id: '8', name: 'Free-Range Chicken',    category: 'Meat',        price: 8.50,  unit: 'kg', stock: 200, description: 'Hormone-free free-range chicken, whole or portioned.', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80', rating: 4.7, reviews: 155 },
];

const CATEGORY_ICONS = {
  All:        { icon: Sparkles, color: '#6366F1' },
  Fish:       { icon: Fish,     color: '#0EA5E9' },
  Meat:       { icon: Beef,     color: '#EF4444' },
  Vegetables: { icon: Leaf,     color: '#16A34A' },
  Dairy:      { icon: Milk,     color: '#F59E0B' },
  Grains:     { icon: Wheat,    color: '#D97706' },
  Other:      { icon: Box,      color: '#8B5CF6' },
};

const CATEGORIES = ['All', 'Fish', 'Meat', 'Vegetables', 'Dairy', 'Grains'];

const featureItems = [
  { icon: Package2,   title: 'Live inventory control',   description: 'Track stock, batches, and order readiness in one clean workspace.' },
  { icon: ShieldCheck, title: 'Cold-chain confidence',   description: 'Keep quality visible from dispatch to doorstep with monitored handoffs.' },
  { icon: Leaf,        title: 'Sri Lankan Fresh Imports', description: 'Direct sourcing of premium Sri Lankan goods—including wild-caught seafood, organic spices, and tropical fruits—delivered in peak condition.' },
  { icon: Wheat,       title: 'Sustainable Sourcing',     description: 'Support for eco-friendly farming practices and carbon-neutral logistics, reducing food miles and waste.' },
];

const processItems = [
  { title: 'Order',    description: 'Suppliers and buyers stay aligned through a simple, transparent order flow.' },
  { title: 'Dispatch', description: 'Lorries and routes are coordinated with clear timing and live updates.' },
  { title: 'Deliver',  description: 'Every stop is visible so fresh products arrive on time and in peak condition.' },
];

const trustPoints = ['Fresh produce', 'Meat & seafood', 'Route visibility', 'Team access'];

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onBuy }) {
  const [hovered, setHovered] = useState(false);
  const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock < 50 ? 'Low Stock' : 'In Stock';
  const stockColor  = product.stock === 0 ? '#DC2626' : product.stock < 50 ? '#D97706' : '#16A34A';
  const catMeta = CATEGORY_ICONS[product.category] || CATEGORY_ICONS.Other;
  const CatIcon = catMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #F1F5F9',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#F8FAFC' }}>
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={48} style={{ color: '#CBD5E1' }} />
          </div>
        )}
        {/* Category badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'white', borderRadius: 8,
          padding: '0.3rem 0.65rem',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.72rem', fontWeight: 700, color: catMeta.color,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}>
          <CatIcon size={12} /> {product.category}
        </div>
        {/* Stock badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: product.stock < 50 && product.stock > 0 ? '#FEF9C3' : product.stock === 0 ? '#FEE2E2' : '#DCFCE7',
          color: stockColor, borderRadius: 6,
          padding: '0.25rem 0.55rem',
          fontSize: '0.68rem', fontWeight: 700,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          {stockStatus}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', lineHeight: 1.3, color: '#0F172A' }}>
          {product.name}
        </h3>

        {product.description && (
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.75rem', lineHeight: 1.5, flexGrow: 1,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}

        {/* Rating */}
        {product.rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12} fill={s <= Math.round(product.rating) ? '#F59E0B' : 'none'}
                style={{ color: '#F59E0B' }} />
            ))}
            <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: '0.2rem' }}>
              {product.rating.toFixed(1)} ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857' }}>
              £{Number(product.displayPrice || product.sellingPrice || product.price).toFixed(2)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginLeft: '0.3rem' }}>/ {product.unit}</span>
          </div>
          <button
            onClick={() => onBuy(product)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: product.stock === 0 ? '#E5E7EB' : '#047857',
              color: product.stock === 0 ? '#9CA3AF' : 'white',
              border: 'none', borderRadius: 8,
              padding: '0.5rem 0.9rem',
              fontSize: '0.8rem', fontWeight: 700,
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            {product.stock === 0 ? 'Sold out' : <><ShoppingBag size={14} /> Buy now</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Login Gate Modal ──────────────────────────────────────────────────────────
function LoginGateModal({ product, onClose, onLogin }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20,
          padding: '2.5rem', maxWidth: 420, width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #047857, #065F46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Lock size={28} color="white" />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0F172A' }}>
          Sign in to purchase
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          You've selected <strong style={{ color: '#047857' }}>{product?.name}</strong>.
        </p>
        <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Create a free account or log in to start ordering fresh produce directly from verified suppliers.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
          <button
            onClick={onLogin}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: 12,
              background: 'linear-gradient(135deg, #047857, #065F46)',
              color: 'white', fontWeight: 700, fontSize: '0.95rem',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            Log in to buy <ArrowRight size={18} />
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: 12,
              background: '#F8FAFC', color: '#64748B', fontWeight: 600,
              border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Continue browsing
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const getAvatarUrl = (avatar) => {
  if (!avatar) return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100";
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendUrl}${normalizedAvatar}`;
};

// ── CountUp Animation Component ──────────────────────────────────────────────
const CountUp = ({ end, duration = 1.8 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const domRef = React.useRef(null);
  const intervalRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Entering viewport — restart the animation
          setCount(0);
          setHasStarted(true);
        } else {
          // Leaving viewport — clear any running animation and reset
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setCount(0);
          setHasStarted(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentEl = domRef.current;
    if (currentEl) observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const endStr = end.toString();
    const numericTarget = parseFloat(endStr.replace(/[^\d.]/g, ''));

    if (isNaN(numericTarget)) {
      setCount(numericTarget);
      return;
    }

    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    intervalRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const current = Math.round(easeProgress * numericTarget);

      if (frame >= totalFrames) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCount(numericTarget);
      } else {
        setCount(current);
      }
    }, 1000 / 60);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [end, duration, hasStarted]);

  const endStr = end.toString();
  const isK = endStr.includes('K');
  const isPercent = endStr.includes('%');
  const hasPlus = endStr.includes('+');

  let displayValue = count.toLocaleString();
  if (isK) displayValue += 'K';
  if (isPercent) displayValue += '%';
  if (hasPlus) displayValue += '+';

  return (
    <span
      ref={domRef}
      style={{
        fontSize: 'inherit',
        color: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
      }}
    >
      {displayValue}
    </span>
  );
};


// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [products, setProducts]       = useState([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleJumpTo = (targetId) => (event) => {
    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Fetch products from backend (public endpoint)
  useEffect(() => {
    const load = async () => {
      try {
        const backendApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${backendApiUrl}/products?limit=8&page=1`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list.length > 0 ? list : FALLBACK_PRODUCTS);
      } catch {
        setProducts(FALLBACK_PRODUCTS);
      }
      setLoadingProds(false);
    };
    load();
  }, []);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleBuy = (product) => {
    if (product.stock === 0) return;
    setSelectedProduct(product);
  };

  return (
    <div className="landing-page">
      <SEO title="Home" />

      {/* Login Gate Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <LoginGateModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onLogin={() => navigate('/login')}
          />
        )}
      </AnimatePresence>

      {/* ── Nav ── */}
      <header className="landing-header">
        <nav className="landing-nav">
          <a className="brand-mark" href="#top" onClick={handleJumpTo('top')}>
            <img src="/newlogo.png" alt="FreshLync" className="brand-logo" />
          </a>
          <div className="landing-nav-links">
            <a href="#top"        onClick={handleJumpTo('top')} className="active">Home</a>
            {!(user?.role === 'supplier') && <a href="#marketplace" onClick={handleJumpTo('marketplace')}>Marketplace</a>}
            <a href="#about"      onClick={handleJumpTo('about')}>About</a>
            <a href="#contact"    onClick={handleJumpTo('contact')}>Contact</a>
          </div>
          {isAuthenticated ? (
            <div className="landing-auth-nav-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="nav-login-button" 
                onClick={() => {
                  if (user?.role === 'admin') navigate('/admin');
                  else if (user?.role === 'supplier') navigate('/dashboard');
                  else navigate('/marketplace');
                }}
                style={{ background: '#047857', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <User size={16} /> {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'supplier' ? 'Supplier Portal' : 'Marketplace'}
              </button>
              <div 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => {
                  if (user?.role === 'admin') navigate('/admin/profile');
                  else if (user?.role === 'supplier') navigate('/dashboard/profile');
                  else navigate('/setup/profile');
                }}
                title="View Profile"
              >
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', border: '2px solid #047857' }}>
                  <img src={getAvatarUrl(user?.avatar)} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <button 
                onClick={logout} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748B', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  padding: '0.4rem 0.6rem'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="nav-login-button" onClick={() => navigate('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} /> Login
              </button>
            </div>
          )}
        </nav>
      </header>

      <main id="top">
        {/* ── Hero ── */}
        <section className="hero-section">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Smart distribution. Fresh connection.
            </div>
            <h1>
              Move fresh goods <br/>
              with a brand <br/>
              that <span style={{ color: 'var(--color-primary)' }}>delivers.</span>
            </h1>
            <p className="hero-description">
              FreshLync connects verified suppliers with buyers through a modern
              distribution platform — live routing, instant inventory, and a seamless
              ordering experience.
            </p>

            <div className="hero-actions">
              <button className="primary-action" onClick={() => navigate('/login')}>
                Get started <ArrowRight size={18} />
              </button>
              <a className="secondary-action" href="#marketplace" onClick={handleJumpTo('marketplace')}>
                <ShoppingBag size={18} /> Browse products
              </a>
            </div>

            <div className="benefits-row">
              <div className="benefit-item">
                <div className="benefit-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div className="benefit-text">
                  <h3>Verified & trusted</h3>
                  <p>Quality suppliers you can rely on</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon-wrapper">
                  <Truck size={20} />
                </div>
                <div className="benefit-text">
                  <h3>Live tracking</h3>
                  <p>Real-time updates every step</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon-wrapper">
                  <Zap size={20} />
                </div>
                <div className="benefit-text">
                  <h3>Faster delivery</h3>
                  <p>Optimized routes on every order</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon-wrapper">
                  <Headphones size={20} />
                </div>
                <div className="benefit-text">
                  <h3>Dedicated support</h3>
                  <p>We're here to help you succeed</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            aria-hidden="true"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="hero-visual-container">
              <div className="hero-visual-bg" />
              
              {/* Floating map path pins */}
              <div className="map-path-overlay">
                <svg viewBox="0 0 500 200" className="route-svg" fill="none" stroke="rgba(34, 197, 94, 0.28)" strokeWidth="6" strokeDasharray="8 6">
                  <path d="M 50 150 Q 150 180 220 120 T 380 90 T 480 50" />
                </svg>
                <div className="map-pin pin-1" style={{ left: '44%', top: '60%', position: 'absolute' }}><MapPin size={18} color="#f25c54" fill="#f25c54" /></div>
                <div className="map-pin pin-2" style={{ left: '10%', top: '75%', position: 'absolute' }}><MapPin size={18} color="#15803d" fill="#15803d" /></div>
              </div>

              <img src="/hero-truck.png" alt="FreshLync Delivery" className="hero-truck-image" />
              
              {/* Floating Card 1: Live ETA */}
              <div className="floating-card eta-card">
                <span className="card-label">Live ETA</span>
                <span className="eta-time">28 min</span>
                <span className="eta-dest">To Downtown Market</span>
                <div className="eta-chart">
                  <svg viewBox="0 0 100 30" width="100%" height="30" fill="none" stroke="#22C55E" strokeWidth="2">
                    <path d="M0,25 C20,25 30,5 50,15 C70,25 80,10 100,2" />
                    <circle cx="100" cy="2" r="3" fill="#22C55E" />
                  </svg>
                </div>
                <span className="eta-status"><span className="status-dot"></span>On time</span>
              </div>

              {/* Floating Card 2: Route Progress */}
              <div className="floating-card progress-card">
                <h3>Route Progress</h3>
                <ul className="progress-steps">
                  <li className="step completed">
                    <span className="step-check">✓</span> 
                    <div className="step-info"><strong>Pickup</strong><span>09:10 AM</span></div>
                  </li>
                  <li className="step completed">
                    <span className="step-check">✓</span> 
                    <div className="step-info"><strong>In Transit</strong><span>09:35 AM</span></div>
                  </li>
                  <li className="step active">
                    <span className="step-dot"></span> 
                    <div className="step-info"><strong>Out for Delivery</strong><span>09:50 AM</span></div>
                  </li>
                  <li className="step pending">
                    <span className="step-circle"></span> 
                    <div className="step-info"><strong>Delivered</strong><span>--:--</span></div>
                  </li>
                </ul>
              </div>

              {/* Floating Card 3: Small Product Card */}
              <div className="floating-card product-card-float">
                <div className="prod-header">
                  <img src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=100&q=80" alt="Vegetables" className="prod-img" />
                  <div className="prod-meta">
                    <strong>Fresh Vegetables</strong>
                    <span>24 kg</span>
                    <span className="stock-badge">In Stock</span>
                  </div>
                </div>
                <button className="order-now-btn" onClick={(e) => { handleJumpTo('marketplace')(e); }}><ShoppingBag size={13} /> Order now</button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <section className="stats-bar-section">
          <div className="stats-bar-container">
            <div className="stats-col trust-col">
              <span>Trusted by businesses across the region</span>
              <div className="avatar-group">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80" alt="User" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="User" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" alt="User" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" alt="User" />
                <span className="avatar-badge">+<CountUp end="1,250" /></span>
              </div>
            </div>
            <div className="stats-col">
              <strong><CountUp end="1,250+" /></strong>
              <span>Verified Suppliers</span>
            </div>
            <div className="stats-col">
              <strong><CountUp end="8,500+" /></strong>
              <span>Happy Buyers</span>
            </div>
            <div className="stats-col">
              <strong><CountUp end="25K+" /></strong>
              <span>Orders Delivered</span>
            </div>
            <div className="stats-col">
              <strong><CountUp end="98%" /></strong>
              <span>On-time Delivery</span>
            </div>
          </div>
        </section>

        {/* ── Marketplace Preview ── */}
        {!(user?.role === 'supplier') && (
          <section id="marketplace" style={{
            padding: '5rem 2rem',
            background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#DCFCE7', color: '#047857',
                  padding: '0.4rem 1rem', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  <Leaf size={13} /> Live Marketplace
                </span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                  Fresh produce, direct from<br />verified suppliers
                </h2>
                <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: 520, margin: '0 auto 0' }}>
                  Browse our full catalogue of premium fish, meat, vegetables, dairy, and grains.
                  <span style={{ color: '#047857', fontWeight: 600 }}> Sign in to place orders.</span>
                </p>
              </motion.div>

              {/* Category Filters */}
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const meta = CATEGORY_ICONS[cat];
                  const Icon = meta.icon;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1.1rem', borderRadius: 999,
                        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        background: isActive ? meta.color : 'white',
                        color: isActive ? 'white' : meta.color,
                        border: `2px solid ${meta.color}`,
                        boxShadow: isActive ? `0 4px 12px ${meta.color}44` : 'none',
                      }}
                    >
                      <Icon size={14} /> {cat}
                    </button>
                  );
                })}
              </div>

              {/* Products Grid */}
              {loadingProds ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
                  <div style={{
                    width: 40, height: 40, border: '3px solid #E2E8F0',
                    borderTopColor: '#047857', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
                  }} />
                  Loading fresh products…
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
                  <Box size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <div>No products in this category yet.</div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2.5rem',
                }}>
                  {filtered.slice(0, 8).map(product => (
                    <ProductCard key={product._id} product={product} onBuy={handleBuy} />
                  ))}
                </div>
              )}

              {/* CTA Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'linear-gradient(135deg, #047857 0%, #065F46 60%, #1E3A5F 100%)',
                  borderRadius: 20,
                  padding: '2.5rem 3rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '1.5rem',
                  boxShadow: '0 8px 32px rgba(4,120,87,0.25)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Lock size={16} color="#86EFAC" />
                    <span style={{ color: '#86EFAC', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Buyers only
                    </span>
                  </div>
                  <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                    Ready to place your order?
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                    Create a free account and start buying directly from verified suppliers with real-time stock.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      padding: '0.85rem 2rem', borderRadius: 12,
                      background: 'white', color: '#047857',
                      fontWeight: 700, fontSize: '0.95rem',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    Log in to buy <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    style={{
                      padding: '0.85rem 1.75rem', borderRadius: 12,
                      background: 'rgba(255,255,255,0.12)',
                      color: 'white',
                      fontWeight: 600, fontSize: '0.9rem',
                      border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
                    }}
                  >
                    Create account
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── Reviews ── */}
        <LandingReviews />

        {/* ── Features ── */}
        <section className="landing-section landing-section-muted" id="about">
          <div className="section-heading">
            <span className="section-kicker">Global & Sustainable</span>
            <h2>Connecting global supply chains with a focus on fresh Sri Lankan produce and sustainability.</h2>
            <p>
              We specialize in connecting premium suppliers, including direct imports of fresh Sri Lankan foods, 
              to local markets through an eco-conscious, temperature-controlled distribution network.
            </p>
          </div>
          <div className="feature-grid">
            {featureItems.map(({ icon: Icon, title, description }, index) => (
              <motion.article
                key={title}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="feature-icon"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ── Process ── */}
        <section className="landing-section">
          <div className="split-content">
            <motion.div
              className="split-copy"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-kicker">Flow</span>
              <h2>Simple order movement from supplier to delivery lorry.</h2>
              <p>
                Keep the experience focused: one brand story, one clear route, and a visual system
                that makes the movement of goods easy to understand at a glance.
              </p>
            </motion.div>
            <div className="process-list">
              {processItems.map((item, index) => (
                <motion.article
                  key={item.title}
                  className="process-item"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="process-step">0{index + 1}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="landing-footer" id="contact">
          <div className="footer-container">
            <div className="footer-grid-layout">
              {/* Brand Column */}
              <div className="footer-col brand-col">
                <img src="/footerlogo.png" alt="FreshLync" className="footer-logo" />
                <p className="footer-brand-desc">
                  Smart distribution. Fresh connection. Connecting verified suppliers with buyers through real-time tracking, live logistics, and a seamless supply chain.
                </p>
                <div className="footer-socials">
                  <a href="#" className="social-link" aria-label="Facebook">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="social-link" aria-label="LinkedIn">
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="social-link" aria-label="WhatsApp">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.058 5.286 5.343 0 11.839 0c3.146.001 6.105 1.225 8.33 3.452a11.666 11.666 0 0 1 3.45 8.328c-.002 6.552-5.286 11.837-11.786 11.837-2.002-.001-3.973-.515-5.727-1.498L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.407 1.46h.007c5.68 0 10.3-4.607 10.302-10.29A10.119 10.119 0 0 0 19.33 3.23a10.147 10.147 0 0 0-7.49-3.109c-5.686 0-10.307 4.61-10.309 10.29a10.21 10.21 0 0 0 1.565 5.358l-.99 3.616 3.702-.971zm11.233-7.558c-.309-.154-1.829-.902-2.112-1.004-.283-.104-.49-.154-.695.154-.206.309-.798 1.004-.978 1.207-.18.204-.36.23-.669.077-1.127-.565-1.933-.974-2.695-2.28-.19-.325.19-.302.544-1.007.093-.188.046-.353-.023-.507-.069-.154-.695-1.674-.952-2.293-.25-.601-.504-.519-.695-.529-.18-.01-.386-.01-.592-.01-.206 0-.54.077-.824.386-.283.309-1.082 1.057-1.082 2.578 0 1.52 1.107 2.99 1.262 3.2 0 .02 2.132 3.256 5.166 4.568 2.527 1.093 3.042.875 3.593.824.55-.05 1.829-.748 2.086-1.468.257-.72.257-1.338.18-1.468-.077-.13-.283-.206-.592-.36z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Navigation Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">Navigation</h4>
                <ul className="footer-col-links">
                  <li><a href="#top" onClick={handleJumpTo('top')}>Home</a></li>
                  {!(user?.role === 'supplier') && (
                    <li><a href="#marketplace" onClick={handleJumpTo('marketplace')}>Marketplace</a></li>
                  )}
                  <li><a href="#about" onClick={handleJumpTo('about')}>About Us</a></li>
                  <li><a href="#contact" onClick={handleJumpTo('contact')}>Contact</a></li>
                </ul>
              </div>

              {/* Portals Column */}
              <div className="footer-col">
                <h4 className="footer-col-title">Portals</h4>
                <ul className="footer-col-links">
                  <li><button type="button" onClick={() => navigate('/login')}>Login</button></li>
                  <li><button type="button" onClick={() => navigate('/register')}>Register</button></li>
                  <li><button type="button" onClick={() => navigate(user?.role === 'supplier' ? '/dashboard' : '/marketplace')}>Dashboard</button></li>
                </ul>
              </div>

              {/* Newsletter Column */}
              <div className="footer-col newsletter-col">
                <h4 className="footer-col-title">Stay Updated</h4>
                <p className="newsletter-desc">Subscribe to our newsletter for the latest supply chain insights and product updates.</p>
                <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="Enter your email" required className="newsletter-input" />
                  <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="landing-footer-meta">
              <span className="copyright-text">© {new Date().getFullYear()} FreshLync. All rights reserved.</span>
              <div className="footer-meta-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <span className="footer-slogan">Smart distribution for fresh supply chains</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
