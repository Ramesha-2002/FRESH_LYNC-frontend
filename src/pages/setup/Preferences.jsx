import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, Smartphone, Globe, CheckCircle2 } from 'lucide-react';
import { useSetup } from '../../context/SetupContext';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';

export default function Preferences() {
  const navigate = useNavigate();
  const { setupState, updatePreferences } = useSetup();
  
  const [prefs, setPrefs] = useState(setupState.preferences);

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const { user } = useAuth();
  const handleComplete = () => {
    updatePreferences(prefs);
    if (user?.role === 'buyer') {
      navigate('/marketplace');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <SEO title="Preferences" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Finalize Your Preferences</h2>
          <p style={{ color: 'var(--color-text-main)', fontSize: '1rem', lineHeight: 1.5 }}>
            Tailor your Freshlync experience to match your operational workflow. These settings can be updated anytime in your account profile.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                <Bell size={20} color="var(--color-text-main)" /> Notification Channels
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Recommended</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Mail size={20} color="var(--color-text-main)" />
                  <div>
                    <div style={{ fontWeight: 500 }}>Email Notifications</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Inventory alerts and daily reports</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.email} 
                  onChange={() => handleToggle('email')}
                  style={{ accentColor: 'var(--color-primary)', width: '1.25rem', height: '1.25rem' }} 
                />
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Smartphone size={20} color="var(--color-text-main)" />
                  <div>
                    <div style={{ fontWeight: 500 }}>SMS Notifications</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Urgent supply chain disruptions</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.sms} 
                  onChange={() => handleToggle('sms')}
                  style={{ accentColor: 'var(--color-primary)', width: '1.25rem', height: '1.25rem' }} 
                />
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Smartphone size={20} color="var(--color-text-main)" />
                  <div>
                    <div style={{ fontWeight: 500 }}>Push Notifications</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Real-time status updates on mobile</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefs.push} 
                  onChange={() => handleToggle('push')}
                  style={{ accentColor: 'var(--color-primary)', width: '1.25rem', height: '1.25rem' }} 
                />
              </label>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <Globe size={20} color="var(--color-text-main)" /> Regional & Time Zone
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Primary Time Zone</label>
              <select 
                className="input-field" 
                style={{ appearance: 'none', background: 'white url("/logo.svg") no-repeat right 1rem center', backgroundSize: '24px' }}
                value={prefs.timeZone}
                onChange={(e) => setPrefs(prev => ({ ...prev, timeZone: e.target.value }))}
              >
                <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                <option>(GMT-05:00) Eastern Time (US & Canada)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Side Panel */}
        <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Units of Measurement
            </div>
            <div style={{ display: 'flex', background: 'var(--color-background)', borderRadius: '8px', padding: '0.25rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setPrefs(prev => ({ ...prev, units: 'Metric' }))}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', fontWeight: 500, background: prefs.units === 'Metric' ? 'white' : 'transparent', boxShadow: prefs.units === 'Metric' ? 'var(--shadow-sm)' : 'none', color: prefs.units === 'Metric' ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}
              >
                Metric
              </button>
              <button 
                onClick={() => setPrefs(prev => ({ ...prev, units: 'Imperial' }))}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', fontWeight: 500, background: prefs.units === 'Imperial' ? 'white' : 'transparent', boxShadow: prefs.units === 'Imperial' ? 'var(--shadow-sm)' : 'none', color: prefs.units === 'Imperial' ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}
              >
                Imperial
              </button>
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              {prefs.units === 'Metric' ? 'Currently showing kg, liters, and Celsius' : 'Currently showing lbs, gallons, and Fahrenheit'}
            </div>
          </div>

          <div style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready to Launch?</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.5 }}>
              All onboarding steps are completed. Your supply chain workspace is now optimized.
            </p>
            <button onClick={handleComplete} style={{ background: 'white', color: 'var(--color-primary)', width: '100%', padding: '1rem', borderRadius: '8px', fontWeight: 600, marginBottom: '1rem', border: 'none', cursor: 'pointer' }}>
              Complete Setup
            </button>
            <button onClick={() => { updatePreferences(prefs); navigate('/setup/profile'); }} style={{ color: 'white', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              Review Previous Steps
            </button>
          </div>

        </div>
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
        {(user?.role === 'supplier' ? [1, 2, 3] : [1, 2]).map(step => (
          <div key={step} style={{ width: '40px', height: '4px', borderRadius: '2px', background: (user?.role === 'supplier' ? step === 3 : step === 2) ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
        ))}
      </div>
    </div>
  );
}
