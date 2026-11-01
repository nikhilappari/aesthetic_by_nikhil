import React, { useState, useEffect } from 'react';
import './About.css';

const ABOUT_IMAGES = [
  {
    src: '/artist_workspace.jpg',
    alt: "Nikhil Appari's Masterworks & Studio",
    tag: 'THE ART',
    theme: 'atelier',
    objectPosition: 'center 43%'
  },
  {
    src: '/nikhil_portrait.jpg',
    alt: 'Nikhil Appari - Portrait Artist',
    tag: 'THE ARTIST',
    theme: 'artist',
    objectPosition: 'center center'
  }
];

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ABOUT_IMAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem = ABOUT_IMAGES[currentIndex];

  return (
    <section className="about-section section-padding" id="about">
      <div className="container">
        <div className="about-grid">
          <div 
            className="about-image-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Ambient creative background aura behind the frame */}
            <div className={`about-ambient-aura ${currentItem.theme}`}></div>

            <div className="about-image-frame">
              {/* Dainty top-left corner micro-tag */}
              <div className="about-micro-tag">
                <span className="micro-tag-dot"></span>
                <span>{currentItem.tag}</span>
              </div>

              {ABOUT_IMAGES.map((img, idx) => (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  style={{ objectPosition: img.objectPosition }}
                  className={`about-image ${idx === currentIndex ? 'active' : ''}`}
                  loading="eager"
                  decoding="async"
                />
              ))}
            </div>

            {/* Geometric luxury accent frames behind the picture with gold corner brackets */}
            <div className={`about-image-accent ${currentItem.theme}`}>
              <span className="corner-bracket top-left"></span>
              <span className="corner-bracket bottom-right"></span>
            </div>
          </div>
          
          <div className="about-content">
            <h3 className="section-eyebrow">The Artist</h3>
            <h2 className="section-title">Nikhil Appari</h2>
            <p className="about-bio">
              Welcome to <strong>Aesthetic by Nikhil</strong>, the creative studio of <strong>Nikhil Appari</strong>. 
              Based in India, Nikhil is a dedicated portrait artist specializing in hyper-realistic artworks that 
              breathe life into paper.
            </p>
            <p className="about-philosophy">
              Every stroke is guided by a commitment to detail, expression, and emotion. 
              Nikhil believes that a portrait is more than just a likeness—it is a vessel 
              for personality, memories, and the meaningful moments that define us.
            </p>
            <p className="about-services">
              Whether it's a charcoal study or a vibrant color pencil piece, each commissioned 
              artwork is crafted with the soul of the subject in mind, creating a timeless 
              masterpiece for you to cherish forever.
            </p>
            
            <div className="about-cta-container">
              <p className="cta-text">Start your commission today</p>
              <div className="about-actions">
                <a href="https://wa.me/919849117467?text=Hi%20Nikhil!%20I%20saw%20your%20sketches%20on%20Aesthetic%20by%20Nikhil%20and%20would%20like%20to%20commission%20a%20portrait." target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <span>WhatsApp</span>
                  <i className="wa-icon"></i>
                </a>
                <a href="tel:+919849117467" className="btn-phone">
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
