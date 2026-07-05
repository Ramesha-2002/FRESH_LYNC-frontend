import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, BarChart2, Calendar, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';
import LoadingSpinner from '../../components/LoadingSpinner';
import { analyticsService } from '../../services/analyticsService';

export default function Analytics() {
  const [summary, setSummary]     = useState(null);
  const [chart, setChart]         = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getChartData(),
      ]);
      setSummary(s);
      setChart(c);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading analytics..." />;

  // Normalise chart bars: find max revenue, scale heights to 0–250px
  const maxRevenue = Math.max(...chart.map(d => d.revenue || 0), 1);

  return (
    <div>
      <SEO title="Analytics & Reporting" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Analytics & Reporting</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Your real-time supply chain performance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}><RefreshCw size={15} /> Refresh</button>
          <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Calendar size={16} /> Last 6 Months
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            <TrendingUp size={18} /> Revenue (Delivered)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            £{Number(summary?.totalRevenue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ color: '#16A34A', fontSize: '0.875rem', fontWeight: 500 }}>From {summary?.deliveredOrders ?? 0} delivered orders</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            <Activity size={18} /> Fulfillment Rate
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{summary?.fulfillmentRate ?? 0}%</div>
          <div style={{ color: '#16A34A', fontSize: '0.875rem', fontWeight: 500 }}>{summary?.deliveredOrders ?? 0} of {summary?.totalOrders ?? 0} orders delivered</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            <BarChart2 size={18} /> Avg Order Value
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>£{Number(summary?.avgOrderValue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Across {summary?.totalOrders ?? 0} total orders</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card" style={{ minHeight: 380, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Revenue by Month (Last 6 Months)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-primary)', display: 'inline-block' }} /> Revenue</span>
          </div>
        </div>

        {chart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No revenue data yet. Start receiving delivered orders to see your chart.
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 1rem', gap: '0.5rem' }}>
            {chart.map((d, i) => {
              const barH = Math.max(4, (d.revenue / maxRevenue) * 250);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    £{(d.revenue / 1000).toFixed(1)}k
                  </span>
                  <div
                    title={`${d.month}: £${d.revenue.toLocaleString()} (${d.orders} orders)`}
                    style={{ width: '100%', maxWidth: 48, height: `${barH}px`, background: 'var(--color-primary)', borderRadius: '6px 6px 0 0', transition: 'height 0.4s ease', cursor: 'default', opacity: 0.85 }}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
