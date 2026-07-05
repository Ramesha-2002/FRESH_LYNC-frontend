import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Minimize2, Maximize2, Send, Bot, User, Loader, 
  Check, Copy, Star, Bell, ShoppingBag, ArrowRight, ClipboardList, Info
} from 'lucide-react';

const WELCOME_MSG = {
  id: 'welcome',
  role: 'ai',
  isStructured: true,
  responseType: 'general_help',
  responseData: {
    userName: '',
    isWelcome: true
  },
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const QUICK_PROMPTS = [
  'Show all products',
  'Price of cuttlefish',
  'My recent orders',
  'Do I have notifications?',
  'What are the reviews?',
  'How do I track my order?',
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function fetchAIResponse(message) {
  const token = localStorage.getItem('fl_token');
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to get a response.');
  }
  return await res.json();
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('fl_chat');
      return saved ? JSON.parse(saved) : [WELCOME_MSG];
    } catch { return [WELCOME_MSG]; }
  });
  const [typing, setTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try { sessionStorage.setItem('fl_chat', JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, open, minimized]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    
    setInput('');
    
    // 1. Append user message locally
    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      text: msg, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [...prev, userMsg]);
    
    // 2. Fetch response from the backend (Triggered OUTSIDE the state updater to avoid StrictMode double-execution)
    setTyping(true);
    try {
      const resData = await fetchAIResponse(msg);
      
      if (resData.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            isStructured: true,
            responseType: resData.type,
            responseData: resData.data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(resData.message || 'Failed to retrieve a response.');
      }
    } catch (err) {
      console.error('[FreshLync Chat Error]', err);
      const errMsg = err?.message && !err.message.includes('Failed to fetch')
        ? err.message
        : "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: errMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const clearChat = () => { setMessages([WELCOME_MSG]); sessionStorage.removeItem('fl_chat'); };

  // ── RICH ELEMENT RENDERING ──
  const renderChatResponse = (msg) => {
    const { responseType, responseData } = msg;

    if (!responseType || !responseData) {
      return <div style={{ fontSize: '0.85rem' }}>{msg.text}</div>;
    }

    switch (responseType) {
      case 'order_status': {
        const { orderFound, order, recentOrders, error } = responseData;
        
        if (orderFound && order) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📦 Order Status</span>
                <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 600 }}>{order.status}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, flex: 1 }}>ID: {order.orderId.toUpperCase()}</span>
                <button 
                  onClick={() => handleCopy(order.orderId, order.orderId)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                  title="Copy Order ID"
                >
                  {copiedId === order.orderId ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                </button>
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.25rem 0' }}>
                {order.timeline.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.6rem', alignItems: 'start', position: 'relative' }}>
                    {idx < order.timeline.length - 1 && (
                      <div style={{ position: 'absolute', left: 8, top: 18, bottom: -12, width: 2, background: step.completed ? '#22c55e' : '#cbd5e1', zIndex: 1 }} />
                    )}
                    <div style={{ 
                      width: 18, height: 18, borderRadius: '50%', 
                      background: step.error ? '#ef4444' : step.completed ? '#22c55e' : 'white', 
                      border: `2px solid ${step.error ? '#ef4444' : step.completed ? '#22c55e' : '#94a3b8'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: 'white', fontSize: '0.6rem', fontWeight: 700, zIndex: 2
                    }}>
                      {step.completed && !step.error && <Check size={10} strokeWidth={4} />}
                      {step.error && '!'}
                    </div>
                    <div style={{ flex: 1, fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: step.completed ? 700 : 500, color: step.completed ? '#0f172a' : '#64748b' }}>{step.label}</div>
                      {step.time && (
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                          {new Date(step.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Items:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {order.items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.name} × {it.quantity} {it.unit}</span>
                      <span style={{ fontWeight: 600 }}>£{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                <span>Total Amount:</span>
                <span style={{ color: '#15803d', fontSize: '0.9rem' }}>£{order.total.toFixed(2)}</span>
              </div>
            </div>
          );
        } else {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Info size={14} /> {error || 'Order not found.'}
              </div>
              
              {recentOrders && recentOrders.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.4rem', fontWeight: 600 }}>Select one of your recent orders:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {recentOrders.map(o => (
                      <button 
                        key={o.orderId}
                        onClick={() => sendMessage(`status of order ${o.orderId}`)}
                        style={{
                          textAlign: 'left', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, 
                          padding: '0.5rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', color: '#334155',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#15803d'; e.currentTarget.style.background = '#f0fdf4'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                      >
                        <span style={{ fontWeight: 600 }}>#{o.orderId.slice(-8).toUpperCase()}</span>
                        <span style={{ color: '#64748b' }}>£{o.total.toFixed(2)}</span>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.3rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600 }}>{o.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
      }

      case 'product_info': {
        const { product, inStock, alternatives, queryType } = responseData;
        const isPriceQuery = queryType === 'price';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            {product ? (
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.4rem' }}>
                  <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{product.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>{product.category}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Price:</span>
                    <span style={{ fontWeight: 700, color: '#15803d' }}>£{product.price.toFixed(2)} / {product.unit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Stock Level:</span>
                    {inStock ? (
                      <span style={{ fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={12} strokeWidth={3} /> {product.stock} {product.unit} available
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600, color: '#ef4444' }}>❌ Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                😔 I couldn't find a product matching <strong>"{responseData.productName}"</strong> in our active inventory.
              </div>
            )}

            {!inStock && alternatives && alternatives.length > 0 && (
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>Suggested alternatives currently in stock:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {alternatives.slice(0, 3).map((alt, i) => (
                    <div 
                      key={i}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '0.45rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: 8, 
                        background: 'white', fontSize: '0.75rem' 
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#334155' }}>{alt.name}</span>
                      <span style={{ color: '#15803d', fontWeight: 700 }}>£{alt.price.toFixed(2)} / {alt.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'category_search': {
        const { category, products } = responseData;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              📁 Category: {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
            {products && products.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                {products.map((p, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '0.45rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: 8, 
                      background: 'white', fontSize: '0.75rem' 
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{p.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Stock: {p.stock} {p.unit}</div>
                    </div>
                    <span style={{ color: '#15803d', fontWeight: 700 }}>£{p.price.toFixed(2)}/{p.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No products in stock under this category.</div>
            )}
          </div>
        );
      }

      case 'notifications': {
        const { unreadCount, notifications } = responseData;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Bell size={14} style={{ color: '#15803d' }} /> Recent Alerts</span>
              {unreadCount > 0 && <span style={{ fontSize: '0.68rem', background: '#ef4444', color: 'white', padding: '0.05rem 0.4rem', borderRadius: 999, fontWeight: 700 }}>{unreadCount} New</span>}
            </div>
            {notifications && notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: 8, 
                      background: n.read ? 'white' : '#f0fdf4', fontSize: '0.75rem', 
                      borderLeft: `3px solid ${n.read ? '#cbd5e1' : '#15803d'}`, transition: 'all 0.2s' 
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.1rem' }}>{n.title}</div>
                    <div style={{ color: '#64748b', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '0.2rem', textAlign: 'right' }}>
                      {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>You have no notifications.</div>
            )}
          </div>
        );
      }

      case 'reviews': {
        const { averageRating, reviews } = responseData;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>⭐ Testimonials</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" /> {averageRating} / 5.0
              </span>
            </div>
            {reviews && reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ padding: '0.5rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: 8, background: 'white', fontSize: '0.72rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>{r.userName}</span>
                      <span style={{ display: 'flex', gap: '1px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={8} fill={i < r.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </span>
                    </div>
                    {r.companyName && <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '-0.15rem', marginBottom: '0.25rem' }}>{r.companyName}</div>}
                    <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.1rem' }}>"{r.title}"</div>
                    <div style={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.3 }}>{r.review}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No platform reviews yet.</div>
            )}
          </div>
        );
      }

      case 'general_help': {
        const { userName, isWelcome } = responseData;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
              {isWelcome ? (
                <span>Hi! I'm your <strong>FreshLync B2B Assistant</strong> 🥬 How can I help you coordinate your wholesale operations today?</span>
              ) : (
                <span>Hello {userName}! Here is a list of tasks I can help you with in real-time:</span>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>📦 Inventory & Prices</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button onClick={() => sendMessage('Show all products')} style={actionChipStyle}>📋 Show All Products</button>
                <button onClick={() => sendMessage('Price of cuttlefish')} style={actionChipStyle}>💰 Price of Cuttlefish</button>
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '0.3rem' }}>🛒 Orders & Tracking</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button onClick={() => sendMessage('My recent orders')} style={actionChipStyle}>📦 My Recent Orders</button>
                <button onClick={() => sendMessage('How do I track my order?')} style={actionChipStyle}>🚚 Tracking Instructions</button>
              </div>

              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '0.3rem' }}>🔔 Accounts & Reviews</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button onClick={() => sendMessage('Do I have notifications?')} style={actionChipStyle}>🔔 My Alerts</button>
                <button onClick={() => sendMessage('What are the reviews?')} style={actionChipStyle}>⭐ Customer Reviews</button>
              </div>
            </div>
          </div>
        );
      }

      case 'fallback':
      default: {
        const { message, products } = responseData;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>{message || "Here are some of our available products:"}</div>
            {products && products.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {products.map((p, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '0.45rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: 8, 
                      background: 'white', fontSize: '0.75rem' 
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{p.name}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '0.4rem' }}>({p.category})</span>
                    </div>
                    <span style={{ color: '#15803d', fontWeight: 700 }}>£{p.price.toFixed(2)}/{p.unit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }
  };

  const actionChipStyle = {
    background: 'white', border: '1px solid #cbd5e1', borderRadius: '16px',
    padding: '0.3rem 0.6rem', fontSize: '0.72rem', color: '#475569', fontWeight: 500,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: 'all 0.15s'
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 9999,
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #15803d, #1f9d55)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(21, 128, 61, 0.45)',
            animation: 'chatbot-pulse 2.5s ease-in-out infinite',
            transition: 'transform 0.2s',
          }}
          title="Chat with FreshLync AI"
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 9999,
          width: minimized ? 320 : 380,
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15,23,42,0.22)',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'white',
          display: 'flex', flexDirection: 'column',
          animation: 'slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #15803d, #1f9d55)',
            padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={20} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>FreshLync B2B Bot</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} /> Online · Smart Query Engine
              </div>
            </div>
            <button onClick={clearChat} title="Clear chat" style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', fontSize: '0.7rem' }}>Clear</button>
            <button onClick={() => setMinimized(m => !m)} style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
              {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={18} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', minHeight: 340, maxHeight: 400, background: '#f8fafc' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'ai' ? 'linear-gradient(135deg, #15803d, #1f9d55)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {msg.role === 'ai' ? <Bot size={14} style={{ color: 'white' }} /> : <User size={14} style={{ color: '#64748b' }} />}
                    </div>
                    <div style={{ maxWidth: '85%' }}>
                      <div style={{
                        padding: '0.625rem 0.875rem', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #15803d, #1f9d55)' : 'white',
                        color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
                        fontSize: '0.85rem', lineHeight: 1.5,
                        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                        border: msg.role === 'ai' ? '1px solid var(--color-border)' : 'none',
                        width: msg.isStructured ? '270px' : 'auto'
                      }}>
                        {msg.isStructured ? renderChatResponse(msg) : msg.text}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #15803d, #1f9d55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={14} style={{ color: 'white' }} />
                    </div>
                    <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '4px 16px 16px 16px', padding: '0.625rem 1rem', boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {[0, 0.3, 0.6].map(d => (
                          <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', display: 'inline-block', animation: `typing-dot 1.2s ${d}s ease-in-out infinite` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Prompts */}
              <div style={{ padding: '0.625rem 1rem', background: '#f8fafc', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', overflowX: 'auto' }}>
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => sendMessage(p)} style={{ flexShrink: 0, padding: '0.3rem 0.7rem', borderRadius: 999, border: '1px solid var(--color-border)', background: 'white', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '0.875rem 1rem', background: 'white', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about products, order tracking, reviews..."
                  rows={1}
                  style={{ flex: 1, resize: 'none', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.6rem 0.875rem', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4, maxHeight: 100, overflowY: 'auto' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, #15803d, #1f9d55)' : 'var(--color-border)', color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
                >
                  {typing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
