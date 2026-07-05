import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck, MessageCircle, BarChart3, Users, Loader } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useNotification } from '../../context/NotificationContext';
import SEO from '../../components/SEO';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminReviews() {
  const { showToast } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAllReviews(page, 20, statusFilter);
      setReviews(res.reviews || []);
      setTotalPages(res.pages || 1);
      
      const statsRes = await reviewService.getAdminReviewStats();
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch reviews', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await reviewService.updateReviewStatus(id, { status });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      showToast(`Review marked as ${status}`, 'success');
      
      // refresh stats
      const statsRes = await reviewService.getAdminReviewStats();
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to update review status', 'error');
    }
  };

  const handleToggleFeatured = async (id, featured) => {
    try {
      await reviewService.updateReviewStatus(id, { featured: !featured });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, featured: !featured } : r));
      showToast(featured ? 'Review unfeatured' : 'Review featured', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update featured status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      showToast('Review deleted', 'success');
      
      // refresh stats
      const statsRes = await reviewService.getAdminReviewStats();
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete review', 'error');
    }
  };

  const statusColors = {
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444'
  };

  return (
    <div className="admin-page">
      <SEO title="Admin | Reviews Moderation" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Review Moderation</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Approve, feature, and manage customer testimonials.</p>
        </div>
      </div>

      {/* Analytics Panel */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
              <MessageCircle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Reviews</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{stats.totalReviews}</div>
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Pending Moderation</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{stats.pendingReviews}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Star size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Approved</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{stats.approvedReviews}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB2777' }}>
              <BarChart3 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Avg Rating</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{stats.averageRating}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Filter Status:</span>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button 
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{ 
              padding: '0.4rem 1rem', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              background: statusFilter === status ? 'var(--color-primary)' : '#F1F5F9',
              color: statusFilter === status ? 'white' : 'var(--color-text-muted)',
              border: 'none', transition: 'all 0.2s'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner fullPage={false} message="Loading reviews..." />
        ) : reviews.length === 0 ? (
          <EmptyState icon={MessageCircle} title="No reviews found" subtitle="There are no reviews matching your filter." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: '#FAFAFA' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Reviewer</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rating</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Review</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--color-border)', background: r.featured ? '#F8FAFC' : 'white' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{r.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.companyName || r.userRole}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? '#F59E0B' : 'none'} color="#F59E0B" />)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', maxWidth: 300 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>{r.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.review}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                        background: `${statusColors[r.status]}15`, color: statusColors[r.status]
                      }}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                      {r.featured && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5' }}>★ Featured</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {r.status !== 'approved' && (
                          <button onClick={() => handleUpdateStatus(r._id, 'approved')} title="Approve" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#D1FAE5', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={16} /></button>
                        )}
                        {r.status !== 'rejected' && (
                          <button onClick={() => handleUpdateStatus(r._id, 'rejected')} title="Reject" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={16} /></button>
                        )}
                        {r.status === 'approved' && (
                          <button onClick={() => handleToggleFeatured(r._id, r.featured)} title={r.featured ? "Unfeature" : "Feature"} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: r.featured ? '#E0E7FF' : '#F1F5F9', color: r.featured ? '#4F46E5' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={16} fill={r.featured ? '#4F46E5' : 'none'} /></button>
                        )}
                        <button onClick={() => handleDelete(r._id)} title="Delete" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${n === page ? 'var(--color-primary)' : 'var(--color-border)'}`, background: n === page ? 'var(--color-primary)' : 'white', color: n === page ? 'white' : 'var(--color-text-main)', fontWeight: 700, cursor: 'pointer' }}>{n}</button>
          ))}
        </div>
      )}
    </div>
  );
}
