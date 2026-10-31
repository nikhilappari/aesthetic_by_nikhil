import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consentGiven = localStorage.getItem('aesthetic_privacy_consent');
      if (!consentGiven) {
        // Small delay so it appears smoothly after the initial page transition
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Fallback for private mode restriction
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('aesthetic_privacy_consent', 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('aesthetic_privacy_consent', 'essential_only');
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay" role="region" aria-label="Privacy and Cookie Consent">
      <div className="cookie-banner-content">
        <div className="cookie-banner-header">
          <span className="cookie-icon">🍪</span>
          <span className="cookie-title">Studio Privacy & Essential Storage</span>
        </div>
        <p className="cookie-text">
          We use essential local storage to secure your login sessions, custom sketch commission drafts, 
          and Google OAuth profile. We never track you for ads or share your personal reference photos. 
          Learn more in our <Link to="/privacy-policy">Privacy Policy</Link> and <Link to="/terms-of-service">Terms</Link>.
        </p>
        <div className="cookie-actions">
          <button type="button" className="btn-cookie-accept" onClick={handleAccept}>
            Accept & Continue
          </button>
          <button type="button" className="btn-cookie-decline" onClick={handleDecline}>
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
