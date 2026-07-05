import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Package, Shield, Truck, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import LoadingSpinner from '../../components/LoadingSpinner';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../services/api';

const PRODUCTS = [
  { id: '1', name: 'Atlantic Salmon', price: '£24.99/kg', priceNum: 24.99, img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800', images: ['https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?auto=format&fit=crop&q=80&w=800'], desc: 'Premium grade, sustainably farm-raised in the North Atlantic. Rich in Omega-3 fatty acids and ideal for restaurants, catering, and wholesale buyers.', stock: 'In Stock', stockQty: 850, category: 'Fish', supplier: 'North Atlantic Co.', rating: 4.8, reviews: 124, sku: 'SALM-091', unit: 'per kg', minOrder: 5 },
  { id: '2', name: 'Organic Broccoli', price: '£4.50/lb', priceNum: 4.50, img: 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&q=80&w=800', images: ['https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&q=80&w=800'], desc: 'Certified organic, pesticide-free heads harvested from local sustainable farms.', stock: 'In Stock', stockQty: 320, category: 'Vegetables', supplier: 'GreenEarth Organics', rating: 4.6, reviews: 89, sku: 'BROC-022', unit: 'per lb', minOrder: 10 },
  { id: '3', name: 'Angus Beef', price: '£32.00/kg', priceNum: 32.00, img: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=800', images: ['https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=800'], desc: 'Prime pasture-raised Angus beef. Hand-cut and aged for 21 days for maximum flavour.', stock: 'In Stock', stockQty: 200, category: 'Meat', supplier: 'Highland Meats Ltd', rating: 4.9, reviews: 201, sku: 'BEEF-103', unit: 'per kg', minOrder: 5 },
  { id: '4', name: 'Heirloom Tomatoes', price: '£6.75/lb', priceNum: 6.75, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800'], desc: 'Mixed variety heirloom tomatoes, non-GMO and vine-ripened for peak sweetness.', stock: 'In Stock', stockQty: 180, category: 'Vegetables', supplier: 'FarmFresh Co.', rating: 4.5, reviews: 63, sku: 'TOMA-044', unit: 'per lb', minOrder: 5 },
  { id: '5', name: 'Chilean Seabass', price: '£42.00/kg', priceNum: 42.00, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', images: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800'], desc: 'Wild-caught, MSC certified. Known for its buttery texture and delicate flavour.', stock: 'Low Stock', stockQty: 42, category: 'Fish', supplier: 'Pacific Catch Ltd', rating: 4.9, reviews: 147, sku: 'CBAS-071', unit: 'per kg', minOrder: 3 },
  { id: '6', name: 'Rainbow Carrots', price: '£3.25/ea', priceNum: 3.25, img: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&q=80&w=800', images: ['https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&q=80&w=800'], desc: 'Artisan bundle of purple, orange, and white carrots. Sweet and crunchy profile.', stock: 'In Stock', stockQty: 600, category: 'Vegetables', supplier: 'GreenEarth Organics', rating: 4.4, reviews: 38, sku: 'CARR-012', unit: 'each', minOrder: 12 },
];

export { PRODUCTS };

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={16} fill={i <= Math.round(rating) ? '#FBBF24' : 'none'} style={{ color: '#FBBF24' }} />
      ))}
      <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.25rem' }}>{rating}</span>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          const data = await productService.getProduct(id);
          if (data) {
            const mapped = {
              id: data._id,
              name: data.name,
              price: `£${Number(data.sellingPrice || data.displayPrice || data.price || 0).toFixed(2)}/${data.unit || 'kg'}`,
              priceNum: data.sellingPrice || data.displayPrice || data.price || 0,
              img: getImageUrl(data.image),
              imagePath: data.image || '',
              images: data.image ? [getImageUrl(data.image)] : [],
              desc: data.description || 'No description available.',
              stock: data.stock === 0 ? 'Out of Stock' : (data.stock < 50 ? 'Low Stock' : 'In Stock'),
              stockQty: data.stock || 0,
              category: data.category,
              supplier: user?.role === 'buyer' ? 'FreshLync' : (data.supplierName || (data.supplier && (data.supplier.company || data.supplier.name)) || 'Supplier'),
              rating: data.rating || 0,
              reviews: data.reviews || 0,
              sku: data.sku || '—',
              unit: data.unit || 'kg',
              minOrder: data.minOrder || 1
            };
            setProduct(mapped);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to load dynamic product:", err);
        }
      }
      
      const mock = PRODUCTS.find(p => p.id === id);
      if (mock && user?.role === 'buyer') {
        setProduct({ ...mock, supplier: 'FreshLync' });
      } else {
        setProduct(mock || null);
      }
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading product details..." />;
  }

  if (!product) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceNum,
      unit: product.unit,
      image: product.imagePath || product.img,
      supplierName: product.supplier
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const inCart = cart.find(i => i.name === product.name);

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
      <SEO title={product.name} />

      <button onClick={() => navigate('/marketplace')} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)',
        marginBottom: '2rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <ArrowLeft size={18} /> Back to Marketplace
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Image Gallery */}
        <div>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 380, background: '#f1f5f9' }}>
            {product.images && product.images.length > 0 && product.images[imgIdx] ? (
              <img src={product.images[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)' }}>
                <span style={{ fontSize: '6rem' }}>{product.category === 'Fish' ? '🐟' : product.category === 'Meat' ? '🥩' : '🥬'}</span>
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => Math.max(0, i - 1))} className="img-nav-btn" style={{ left: 12 }}><ChevronLeft size={20} /></button>
                <button onClick={() => setImgIdx(i => Math.min(product.images.length - 1, i + 1))} className="img-nav-btn" style={{ right: 12 }}><ChevronRight size={20} /></button>
              </>
            )}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
              <span style={{ background: product.stock === 'In Stock' ? '#16A34A' : '#F59E0B', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
                {product.stock}
              </span>
            </div>
          </div>
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setImgIdx(i)} style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === imgIdx ? 'var(--color-primary)' : 'transparent'}` }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{product.category}</p>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{product.reviews} reviews</span>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1rem' }}>{product.price}</div>

          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.desc}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'SKU', value: product.sku },
              { label: 'Supplier', value: product.supplier },
              { label: 'Min. Order', value: `${product.minOrder} ${product.unit}` },
              { label: 'Available', value: `${product.stockQty} units` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-background)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Quantity:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '0.5rem 0.9rem', background: 'var(--color-background)', border: 'none', cursor: 'pointer' }}><Minus size={16} /></button>
              <span style={{ padding: '0.5rem 1.25rem', fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ padding: '0.5rem 0.9rem', background: 'var(--color-background)', border: 'none', cursor: 'pointer' }}><Plus size={16} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', background: added ? '#16A34A' : undefined }}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/marketplace/cart')} style={{ padding: '0.75rem 1.25rem' }}>
              View Cart {inCart ? `(${inCart.quantity})` : ''}
            </button>
          </div>

          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { icon: Shield, label: 'Quality Certified' },
              { icon: Truck, label: 'Fast Dispatch' },
              { icon: Package, label: 'Bulk Available' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <Icon size={14} style={{ color: 'var(--color-primary)' }} /> {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
