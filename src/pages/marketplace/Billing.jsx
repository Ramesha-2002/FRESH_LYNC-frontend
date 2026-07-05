import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, CheckCircle, Clock, AlertTriangle, TrendingUp, DollarSign, Calendar, Loader } from 'lucide-react';
import SEO from '../../components/SEO';
import { useNotification } from '../../context/NotificationContext';
import { billingService } from '../../services/billingService';

export default function Billing() {
  const { showToast } = useNotification();
  
  // State from backend
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [creditLimit, setCreditLimit] = useState(100000);
  const [outstanding, setOutstanding] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(100000);
  const [nextPaymentDate, setNextPaymentDate] = useState('July 10, 2026');

  // Modal and form state
  const [requestAmount, setRequestAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submittingCredit, setSubmittingCredit] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  // Load billing data on mount
  const loadBillingData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const res = await billingService.getBillingData();
      if (res.success) {
        setInvoices(res.invoices);
        setCreditLimit(res.creditLimit);
        setOutstanding(res.outstanding);
        setAvailableCredit(res.availableCredit);
        setNextPaymentDate(res.nextPaymentDate);
      }
    } catch (err) {
      console.error('Failed to load billing data:', err);
      showToast(err.response?.data?.message || 'Failed to load B2B credit details.', 'error');
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    setProcessingPaymentId(invoiceId);
    try {
      const res = await billingService.payInvoice(invoiceId);
      if (res.success) {
        showToast(res.message, 'success');
        // Refresh billing data silently (no full page spinner) to update limits
        await loadBillingData(false);
      }
    } catch (err) {
      console.error('Failed to process invoice payment:', err);
      showToast(err.response?.data?.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRequestCredit = async (e) => {
    e.preventDefault();
    if (!requestAmount || isNaN(requestAmount) || parseFloat(requestAmount) <= creditLimit) {
      showToast('Please enter an amount higher than your current credit limit.', 'error');
      return;
    }
    
    setSubmittingCredit(true);
    try {
      const res = await billingService.requestCreditIncrease(parseFloat(requestAmount));
      if (res.success) {
        showToast(res.message, 'success');
        setShowModal(false);
        setRequestAmount('');
        // Refresh billing data
        await loadBillingData(false);
      }
    } catch (err) {
      console.error('Failed to request credit increase:', err);
      showToast(err.response?.data?.message || 'Credit increase request failed.', 'error');
    } finally {
      setSubmittingCredit(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12} /> Paid</span>;
      case 'Unpaid':
        return <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> Unpaid</span>;
      case 'Overdue':
        return <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={12} /> Overdue</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', fontFamily: 'var(--font-sans)' }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Loading credit line and invoice details...</div>
      </div>
    );
  }

  const creditUsedPercent = creditLimit > 0 ? (outstanding / creditLimit) * 100 : 0;
  const availableCreditPercent = creditLimit > 0 ? (availableCredit / creditLimit) * 100 : 0;
  const isHealthy = creditUsedPercent < 30;

  return (
    <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', fontFamily: 'var(--font-sans)' }}>
      <SEO title="Billing & Credit Dashboard" />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Billing & Credit Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>Manage your B2B credit line, invoices, and payment history.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <TrendingUp size={18} /> Request Credit Increase
        </button>
      </div>

      {/* Credit Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Credit Limit Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Credit Limit</span>
            <CreditCard size={20} style={{ opacity: 0.85 }} />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>£{creditLimit.toLocaleString()}</h2>
          <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>B2B Wholesale account limit</div>
        </div>

        {/* Available Credit Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Credit</span>
              <span style={{ background: '#ECFDF5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                {availableCreditPercent.toFixed(0)}% Left
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>£{availableCredit.toLocaleString()}</h2>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {/* Simple progress bar */}
            <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${availableCreditPercent}%`, height: '100%', background: 'var(--color-primary)' }}></div>
            </div>
          </div>
        </div>

        {/* Outstanding Balance Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Balance</span>
              <span style={{ color: '#E11D48', padding: '0.2rem 0.5rem', background: '#FFF1F2', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                Net 30 Term
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#334155' }}>£{outstanding.toLocaleString()}</h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            Accumulated unpaid wholesale deliveries
          </div>
        </div>

        {/* Next Payment Due Date */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Payment Due</span>
              <Calendar size={18} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#475569' }}>{nextPaymentDate}</h2>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            Auto-draw setup from primary bank account
          </div>
        </div>
      </div>

      {/* Credit Utilization Graph */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>Credit Line Utilization</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Used (Outstanding)</span>
              <span style={{ fontWeight: 700, color: '#475569' }}>£{outstanding.toLocaleString()} ({creditUsedPercent.toFixed(1)}%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Available Credit</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>£{availableCredit.toLocaleString()} ({availableCreditPercent.toFixed(1)}%)</span>
            </div>
            <div style={{ height: 16, background: '#E2E8F0', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${creditUsedPercent}%`, background: '#64748b' }}></div>
              <div style={{ width: `${availableCreditPercent}%`, background: 'var(--color-primary)' }}></div>
            </div>
          </div>
          <div style={{ width: '220px', borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Status</div>
            <div style={{ 
              fontSize: '1.1rem', fontWeight: 800, 
              color: isHealthy ? '#16A34A' : '#D97706', 
              display: 'flex', alignItems: 'center', gap: '0.4rem' 
            }}>
              <CheckCircle size={16} /> {isHealthy ? 'Account Healthy' : 'Attention Required'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {isHealthy 
                ? 'Your credit utilisation is in the safe zone (under 30%).' 
                : 'Your credit utilization is high. Consider requesting a credit increase.'}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Invoices</h3>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {invoices.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>INVOICE ID</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>BILLING DATE</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>DUE DATE</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>AMOUNT</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>
                    {new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>
                    {new Date(inv.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>£{inv.amount.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(inv.status)}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {inv.status !== 'Paid' ? (
                      <button 
                        className="btn-primary" 
                        onClick={() => handlePayInvoice(inv.id)} 
                        disabled={processingPaymentId === inv.id}
                        style={{ 
                          padding: '0.35rem 0.875rem', fontSize: '0.8rem', fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                        }}
                      >
                        {processingPaymentId === inv.id && <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                        Pay Invoice
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={14} color="#10B981" /> Paid Checkout
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No invoices found for your account.
          </div>
        )}
      </div>

      {/* Credit Limit Request Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '420px', padding: '2rem', animation: 'scaleUp 0.2s ease-out' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Request Credit Increase</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Provide a target credit limit. Platform algorithms evaluate order frequency and repayment history to grant instant upgrades.
            </p>
            <form onSubmit={handleRequestCredit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>Target Credit Limit (GBP)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--color-text-muted)' }}>£</span>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2rem', borderRadius: 8, border: '1px solid var(--color-border)', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem', fontWeight: 600 }}
                    value={requestAmount}
                    onChange={e => setRequestAmount(e.target.value)}
                    placeholder={`e.g. ${creditLimit + 25000}`}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Current credit limit: £{creditLimit.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }} disabled={submittingCredit}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, fontWeight: 700 }} disabled={submittingCredit}>
                  {submittingCredit ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
