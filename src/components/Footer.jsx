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
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
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
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Aesthetic by Nikhil. All rights reserved.</p>
          <p>Handmade with Soul in India.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
