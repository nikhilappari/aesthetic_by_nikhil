import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = (e) => {
    if (window.location.pathname === '/' && !window.location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAboutClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar glass ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container-full nav-content">
        <Link to="/" className="logo-container" onClick={closeMobileMenu}>
          <div className="logo-icon serif">
            <span className="logo-a">A</span>
            <span className="logo-n">N</span>
          </div>
          <div className="logo-text">
            <div className="logo-main serif">aesthetic</div>
            <div className="logo-sub">
              <span className="line"></span>
              <span className="sub-text">by nikhil</span>
              <span className="line"></span>
            </div>
          </div>
        </Link>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/" onClick={(e) => { handleHomeClick(e); closeMobileMenu(); }}>Home</Link></li>
          <li><Link to="/gallery" onClick={closeMobileMenu}>Gallery</Link></li>
          <li><Link to="/artworks" onClick={closeMobileMenu}>Artworks</Link></li>
          <li><Link to="/#about" onClick={(e) => { handleAboutClick(e); closeMobileMenu(); }}>About</Link></li>
          
          {user ? (
            <>
              {user.role === 'admin' ? (
                <li><Link to="/admin" onClick={closeMobileMenu} className="nav-admin-link">Dashboard</Link></li>
              ) : (
                <li><Link to="/order" onClick={closeMobileMenu} className="nav-order-link">Order Sketch</Link></li>
              )}
              <li className="user-info">
                <span className="username">@{user.username}</span>
                <button onClick={() => { logout(); closeMobileMenu(); }} className="btn-logout-nav">Logout</button>
              </li>
            </>
          ) : (
            <li><Link to="/auth" onClick={closeMobileMenu} className="btn-nav">Login / Sign Up</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
