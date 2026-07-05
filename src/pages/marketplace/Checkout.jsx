import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building2, Truck, ChevronRight, Loader, Info, HelpCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'bank', label: 'Bank Transfer', icon: Building2 },
  { id: 'net30', label: 'Net 30 Invoice', icon: Truck },
];

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', price: 0, desc: '3-5 business days' },
  { id: 'express', label: 'Express Cold Chain Delivery', price: 15.00, desc: '1-2 days, temperature controlled' },
  { id: 'priority', label: 'Priority Delivery', price: 25.00, desc: 'Next-day priority dispatcher' }
];

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

export default function Checkout() {
  const navigate     = useNavigate();
  const { showToast } = useNotification();
  const { cart: cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [delivery, setDelivery] = useState({
    firstName: '', lastName: '', company: '', email: '',
    address: '', city: '', postcode: '', country: 'United Kingdom',
  });
  const [paymentSlip, setPaymentSlip] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handlePaymentMethodSelect = (methodId) => {
    if (methodId === 'bank' || methodId === 'net30') {
      setPayMethod(methodId);
    } else {
      showToast("Credit / Debit Card payments are currently unavailable. Please choose Bank Transfer or Net 30 Invoice.", "info");
      setPayMethod('bank');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.", "error");
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, JPEG, PNG, and PDF formats are accepted.", "error");
      return;
    }
    setIsUploading(true);
    try {
      const res = await orderService.uploadPaymentSlip(file);
      setPaymentSlip(res.filePath);
      showToast("Payment slip uploaded successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload payment slip.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.", "error");
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, JPEG, PNG, and PDF formats are accepted.", "error");
      return;
    }
    setIsUploading(true);
    try {
      const res = await orderService.uploadPaymentSlip(file);
      setPaymentSlip(res.filePath);
      showToast("Payment slip uploaded successfully!", "success");
    } catch (err) {
      showToast("Failed to upload payment slip.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Enterprise additions
  const [shipping, setShipping] = useState('standard');
  const [allowSubstitutions, setAllowSubstitutions] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFreq, setRecurringFreq] = useState('weekly');
  const [templateName, setTemplateName] = useState('');

  const setD = (k, v) => setDelivery(p => ({ ...p, [k]: v }));
  const inputStyle = { width: '100%', padding: '0.7rem 0.875rem', borderRadius: 8, border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-text-main)' };

  // Calculate totals
  const shippingPrice = SHIPPING_OPTIONS.find(s => s.id === shipping)?.price || 0;
  const orderTotal = cartTotal + shippingPrice;

  // MOQ Warnings
  const moqWarnings = cartItems.filter(item => item.minOrder && item.quantity < item.minOrder);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) { setError('Your cart is empty.'); return; }
    setLoading(true); setError('');
    try {
      const items = cartItems.map(item => ({
        product:  item.id || item._id,
        name:     item.name,
        price:    parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
        quantity: item.quantity,
        unit:     item.unit || 'kg',
      }));

      // Serialize shipping and substitution preferences inside order notes
      const notesPayload = JSON.stringify({
        shippingOption: shipping,
        allowSubstitutions: allowSubstitutions,
        isRecurring: isRecurring,
        recurringFrequency: isRecurring ? recurringFreq : null,
        templateName: isRecurring ? (templateName || 'Auto Reorder Template') : null
      });

      // Save recurring template locally
      if (isRecurring) {
        const templates = JSON.parse(localStorage.getItem('freshlync_recurring_orders') || '[]');
        const newTemplate = {
          id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
          name: templateName || 'Weekly Produce Restock',
          frequency: recurringFreq,
          items: cartItems.map(item => ({
            id: item.id || item._id,
            name: item.name,
            price: parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
            quantity: item.quantity,
            unit: item.unit || 'kg',
            image: item.image,
            supplierName: user?.role === 'buyer' ? 'FreshLync' : (item.supplierName || 'Supplier')
          })),
          nextDelivery: recurringFreq === 'weekly' ? 'Next Monday' : '1st of Next Month',
          active: true
        };
        templates.push(newTemplate);
        localStorage.setItem('freshlync_recurring_orders', JSON.stringify(templates));
        showToast('Recurring order schedule template saved successfully!', 'success');
      }

      const order = await orderService.placeOrder({ items, delivery, paymentMethod: payMethod, notes: notesPayload, paymentSlip });
      clearCart();
      showToast('Order placed successfully.', 'success');
      navigate('/marketplace/order-success', { state: { orderId: order._id, total: order.total + shippingPrice } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      showToast(err.response?.data?.message || 'Failed to place order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deliveryComplete = delivery.firstName && delivery.lastName && delivery.email && delivery.address && delivery.city && delivery.postcode;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem' }}>
      <SEO title="Checkout" />
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Checkout</h2>

      {/* Steps */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem' }}>
        {['Delivery & Shipping', 'Payment', 'Review & Confirm'].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > i ? 'var(--color-primary)' : step === i + 1 ? 'var(--color-primary)' : '#E2E8F0', color: step >= i + 1 ? 'white' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{i + 1}</div>
              <span style={{ fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontSize: '0.875rem' }}>{s}</span>
            </div>
            {i < 2 && <ChevronRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Steps */}
        <div>
          {step === 1 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Delivery Address</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label style={labelStyle}>First Name *</label><input style={inputStyle} value={delivery.firstName} onChange={e => setD('firstName', e.target.value)} required /></div>
                  <div><label style={labelStyle}>Last Name *</label><input style={inputStyle} value={delivery.lastName} onChange={e => setD('lastName', e.target.value)} required /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Company</label><input style={inputStyle} value={delivery.company} onChange={e => setD('company', e.target.value)} placeholder="(optional)" /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" value={delivery.email} onChange={e => setD('email', e.target.value)} required /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Address *</label><input style={inputStyle} value={delivery.address} onChange={e => setD('address', e.target.value)} required /></div>
                  <div><label style={labelStyle}>City *</label><input style={inputStyle} value={delivery.city} onChange={e => setD('city', e.target.value)} required /></div>
                  <div><label style={labelStyle}>Postcode *</label><input style={inputStyle} value={delivery.postcode} onChange={e => setD('postcode', e.target.value)} required /></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Country</label><input style={inputStyle} value={delivery.country} onChange={e => setD('country', e.target.value)} /></div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Shipping Options</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {SHIPPING_OPTIONS.map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: `2px solid ${shipping === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 10, background: shipping === opt.id ? '#f0fdf4' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <input type="radio" name="shipping" checked={shipping === opt.id} onChange={() => setShipping(opt.id)} style={{ accentColor: 'var(--color-primary)', width: '1.1rem', height: '1.1rem' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{opt.label}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: shipping === opt.id ? 'var(--color-primary)' : 'var(--color-text-main)' }}>{opt.price === 0 ? 'Free' : `£${opt.price.toFixed(2)}`}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Substitution Preference</h3>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 10, background: '#f8fafc', cursor: 'pointer' }}>
                  <input type="checkbox" checked={allowSubstitutions} onChange={(e) => setAllowSubstitutions(e.target.checked)} style={{ accentColor: 'var(--color-primary)', width: '1.2rem', height: '1.2rem', marginTop: '0.15rem' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>Allow Product Substitutions</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginTop: '0.15rem' }}>
                      If fresh wholesale items run out of stock during packaging, replace them automatically with high-quality alternatives based on our platform matching rules (e.g. organic tomatoes for greenhouse tomatoes of equivalent value). Turn off to receive refunds instead.
                    </div>
                  </div>
                </label>
              </div>

              <button className="btn-primary" disabled={!deliveryComplete} onClick={() => setStep(2)} style={{ marginTop: '0.5rem', width: '100%', opacity: deliveryComplete ? 1 : 0.6 }}>Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.id} type="button" onClick={() => handlePaymentMethodSelect(m.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 10, border: `2px solid ${payMethod === m.id ? 'var(--color-primary)' : 'var(--color-border)'}`, background: payMethod === m.id ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <m.icon size={22} style={{ color: payMethod === m.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {payMethod === 'bank' && (
                <div style={{ marginTop: '1.5rem', background: '#F8FAFC', borderRadius: 10, padding: '1.25rem', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>Bank Transfer Details</h4>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155', marginBottom: '1rem' }}>
                    <div><strong>Bank Name:</strong> FreshLync Central Bank</div>
                    <div><strong>Account Name:</strong> FreshLync Ltd</div>
                    <div><strong>Account Number:</strong> 9876 5432 1098</div>
                    <div><strong>Branch:</strong> London B2B Operations</div>
                    <div><strong>Reference:</strong> Order ID</div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#FEF3C7', color: '#92400E', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>
                      ⚠️ Please include your Order ID as the payment reference when making the transfer.
                    </div>
                  </div>

                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>Upload Payment Slip / Proof of Payment</h4>
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                      border: '2px dashed var(--color-border)',
                      borderRadius: 8,
                      padding: '1.5rem',
                      textAlign: 'center',
                      background: 'white',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf" 
                      onChange={handleFileUpload} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                    />
                    {isUploading ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Uploading slip...</div>
                    ) : paymentSlip ? (
                      <div style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 600 }}>
                        ✓ Payment slip uploaded successfully!
                        <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{paymentSlip}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Drag & Drop or Click to Upload Payment Slip<br/>
                        <span style={{ fontSize: '0.75rem' }}>(Accepts JPG, JPEG, PNG, PDF up to 10MB)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {payMethod === 'net30' && (
                <div style={{ marginTop: '1.5rem', background: '#F0FDF4', borderRadius: 10, padding: '1.25rem', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={18} /> B2B Net 30 Credit Term
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#14532d', lineHeight: 1.5, margin: 0 }}>
                    This order will be processed under your B2B wholesale credit line. No immediate payment is required. 
                    An invoice will be automatically generated and added to your Billing Dashboard, with payment due 30 days from now.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
                <button 
                  className="btn-primary" 
                  onClick={() => setStep(3)} 
                  disabled={payMethod === 'bank' && !paymentSlip}
                  style={{ flex: 2, opacity: (payMethod === 'bank' && !paymentSlip) ? 0.5 : 1 }}
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Review & Confirm</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                        {getProductImageUrl(item) && (
                          <img 
                            src={getProductImageUrl(item)} 
                            alt="" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>×{item.quantity} {item.unit}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>£{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOQ Warnings Area */}
              {moqWarnings.length > 0 && (
                <div style={{ padding: '1rem', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 8, color: '#92400E', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <HelpCircle size={16} /> Minimum Order Quantity (MOQ) Requirements
                  </div>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {moqWarnings.map(item => (
                      <li key={item.id}>
                        <strong>{item.name}</strong> requires MOQ of {item.minOrder} {item.unit || 'kg'} (Cart: {item.quantity} {item.unit || 'kg'})
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '0.5rem', opacity: 0.9 }}>Note: {user?.role === 'buyer' ? 'FreshLync' : 'Suppliers'} may decline orders if their MOQ requirements are not satisfied.</div>
                </div>
              )}

              {/* B2B Scheduling/Recurring setup options */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🔁 Schedule Auto-Reorder (Optional)
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} style={{ accentColor: 'var(--color-primary)', width: '1.1rem', height: '1.1rem' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Set up as recurring scheduled replenishment order</span>
                </label>

                {isRecurring && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid var(--color-border)', animation: 'fadeIn 0.2s ease' }}>
                    <div>
                      <label style={labelStyle}>Reorder Schedule Name</label>
                      <input style={inputStyle} value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Weekly Fruits & Vegs" />
                    </div>
                    <div>
                      <label style={labelStyle}>Frequency</label>
                      <select style={inputStyle} value={recurringFreq} onChange={e => setRecurringFreq(e.target.value)}>
                        <option value="weekly">Weekly (Every Monday)</option>
                        <option value="monthly">Monthly (1st of Month)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 8, marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span>Subtotal</span><span>£{cartTotal?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span>Delivery ({SHIPPING_OPTIONS.find(s => s.id === shipping)?.label})</span>
                    <span>{shippingPrice === 0 ? 'Free' : `£${shippingPrice.toFixed(2)}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <span>Total</span><span>£{orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {error && <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>Back</button>
                  <button className="btn-primary" onClick={handlePlaceOrder} disabled={loading} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                    {loading ? <><Loader size={16} style={{ animation: 'spin 0.75s linear infinite' }} /> Placing Order...</> : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="card" style={{ position: 'sticky', top: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{item.name} ×{item.quantity}</span>
                <span style={{ fontWeight: 600 }}>£{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Delivery</span>
              <span>{shippingPrice === 0 ? 'Free' : `£${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>£{orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
