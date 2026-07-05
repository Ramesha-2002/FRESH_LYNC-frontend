import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import SEO from '../../components/SEO';

export default function MarketplaceAnalytics() {
  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
      <SEO title="Market Trends" />
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Market Trends</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Real-time wholesale pricing and supply insights.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            <Activity size={18} /> Market Volatility Index
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>High</div>
          <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 500 }}>Weather impacts in California</div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            <DollarSign size={18} /> Avg. Transaction Size
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>£4,250</div>
          <div style={{ color: '#16A34A', fontSize: '0.875rem', fontWeight: 500 }}>+12% vs last month</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Top Commodities (7-Day Trend)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>COMMODITY</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>AVG PRICE</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>TREND</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>SUPPLY LEVEL</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Romaine Lettuce</td>
              <td style={{ padding: '1rem 1.5rem' }}>£24.00 / carton</td>
              <td style={{ padding: '1rem 1.5rem', color: '#EF4444' }}><TrendingUp size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> +15%</td>
              <td style={{ padding: '1rem 1.5rem', color: '#D97706' }}>Constrained</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Atlantic Salmon</td>
              <td style={{ padding: '1rem 1.5rem' }}>£22.50 / kg</td>
              <td style={{ padding: '1rem 1.5rem', color: '#16A34A' }}><TrendingDown size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> -2%</td>
              <td style={{ padding: '1rem 1.5rem', color: '#16A34A' }}>Stable</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Avocados (Hass)</td>
              <td style={{ padding: '1rem 1.5rem' }}>£42.00 / lug</td>
              <td style={{ padding: '1rem 1.5rem', color: '#EF4444' }}><TrendingUp size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> +8%</td>
              <td style={{ padding: '1rem 1.5rem', color: '#16A34A' }}>Stable</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
