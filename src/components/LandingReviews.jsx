import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, ShieldCheck, ChevronRight, X, Quote } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { useNotification } from '../context/NotificationContext';

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendUrl}${normalizedAvatar}`;
};

export default function LandingReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          reviewService.getPublicReviews(1, 20),
          reviewService.getReviewStats()
        ]);
        setReviews(reviewsRes.reviews || []);
        setStats(statsRes);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="landing-section" style={{ background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#047857', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading reviews...
        </div>
      </section>
    );
  }

  return (
    <section className="landing-section" style={{ background: '#F8FAFC', padding: '6rem 2rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header & Stats */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#DBEAFE', color: '#1D4ED8', padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Star size={13} fill="#1D4ED8" /> Customer Reviews
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Trusted by the best in the business
          </h2>

          {stats && reviews.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '2rem' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#047857' }}>{stats.averageRating}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Rating</div>
              </div>
              <div style={{ width: 1, background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{stats.totalReviews}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reviews</div>
              </div>
              <div style={{ width: 1, background: '#E2E8F0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>{stats.satisfactionRate}%</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satisfaction Rate</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Reviews Carousel */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <MessageCircle size={48} style={{ color: '#CBD5E1', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No reviews yet</h3>
            <p style={{ color: '#64748B', maxWidth: 400, margin: '0 auto 2rem' }}>Be the first customer to share your experience with FreshLync.</p>
            <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem 2rem', background: '#047857', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
              Share Your Experience
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', margin: '0 -2rem' }}>
            {/* Infinite Scroll Container */}
            <div style={{ overflow: 'hidden', padding: '1rem 0' }}>
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
                style={{ display: 'flex', width: 'fit-content', gap: '1.5rem', padding: '0 2rem' }}
                whileHover={{ animationPlayState: 'paused' }}
              >
                {/* Double the reviews array for seamless infinite scroll */}
                {[...reviews, ...reviews].map((r, i) => (
                  <div key={i} style={{ 
                    width: '350px', background: 'white', padding: '2rem', borderRadius: '24px', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9',
                    display: 'flex', flexDirection: 'column', position: 'relative'
                  }}>
                    <Quote size={40} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#F1F5F9', zIndex: 0 }} />
                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= r.rating ? '#F59E0B' : 'none'} color={s <= r.rating ? '#F59E0B' : '#E2E8F0'} />)}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>{r.title}</h4>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '2rem', position: 'relative', zIndex: 1 }}>"{r.review}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden' }}>
                        {r.profileImage ? <img src={getAvatarUrl(r.profileImage)} alt={r.userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748B' }}>{r.userName.charAt(0)}</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {r.userName} <ShieldCheck size={14} color="#10B981" />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{r.companyName || r.userRole.charAt(0).toUpperCase() + r.userRole.slice(1)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            {/* Fade edges */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '150px', background: 'linear-gradient(to right, #F8FAFC, transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '150px', background: 'linear-gradient(to left, #F8FAFC, transparent)', pointerEvents: 'none' }} />
          </div>
        )}

        {reviews.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <button onClick={() => setIsModalOpen(true)} style={{ padding: '0.85rem 2.5rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: 999, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>
              Share Your Experience
            </button>
          </div>
        )}

        {/* JSON-LD SEO Schema */}
        {stats && reviews.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AggregateRating",
              "itemReviewed": {
                "@type": "Organization",
                "name": "FreshLync"
              },
              "ratingValue": stats.averageRating,
              "reviewCount": stats.totalReviews
            })}
          </script>
        )}
      </div>

      {isModalOpen && <ReviewModal onClose={() => setIsModalOpen(false)} user={user} showToast={showToast} />}
    </section>
  );
}

function ReviewModal({ onClose, user, showToast }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await orderService.getBuyerOrders();
        // Only delivered orders
        const deliveredOrders = res.filter(o => o.status === 'Delivered');
        setOrders(deliveredOrders);
        if (deliveredOrders.length > 0) setSelectedOrder(deliveredOrders[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return showToast('Please select a rating', 'error');
    if (!selectedOrder) return showToast('Please select a completed order', 'error');
    if (!title.trim()) return showToast('Please provide a review title', 'error');
    if (!review.trim()) return showToast('Please provide a detailed review', 'error');

    setSubmitting(true);
    try {
      await reviewService.createReview({
        rating,
        title,
        review,
        orderId: selectedOrder
      });
      showToast('Review submitted successfully! It is pending admin approval.', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: 24, textAlign: 'center', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 64, height: 64, background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#64748B' }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h3>
          <p style={{ color: '#64748B', marginBottom: '2rem' }}>You must be logged in to share a review.</p>
          <button onClick={() => window.location.href='/login'} style={{ width: '100%', padding: '0.85rem', background: '#047857', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Login Now</button>
        </div>
      </div>
    );
  }

  if (loading) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Share Your Experience</h3>
          <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
        </div>

        <div style={{ padding: '2rem' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#EF4444' }}>
                <ShieldCheck size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Completed Orders</h4>
              <p style={{ color: '#64748B' }}>You must have at least one completed (Delivered) order to submit a review. We look forward to hearing from you soon!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Overall Rating</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star 
                      key={s} size={32} 
                      fill={s <= (hoverRating || rating) ? '#F59E0B' : 'none'} 
                      color={s <= (hoverRating || rating) ? '#F59E0B' : '#CBD5E1'} 
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Select Order to Review</label>
                <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '0.95rem' }}>
                  {orders.map(o => (
                    <option key={o._id} value={o._id}>Order #{o._id.substring(o._id.length - 6).toUpperCase()} - {new Date(o.createdAt).toLocaleDateString()}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Review Title</label>
                <input type="text" maxLength={60} value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }} />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Detailed Review</label>
                <textarea maxLength={500} value={review} onChange={e => setReview(e.target.value)} placeholder="Tell us more about the freshness, delivery, and overall service..." style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #E2E8F0', outline: 'none', minHeight: 120, resize: 'vertical', fontSize: '0.95rem', fontFamily: 'inherit' }} />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>{review.length}/500</div>
              </div>

              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', background: '#047857', color: 'white', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
