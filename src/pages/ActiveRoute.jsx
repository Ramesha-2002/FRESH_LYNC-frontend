import React from 'react';
import { ArrowLeft, MapPin, Navigation, Clock, Box, Maximize, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function ActiveRoute() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'var(--font-sans)', height: '100vh', width: '100vw', background: '#1E293B', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <SEO title="Active Route" />
      {/* Background Map Placeholder */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}></div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30,41,59,0.8) 0%, rgba(30,41,59,0.2) 50%, rgba(30,41,59,1) 100%)' }}></div>

      {/* Top Header */}
      <header style={{ position: 'relative', zIndex: 10, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Active Route</div>
          <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Warehouse B → Route 12</div>
        </div>
        <button style={{ color: 'white', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
          <Navigation size={24} />
        </button>
      </header>

      {/* Route Info Cards */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 1.5rem', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', flex: 1, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            <Clock size={14} /> ETA
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>14:45</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', flex: 1, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            <MapPin size={14} /> Stops
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>4 / 12</div>
        </div>
      </div>

      {/* Scanner Viewport */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ position: 'relative', width: '280px', height: '280px', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Scanner corners */}
          <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '32px', height: '32px', borderTop: '4px solid #22C55E', borderLeft: '4px solid #22C55E', borderTopLeftRadius: '24px' }}></div>
          <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '32px', height: '32px', borderTop: '4px solid #22C55E', borderRight: '4px solid #22C55E', borderTopRightRadius: '24px' }}></div>
          <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '32px', height: '32px', borderBottom: '4px solid #22C55E', borderLeft: '4px solid #22C55E', borderBottomLeftRadius: '24px' }}></div>
          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '32px', height: '32px', borderBottom: '4px solid #22C55E', borderRight: '4px solid #22C55E', borderBottomRightRadius: '24px' }}></div>
          
          <Maximize size={48} color="rgba(255,255,255,0.3)" strokeWidth={1} />
        </div>
        <div style={{ color: 'white', marginTop: '2rem', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '999px', backdropFilter: 'blur(4px)' }}>
          Align barcode within frame
        </div>
      </div>

      {/* Bottom Sheet */}
      <div style={{ position: 'relative', zIndex: 20, background: 'white', padding: '1.5rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '0 auto 1.5rem' }}></div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-text-main)' }}>Batch Verified</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>SKU: ORG-KALE-001 (1250 lbs)</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ flex: 1, padding: '1rem', background: '#F1F5F9', color: 'var(--color-text-main)', borderRadius: '12px', fontWeight: 600, border: 'none' }}>View Details</button>
          <button style={{ flex: 2, padding: '1rem', background: 'var(--color-primary)', color: 'white', borderRadius: '12px', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Navigation size={18} /> Start Delivery
          </button>
        </div>
      </div>

    </div>
  );
}
