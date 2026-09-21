import React from 'react';
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
              <li><a href="#home">Home</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#reviews">Reviews</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-title">Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Revision Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4 className="footer-title">Contact</h4>
            <p>nikhilappari2006@gmail.com</p>
            <p>+91 98491 17467</p>
            <div className="social-links">
              <a href="#" className="social-icon">IG</a>
              <a href="#" className="social-icon">FB</a>
              <a href="https://wa.me/919849117467?text=Hi%20Nikhil!%20I%20saw%20your%20sketches%20on%20Aesthetic%20by%20Nikhil%20and%20would%20like%20to%20commission%20a%20portrait." target="_blank" rel="noopener noreferrer" className="social-icon">WA</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Aesthetic by Nikhil. All rights reserved.</p>
          <p>Handmade with Soul.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
