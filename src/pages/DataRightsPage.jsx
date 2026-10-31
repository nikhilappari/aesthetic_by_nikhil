import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './DataRightsPage.css';

const DataRightsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request_type: 'access',
    details: '',
    verificationConfirmed: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.details.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!formData.verificationConfirmed) {
      setError('Please confirm identity verification declaration to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitDataRightsRequest({
        name: formData.name,
        email: formData.email,
        request_type: formData.request_type,
        details: formData.details
      });

      if (res?.success) {
        setSubmissionResult(res);
      } else {
        setError(res?.message || 'Failed to submit request. Please try again or email the Grievance Officer directly.');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rights-page-container page-fade-in">
      <div className="rights-header">
        <span className="rights-eyebrow">DPDP Act (India) 2023 • Data Principal Portal</span>
        <h1 className="rights-title serif">Exercise Your Data Rights</h1>
        <p className="rights-subtitle">
          Under the Digital Personal Data Protection Act, 2023, you hold absolute sovereignty over your personal data 
          and uploaded portrait photographs. Use this official form to request access, correction, erasure, consent withdrawal, 
          or grievance redressal.
        </p>
      </div>

      <div className="rights-content-grid">
        {/* Left Column: Form or Confirmation */}
        <div className="rights-form-card glass">
          {submissionResult ? (
            <div className="rights-success-card module-fade-in">
              <div className="success-badge">
                <span className="badge-icon">✓</span>
                <span>Request Registered</span>
              </div>
              <h2 className="serif success-title">Data Rights Request Logged</h2>
              <p className="success-p">
                Your statutory request has been entered into our compliance audit log. 
                Our Data Protection & Grievance Officer will review your request and furnish a formal response.
              </p>

              <div className="receipt-box">
                <div className="receipt-row">
                  <span className="receipt-label">Tracking Number</span>
                  <span className="receipt-value gold-code">{submissionResult.trackingId}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Data Principal</span>
                  <span className="receipt-value">{formData.name} ({formData.email})</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Statutory Timeline</span>
                  <span className="receipt-value">{submissionResult.statutoryTimeline}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Grievance Officer</span>
                  <span className="receipt-value">Nikhil Appari</span>
                </div>
              </div>

              <div className="success-footer-actions">
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={() => {
                    setSubmissionResult(null);
                    setFormData({
                      name: '',
                      email: '',
                      request_type: 'access',
                      details: '',
                      verificationConfirmed: false
                    });
                  }}
                >
                  Submit Another Request
                </button>
                <Link to="/privacy-policy" className="btn-secondary">
                  Review Privacy Notice
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rights-form">
              <h3 className="serif form-heading">Statutory Rights Request Form</h3>
              <p className="form-caption">
                Fields marked with <span style={{ color: 'var(--accent-gold)' }}>*</span> are required to verify your identity and process your inquiry.
              </p>

              {error && <div className="rights-error-alert">{error}</div>}

              <div className="form-group">
                <label>Your Full Legal Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Nikhil Appari" 
                  required 
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label>Verified Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="name@example.com" 
                  required 
                  disabled={isSubmitting}
                />
                <small className="field-hint">Must match the email used when ordering or creating your account.</small>
              </div>

              <div className="form-group">
                <label>Statutory Right You Wish to Exercise *</label>
                <select 
                  name="request_type" 
                  value={formData.request_type} 
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="access">Access & Summary of Personal Data (Section 11)</option>
                  <option value="correction">Correction or Updating of Inaccurate Data (Section 12)</option>
                  <option value="erasure">Erasure / Permanent Deletion of Photos & Data (Section 12)</option>
                  <option value="withdrawal">Withdrawal of Processing Consent (Section 6(4))</option>
                  <option value="grievance">Grievance Redressal / Privacy Complaint (Section 13)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Specific Details of Your Request *</label>
                <textarea 
                  name="details" 
                  rows="4" 
                  value={formData.details} 
                  onChange={handleChange} 
                  placeholder="Please specify which reference photographs, order ID, or account details this request concerns..."
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="verificationConfirmed" 
                    checked={formData.verificationConfirmed} 
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <span>
                    I solemnly declare that I am the Data Principal named above or an authorized representative, 
                    and the information provided is accurate under Section 15 of the DPDP Act 2023.
                  </span>
                </label>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Registering Request in Audit Log...' : 'Submit Statutory Request'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Explanatory & Grievance Contact Card */}
        <div className="rights-info-sidebar">
          <div className="info-card glass">
            <h3 className="serif info-title">Data Principal Rights at a Glance</h3>
            <ul className="rights-list">
              <li>
                <strong>Section 11 • Right to Access:</strong> You are entitled to a summary of all personal data held, processing activities undertaken, and identities of third-party cloud processors.
              </li>
              <li>
                <strong>Section 12 • Right to Correction:</strong> You may correct outdated delivery addresses, rectify profile details, or update contact emails.
              </li>
              <li>
                <strong>Section 12 • Right to Erasure:</strong> You may instruct us to permanently purge uploaded portrait photos and associated chats from our cloud storage once orders are delivered.
              </li>
              <li>
                <strong>Section 6(4) • Consent Withdrawal:</strong> You may withdraw permission for marketing or portfolio showcases at any time without punitive fee.
              </li>
            </ul>
          </div>

          <div className="grievance-officer-card glass">
            <div className="officer-badge">Statutory Officer</div>
            <h4 className="serif officer-name">Nikhil Appari</h4>
            <div className="officer-title">Lead Artist & Data Protection / Grievance Redressal Officer</div>
            
            <div className="officer-details">
              <div className="detail-row">
                <span className="detail-icon">✉</span>
                <a href="mailto:nikhilappari2006@gmail.com">nikhilappari2006@gmail.com</a>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📞</span>
                <a href="tel:+919849117467">+91 98491 17467</a>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📍</span>
                <span>Hyderabad, Telangana - 500001, India</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">⏱</span>
                <span>Acknowledgement: 48 hours • Resolution: 30 days</span>
              </div>
            </div>

            <div className="dpbi-escalation-note">
              <p>
                <strong>Right to Escalate to DPBI:</strong> If our studio does not respond within 30 days 
                or if you remain aggrieved by our decision, you are empowered under Section 13(3) of the DPDP Act 
                to file an appeal before the <strong>Data Protection Board of India (DPBI)</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRightsPage;
