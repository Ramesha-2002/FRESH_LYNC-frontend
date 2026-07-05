import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Upload, Loader } from 'lucide-react';
import { useSetup } from '../../context/SetupContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import SEO from '../../components/SEO';

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizedAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendUrl}${normalizedAvatar}`;
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { setupState, updateProfile } = useSetup();
  const { showToast } = useNotification();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    phoneNumber: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync initial state from current logged-in user and setupState
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || setupState?.profile?.fullName || '',
        jobTitle: user.jobTitle || setupState?.profile?.jobTitle || '',
        phoneNumber: user.phone || setupState?.profile?.phoneNumber || ''
      });
      if (user.avatar) {
        setPreviewUrl(getAvatarUrl(user.avatar));
      }
    }
  }, [user, setupState]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be under 5MB.', 'error');
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.fullName);
      payload.append('phone', formData.phoneNumber);
      // Backend may expect other fields like jobTitle
      payload.append('jobTitle', formData.jobTitle);
      
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      console.log('[ProfileSetup] Submitting profile update FormData...');
      const response = await authService.updateProfile(payload);
      
      // Update local contexts
      const updatedUser = response.user || response;
      updateUser(updatedUser);
      
      updateProfile({
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        phoneNumber: formData.phoneNumber,
        avatar: updatedUser.avatar
      });

      showToast('Profile updated successfully!', 'success');
      if (user?.role === 'supplier') {
        navigate('/setup/verification');
      } else {
        navigate('/setup/preferences');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      <SEO title="Profile Setup" />
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tell us about yourself</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Welcome to Freshlync. Let's start by setting up your professional identity.
        </p>

        {/* Profile Picture Upload Section */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', overflow: 'hidden', flexShrink: 0 }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserCircle size={40} color="var(--color-text-muted)" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Profile Picture</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>JPG or PNG. Max 5MB.</div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <button 
              onClick={handleUploadClick}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              <Upload size={14} /> Upload photo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Jonathan Aris" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>Job Title</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Operations Manager" 
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number</label>
            <div style={{ display: 'flex' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRight: 'none', padding: '0.7rem 1rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', background: 'var(--color-background)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                🇬🇧 +44
              </div>
              <input 
                type="tel" 
                className="input-field" 
                style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }} 
                placeholder="(555) 000-0000" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" onClick={() => navigate('/marketplace')} style={{ color: 'var(--color-text-main)', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              ← Cancel & Exit
            </button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              {submitting ? (
                <><Loader size={16} style={{ animation: 'spin 0.75s linear infinite' }} /> Saving...</>
              ) : (
                'Save & Continue →'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
        {(user?.role === 'supplier' ? [1, 2, 3] : [1, 2]).map(step => (
          <div key={step} style={{ width: '40px', height: '4px', borderRadius: '2px', background: step === 1 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
        ))}
      </div>
    </div>
  );
}
