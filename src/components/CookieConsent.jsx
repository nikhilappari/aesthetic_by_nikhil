import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const consentGiven = localStorage.getItem('aesthetic_privacy_consent');
      if (!consentGiven) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Fallback for private browsing restrictions
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('aesthetic_privacy_consent', JSON.stringify({
        essential: true,
        performanceCache: true,
        analytics: false, // We do not run third-party tracking analytics
        timestamp: new Date().toISOString(),
        version: '2026.1-DPDP'
      }));
    } catch (_e) {
      // Silently ignore private browsing storage restriction
    }
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('aesthetic_privacy_consent', JSON.stringify({
        essential: true,
        performanceCache: false,
        analytics: false,
        timestamp: new Date().toISOString(),
        version: '2026.1-DPDP'
      }));
      // Remove non-essential performance caches if declining performance storage
      localStorage.removeItem('cached_artworks');
      localStorage.removeItem('cached_transformation');
      localStorage.removeItem('cached_pricing');
    } catch (_e) {
      // Silently ignore private browsing storage restriction
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay" role="region" aria-label="DPDP Act Privacy & Consent Preferences">
      <div className="cookie-banner-content">
        <div className="cookie-banner-header">
          <span className="cookie-icon">🛡️</span>
          <span className="cookie-title">DPDP Act (India) Privacy & Local Storage Preferences</span>
        </div>
        <p className="cookie-text">
          Aesthetic by Nikhil uses strictly necessary browser storage to preserve your login session, security tokens, 
          and custom portrait commission orders. We never employ third-party advertising trackers or sell personal data. 
          Under India's Digital Personal Data Protection Act, 2023, you have the right to choose your storage preferences, 
          review our <Link to="/privacy-policy">Privacy Notice</Link>, or submit a <Link to="/data-rights">Data Rights Request</Link>.
        </p>

        {showDetails && (
          <div style={{ margin: '0.75rem 0', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.75rem', color: '#b0b8c0', textAlign: 'left', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 6px 0' }}><strong>1. Strictly Essential (Always Active):</strong> Authentication token, CSRF defenses, active commission cart, and consent choices.</p>
            <p style={{ margin: 0 }}><strong>2. Performance Caching (Optional):</strong> Instant 0-second offline gallery preview caching. No third-party surveillance.</p>
          </div>
        )}

        <div className="cookie-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn-cookie-accept" onClick={handleAcceptAll}>
            Accept All Storage
          </button>
          <button type="button" className="btn-cookie-decline" onClick={handleEssentialOnly}>
            Strictly Essential Only
          </button>
          <button 
            type="button" 
            onClick={() => setShowDetails(!showDetails)}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', padding: '6px 8px' }}
          >
            {showDetails ? 'Hide Details' : 'View Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
