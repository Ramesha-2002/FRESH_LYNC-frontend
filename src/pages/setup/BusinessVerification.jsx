import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Info, CheckCircle2, Shield, Lock, FileText, Check, Trash2, Loader } from 'lucide-react';
import { useSetup } from '../../context/SetupContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import SEO from '../../components/SEO';

const ENTITY_TYPES = ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Cooperatives'];

export default function BusinessVerification() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { setupState, updateBusiness } = useSetup();
  const { showToast } = useNotification();

  const incDocRef = useRef(null);
  const licenseRef = useRef(null);
  const agreementRef = useRef(null);

  const [formData, setFormData] = useState({
    registeredBusinessName: user?.verificationDetails?.registeredBusinessName || setupState.business.companyName || '',
    businessRegistrationNumber: user?.verificationDetails?.businessRegistrationNumber || '',
    businessType: user?.verificationDetails?.businessType || 'Corporation',
    taxId: user?.verificationDetails?.taxId || setupState.business.taxId || '',
    businessAddress: user?.verificationDetails?.businessAddress || setupState.business.address || '',
    businessPhone: user?.verificationDetails?.businessPhone || user?.phone || '',
    businessEmail: user?.verificationDetails?.businessEmail || user?.email || '',
    contactName: user?.verificationDetails?.contactName || user?.name || '',
    contactJobTitle: user?.verificationDetails?.contactJobTitle || '',
    contactEmail: user?.verificationDetails?.contactEmail || user?.email || '',
    contactPhone: user?.verificationDetails?.contactPhone || user?.phone || '',
  });

  const [files, setFiles] = useState({
    incorporationDoc: null,
    businessLicense: null,
    operatingAgreement: null
  });

  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type: PDF, PNG, JPG
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file format. Please upload PDF, PNG, or JPG.', 'error');
      return;
    }

    // Validate size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File size must be under 10MB.', 'error');
      return;
    }

    setFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const removeFile = (fieldName) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleSaveDraft = () => {
    updateBusiness({
      companyName: formData.registeredBusinessName,
      taxId: formData.taxId,
      entityType: formData.businessType,
      address: formData.businessAddress
    });
    showToast('Draft saved successfully.', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.registeredBusinessName || !formData.businessRegistrationNumber || !formData.taxId || !formData.businessAddress) {
      showToast('Please fill in all required business information.', 'error');
      return;
    }

    // Must upload at least one document
    if (!files.incorporationDoc && !files.businessLicense && (!user?.verificationDetails?.documents?.length)) {
      showToast('Please upload at least one supporting document (e.g., Incorporation Document or Business License).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        fd.append(key, val);
      });

      if (files.incorporationDoc) fd.append('incorporationDoc', files.incorporationDoc);
      if (files.businessLicense) fd.append('businessLicense', files.businessLicense);
      if (files.operatingAgreement) fd.append('operatingAgreement', files.operatingAgreement);

      const response = await authService.submitBusinessVerification(fd);
      const updatedUser = response.user || response;
      updateUser(updatedUser);

      updateBusiness({
        companyName: formData.registeredBusinessName,
        taxId: formData.taxId,
        entityType: formData.businessType,
        address: formData.businessAddress
      });

      showToast('Business verification submitted successfully!', 'success');
      navigate('/setup/preferences');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to submit business verification details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SEO title="Business Verification" />
      <div style={{ display: 'inline-block', background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
        Step 2 of 3
      </div>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Business Verification</h2>
      <p style={{ color: 'var(--color-text-main)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '800px', lineHeight: 1.5 }}>
        To ensure security and compliance within the FreshLync supply chain, we need to verify your business identity before activating your warehouse dashboard.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Main Form Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '320px' }}>
            
            {/* Legal Info */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Legal Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Company Legal Name *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. GreenPath Logistics LLC" 
                    value={formData.registeredBusinessName}
                    onChange={(e) => setFormData({...formData, registeredBusinessName: e.target.value})}
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Business Registration Number *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. 12345678" 
                      value={formData.businessRegistrationNumber}
                      onChange={(e) => setFormData({...formData, businessRegistrationNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Entity Type *</label>
                    <select 
                      className="input-field" 
                      style={{ appearance: 'none', background: 'white url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 1rem center' }}
                      value={formData.businessType}
                      onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                    >
                      {ENTITY_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tax ID (EIN/VAT) *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="XX-XXXXXXX" 
                      value={formData.taxId}
                      onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Business Phone *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="+44 20 7946 0958" 
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Business Email Address *</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="compliance@greenpath.com" 
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({...formData, businessEmail: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Registered Business Address *</label>
                  <textarea 
                    className="input-field" 
                    placeholder="Street address, City, State, ZIP" 
                    rows={3} 
                    style={{ resize: 'none' }}
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Authorized Representative</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Job Title *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. CEO, Director" 
                      value={formData.contactJobTitle}
                      onChange={(e) => setFormData({...formData, contactJobTitle: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address *</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number *</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Supporting Documents</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Please upload legal documentation verifying your corporate structure and validity. PDF, PNG, or JPG. Max 10MB per file.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 1. Incorporation Doc */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Certificate of Incorporation *</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Required for companies and partnerships.</div>
                  </div>
                  <div>
                    <input ref={incDocRef} type="file" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'incorporationDoc')} />
                    {files.incorporationDoc ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> {files.incorporationDoc.name}</span>
                        <button type="button" onClick={() => removeFile('incorporationDoc')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => incDocRef.current?.click()}>Upload File</button>
                    )}
                  </div>
                </div>

                {/* 2. Business License */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Business License / Registration Certificate *</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Issued by your local municipality or country registry.</div>
                  </div>
                  <div>
                    <input ref={licenseRef} type="file" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'businessLicense')} />
                    {files.businessLicense ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> {files.businessLicense.name}</span>
                        <button type="button" onClick={() => removeFile('businessLicense')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => licenseRef.current?.click()}>Upload File</button>
                    )}
                  </div>
                </div>

                {/* 3. Operating Agreement */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Operating Agreement / Bylaws (Optional)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Rules governing company operations.</div>
                  </div>
                  <div>
                    <input ref={agreementRef} type="file" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'operatingAgreement')} />
                    {files.operatingAgreement ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> {files.operatingAgreement.name}</span>
                        <button type="button" onClick={() => removeFile('operatingAgreement')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <button type="button" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => agreementRef.current?.click()}>Upload File</button>
                    )}
                  </div>
                </div>

                {/* List previously uploaded documents if any */}
                {user?.verificationDetails?.documents?.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Previously Uploaded Documents</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {user.verificationDetails.documents.map((doc, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                          <CheckCircle2 size={14} color="var(--color-primary)" />
                          <span style={{ color: 'var(--color-text-main)' }}>{doc.name}</span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>({doc.fieldName})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Side Panel */}
          <div style={{ width: '340px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '280px' }}>
            
            {/* Why verify card */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', color: 'white', padding: '2rem 1.5rem', backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=600)', backgroundSize: 'cover' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))' }}></div>
              <div style={{ position: 'relative', zIndex: 1, marginTop: '4rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Why verify?</h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5 }}>
                  Verification allows you to unlock wholesale publishing capabilities, receive orders, and participate in marketplace transactions.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <Info size={18} /> Compliance Checklist
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', alignItems: 'center' }}>
                  {files.incorporationDoc || user?.verificationDetails?.documents?.some(d => d.fieldName === 'incorporationDoc') ? <CheckCircle2 size={18} color="var(--color-primary)" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--color-border)' }}></div>}
                  <span>Certificate of Incorporation</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', alignItems: 'center' }}>
                  {files.businessLicense || user?.verificationDetails?.documents?.some(d => d.fieldName === 'businessLicense') ? <CheckCircle2 size={18} color="var(--color-primary)" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--color-border)' }}></div>}
                  <span>Federal Tax ID / EIN</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', alignItems: 'center' }}>
                  {files.operatingAgreement || user?.verificationDetails?.documents?.some(d => d.fieldName === 'operatingAgreement') ? <CheckCircle2 size={18} color="var(--color-primary)" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--color-border)' }}></div>}
                  <span>Operating Agreement (Optional)</span>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
              <Shield size={24} color="#64748B" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Data Protection</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Your documents are encrypted, stored securely, and only accessible by compliance officers.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={() => { updateBusiness({ companyName: formData.registeredBusinessName, taxId: formData.taxId, entityType: formData.businessType, address: formData.businessAddress }); navigate('/setup/profile'); }} style={{ color: 'var(--color-text-main)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Back to Welcome
          </button>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <button type="button" onClick={handleSaveDraft} style={{ color: 'var(--color-text-main)', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Save Draft</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }} disabled={submitting}>
              {submitting ? (
                <><Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
              ) : (
                'Submit & Continue →'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
        {[1, 2, 3].map(step => (
          <div key={step} style={{ width: '40px', height: '4px', borderRadius: '2px', background: step === 2 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
        ))}
      </div>
    </div>
  );
}
