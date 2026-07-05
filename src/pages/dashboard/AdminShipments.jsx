import React from 'react';
import { Filter, Download, ExternalLink, MapPin } from 'lucide-react';
import SEO from '../../components/SEO';

export default function AdminShipments() {
  const [shipments, setShipments] = React.useState([
    { id: 'SHP-9021', date: 'Oct 24, 2023', supplier: 'GreenEarth Organics', destination: 'London Hub', carrier: 'ColdChain Express', total: '£12,400.50', status: 'In Transit' },
    { id: 'SHP-9020', date: 'Oct 24, 2023', supplier: 'Atlantic Blue Fisheries', destination: 'Manchester', carrier: 'Global Freight', total: '£48,000.00', status: 'Pending Customs' },
    { id: 'SHP-9019', date: 'Oct 23, 2023', supplier: 'Valley Prime Meats', destination: 'Birmingham', carrier: 'Fresh Logistics', total: '£3,500.25', status: 'Delivered' },
    { id: 'SHP-9018', date: 'Oct 23, 2023', supplier: 'Sunrise Orchards', destination: 'London Hub', carrier: 'ColdChain Express', total: '£8,900.00', status: 'Delivered' },
    { id: 'SHP-9017', date: 'Oct 22, 2023', supplier: 'GreenEarth Organics', destination: 'Edinburgh', carrier: 'Express Road', total: '£21,000.00', status: 'Delayed' },
  ]);

  const [pendingChanges, setPendingChanges] = React.useState({});
  const [syncSuccess, setSyncSuccess] = React.useState(false);

  const handleCarrierChange = (id, newCarrier) => {
    setPendingChanges(prev => ({ ...prev, [id]: newCarrier }));
  };

  const handleSync = () => {
    setShipments(prev => prev.map(s => {
      if (pendingChanges[s.id]) {
        return { ...s, carrier: pendingChanges[s.id] };
      }
      return s;
    }));
    setPendingChanges({});
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  return (
    <div>
      <SEO title="System Shipments" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Global Shipments</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Monitor active transit routes across the network.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {Object.keys(pendingChanges).length > 0 && (
            <button onClick={handleSync} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              Sync Changes
            </button>
          )}
          {syncSuccess && <span style={{ color: '#16A34A', fontSize: '0.875rem', fontWeight: 600 }}>Synced Successfully!</span>}
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} /> Advanced Filter
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export Log
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button style={{ padding: '0.5rem 1rem', background: '#312E81', color: 'white', borderRadius: '999px', fontWeight: 500, border: 'none' }}>All Active (1,845)</button>
        <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--color-text-main)', borderRadius: '999px', fontWeight: 500, border: '1px solid var(--color-border)' }}>In Transit (1,420)</button>
        <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--color-text-main)', borderRadius: '999px', fontWeight: 500, border: '1px solid var(--color-border)' }}>Delayed Alerts (12)</button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>TRACKING ID</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>SUPPLIER</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>DESTINATION</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>CARRIER / DRIVER</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>VALUE</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}></th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#312E81' }}>{s.id}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{s.supplier}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)' }}>
                    <MapPin size={14} /> {s.destination}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>
                  {s.status === 'Delivered' ? (
                    <span>{s.carrier}</span>
                  ) : (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select 
                        value={pendingChanges[s.id] || s.carrier} 
                        onChange={(e) => handleCarrierChange(s.id, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: pendingChanges[s.id] ? '1px solid #16A34A' : '1px solid var(--color-border)', outline: 'none', background: pendingChanges[s.id] ? '#F0FDF4' : 'white', minWidth: '160px' }}
                      >
                        <option value="ColdChain Express">ColdChain Express</option>
                        <option value="Global Freight">Global Freight</option>
                        <option value="Fresh Logistics">Fresh Logistics</option>
                        <option value="Express Road">Express Road</option>
                        <option value="Mike Johnson (Independent)">Mike Johnson (Independent)</option>
                        <option value="Sarah Connor (Independent)">Sarah Connor (Independent)</option>
                      </select>
                      {pendingChanges[s.id] && <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#EF4444', color: 'white', width: '8px', height: '8px', borderRadius: '50%' }}></span>}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{s.total}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    background: s.status === 'Delivered' ? '#DCFCE7' : (s.status === 'Pending Customs' ? '#FEF3C7' : (s.status === 'In Transit' ? '#DBEAFE' : '#FEE2E2')), 
                    color: s.status === 'Delivered' ? '#166534' : (s.status === 'Pending Customs' ? '#B45309' : (s.status === 'In Transit' ? '#1E40AF' : '#991B1B')), 
                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button style={{ color: '#312E81', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500, marginLeft: 'auto' }}>
                    Track <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
