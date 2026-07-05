import React from 'react';
import { HelpCircle, MessageSquare, PhoneCall, BookOpen } from 'lucide-react';
import SEO from '../../components/SEO';

export default function Support() {
  return (
    <div>
      <SEO title="Support" />
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Help & Support</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Get assistance with your Freshlync account and operations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <BookOpen size={24} color="#3B82F6" />
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Documentation</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Browse guides and tutorials on how to use the platform.</p>
          <button className="btn-secondary" style={{ width: '100%' }}>View Docs</button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <MessageSquare size={24} color="#16A34A" />
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Open a Ticket</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Submit a support request to our supply chain specialists.</p>
          <button className="btn-primary" style={{ width: '100%' }}>Create Ticket</button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <PhoneCall size={24} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Emergency Support</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>For urgent logistical issues or system outages.</p>
          <button className="btn-secondary" style={{ width: '100%' }}>Call +44-800-FRESH</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="var(--color-text-muted)" /> How do I update my inventory in bulk?
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginLeft: '1.75rem' }}>
              You can update inventory in bulk by navigating to the Inventory tab and clicking "Export CSV". Once you update the values in the CSV, simply drag and drop the file back into the platform.
            </p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="var(--color-text-muted)" /> Where can I find my active API keys?
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginLeft: '1.75rem' }}>
              API keys are located under Settings {'>'} Developer {'>'} API Keys. You must have Admin privileges to view or regenerate keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
