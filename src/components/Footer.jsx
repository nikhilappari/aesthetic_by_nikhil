import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer section-padding">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2 className="logo serif">Aesthetic by Nikhil</h2>
            <p className="footer-tagline">Capturing memories through the art of realistic portraits.</p>
            <div className="footer-dpdp-badge" style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#8899a6', lineHeight: '1.45' }}>
              <span style={{ color: 'var(--accent-gold)' }}>🛡️ DPDP Act (India) Compliant Atelier</span>
              <p style={{ margin: '4px 0 0 0' }}>Data Protection Officer: Nikhil Appari</p>
              <p style={{ margin: '2px 0 0 0' }}><a href="mailto:nikhilappari2006@gmail.com" style={{ color: '#a0aec0', textDecoration: 'underline' }}>nikhilappari2006@gmail.com</a></p>
            </div>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-title">Navigation</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/gallery">Gallery Exhibition</Link></li>
              <li><Link to="/artworks">Artworks Collection</Link></li>
              <li><Link to="/order">Commission a Portrait</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-title">Legal & Trust</h4>
            <ul>
              <li><Link to="/privacy-policy">Privacy Notice (DPDP)</Link></li>
              <li><Link to="/data-rights">Data Rights Request</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/shipping-policy">Shipping & Delivery</Link></li>
              <li><a href="/#policy">Revision Guarantee</a></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4 className="footer-title">Contact Atelier</h4>
            <p><a href="mailto:nikhilappari2006@gmail.com" style={{ color: 'inherit' }}>nikhilappari2006@gmail.com</a></p>
            <p><a href="tel:+919849117467" style={{ color: 'inherit' }}>+91 98491 17467</a></p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram">IG</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook">FB</a>
              <a href="https://wa.me/919849117467?text=Hi%20Nikhil!%20I%20saw%20your%20sketches%20on%20Aesthetic%20by%20Nikhil%20and%20would%20like%20to%20commission%20a%20portrait." target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp">WA</a>
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#718096' }}>
              Hyderabad, Telangana, India
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aesthetic by Nikhil. All rights reserved.</p>
          <p>Handmade with Soul in India • Compliant with DPDP Act, 2023.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
