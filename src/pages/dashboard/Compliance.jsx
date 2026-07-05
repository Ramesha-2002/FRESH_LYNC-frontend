import React from 'react';
import { ShieldCheck, FileText, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import SEO from '../../components/SEO';

export default function Compliance() {
  const documents = [
    { name: 'Organic Certification - USDA', date: 'Valid until Dec 2024', status: 'Active', type: 'Certification' },
    { name: 'Food Safety Audit (GFSI)', date: 'Valid until Mar 2024', status: 'Active', type: 'Audit' },
    { name: 'Cold Chain Handling SOP', date: 'Updated Jan 2023', status: 'Active', type: 'Policy' },
    { name: 'Supplier Agreement v2.1', date: 'Action Required', status: 'Pending', type: 'Legal' },
  ];

  return (
    <div>
      <SEO title="Compliance" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Compliance & Certifications</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your regulatory documents and safety standards.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> Upload Document
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '1rem', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <ShieldCheck size={32} color="#16A34A" />
          <div>
            <h3 style={{ fontSize: '1.125rem', color: '#166534', marginBottom: '0.25rem' }}>Fully Compliant</h3>
            <p style={{ fontSize: '0.875rem', color: '#14532D' }}>Your supplier tier is currently Top Tier. All mandatory certifications are up to date.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>DOCUMENT NAME</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>TYPE</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>VALIDITY</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                    <FileText size={18} color="var(--color-text-muted)" />
                    {doc.name}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{doc.type}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{doc.date}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {doc.status === 'Active' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A', fontWeight: 500 }}>
                      <CheckCircle2 size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#D97706', fontWeight: 500 }}>
                      <AlertTriangle size={14} /> Pending Signature
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                    <Download size={14} /> Download
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
