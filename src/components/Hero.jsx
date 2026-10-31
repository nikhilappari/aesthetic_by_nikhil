import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heroBgWebp from '../assets/hero-bg.webp';
import heroBgPng from '../assets/hero-bg.png';
import './Hero.css';

const Hero = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!bgRef.current) return;
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 30;
      const moveY = (clientY - window.innerHeight / 2) / 30;
      bgRef.current.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero-section" id="home">
      <div className="hero-parallax-bg" ref={bgRef}>
        <picture className="hero-picture">
          <source srcSet={heroBgWebp} type="image/webp" />
          <img 
            src={heroBgPng} 
            alt="Aesthetic portrait sketches workspace" 
            className="hero-bg-img"
            fetchPriority="high"
            loading="eager"
          />
        </picture>
      </div>
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="hero-content-overlay"></div>
        <h3 className="hero-eyebrow">Hand-Crafted Memories</h3>
        <h1 className="hero-title">Timeless Portraits, <br />Captured with Soul.</h1>
        <p className="hero-subtitle">
          Professional charcoal and color pencil sketches that bring your stories to life. 
          Discover a gallery of personalized art and commission your unique masterpiece.
        </p>
        <div className="hero-actions">
          <Link to="/gallery" className="btn-primary">Explore Gallery</Link>
          <Link to="/order" className="btn-secondary">Request a Sketch</Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
