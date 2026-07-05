import React, { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Search, MapPin, Star, ShieldCheck, Filter, Clock, Box, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';

const INITIAL_SUPPLIERS = [
  { name: 'GreenEarth Organics', location: 'Salinas, CA', rating: '4.9', certs: 3, categories: 'Leafy Greens, Root Veg, Salad', since: '2019', moqValue: 50, leadTimeValue: 2, moq: '50 kg', leadTime: '2 Days' },
  { name: 'Atlantic Blue Fisheries', location: 'Portland, ME', rating: '4.8', certs: 4, categories: 'Seafood, Shellfish, Salmon', since: '2015', moqValue: 100, leadTimeValue: 3, moq: '100 kg', leadTime: '3 Days' },
  { name: 'Valley Prime Meats', location: 'Omaha, NE', rating: '4.7', certs: 2, categories: 'Beef, Pork, Poultry', since: '2010', moqValue: 200, leadTimeValue: 4, moq: '200 kg', leadTime: '4 Days' },
  { name: 'Sunrise Orchards', location: 'Yakima, WA', rating: '4.9', certs: 2, categories: 'Apples, Pears, Cherries, Fruit', since: '2021', moqValue: 20, leadTimeValue: 1, moq: '20 kg', leadTime: '1 Day' },
];

export default function Suppliers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'buyer') {
    return <Navigate to="/marketplace" replace />;
  }
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [moqFilter, setMoqFilter] = useState(250);
  const [leadTimeFilter, setLeadTimeFilter] = useState(5);

  const locations = ['All', 'CA', 'ME', 'NE', 'WA'];

  const filteredSuppliers = useMemo(() => {
    return INITIAL_SUPPLIERS.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.categories.toLowerCase().includes(search.toLowerCase());
      
      const matchLocation = locationFilter === 'All' || s.location.includes(locationFilter);
      const matchMOQ = s.moqValue <= moqFilter;
      const matchLeadTime = s.leadTimeValue <= leadTimeFilter;

      return matchSearch && matchLocation && matchMOQ && matchLeadTime;
    });
  }, [search, locationFilter, moqFilter, leadTimeFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setLocationFilter('All');
    setMoqFilter(250);
    setLeadTimeFilter(5);
  };

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', fontFamily: 'var(--font-sans)' }}>
      <SEO title="Supplier Directory" />
      
      {/* Title Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Supplier Directory</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Discover and connect with verified Freshlync B2B network wholesale suppliers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Advanced Filters Panel */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', sticky: 'top', top: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)' }}>
              <Filter size={16} /> Filters
            </span>
            <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Search bar */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Partner</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Name or product type..."
                style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 8, border: '1px solid var(--color-border)', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location (US State)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: `1px solid ${locationFilter === loc ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: locationFilter === loc ? 'var(--color-primary)' : 'white',
                    color: locationFilter === loc ? 'white' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* MOQ Filter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max MOQ</label>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>≤ {moqFilter} kg</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="10"
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              value={moqFilter}
              onChange={e => setMoqFilter(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              <span>20 kg</span>
              <span>250 kg</span>
            </div>
          </div>

          {/* Lead Time Filter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Lead Time</label>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>≤ {leadTimeFilter} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              value={leadTimeFilter}
              onChange={e => setLeadTimeFilter(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              <span>1 Day</span>
              <span>5 Days</span>
            </div>
          </div>
        </div>

        {/* Right: Suppliers Cards Grid */}
        <div>
          {filteredSuppliers.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No supplier matches found. Adjust filters to expand your scope.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
              {filteredSuppliers.map((s, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.15rem' }}>{s.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            <MapPin size={12} /> {s.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem', borderBottom: '1px dashed var(--color-border)', pb: '1rem', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Categories:</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{s.categories}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Rating:</span>
                        <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#D97706' }}>
                          <Star size={14} fill="currentColor" /> {s.rating}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Compliance:</span>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A' }}>
                          <ShieldCheck size={14} /> {s.certs} Active Certs
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Box size={14} /> Min. Order (MOQ):</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{s.moq}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Lead Time:</span>
                        <span style={{ fontWeight: 700, color: '#334155', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{s.leadTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="btn-primary" onClick={() => navigate(`/marketplace?search=${encodeURIComponent(s.name)}`)} style={{ width: '100%', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    View Catalog
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
