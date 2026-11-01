import React, { useState, useEffect } from 'react';
import './About.css';

const ABOUT_IMAGES = [
  {
    src: '/artist_workspace.png',
    alt: "Nikhil Appari's Masterworks & Studio",
    tag: 'THE ART',
    theme: 'atelier',
    objectPosition: 'center 43%'
  },
  {
    src: '/nikhil_portrait.png',
    alt: 'Nikhil Appari - Portrait Artist',
    tag: 'THE ARTIST',
    theme: 'artist',
    objectPosition: 'center center'
  }
];

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % ABOUT_IMAGES.length;
        setTransitionKey((k) => k + 1);
        return next;
      });
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
            <div className="about-ambient-particles"></div>

            <div className="about-image-frame">
              {/* Golden gallery sheen sweep across frame on transition */}
              <div key={transitionKey} className="about-gallery-sheen"></div>

              {/* Dainty top-left corner micro-tag */}
              <div className="about-micro-tag">
                <span className="micro-tag-dot"></span>
                <span>{currentItem.tag}</span>
              </div>

              {ABOUT_IMAGES.map((img, idx) => (
                <div
                  key={img.src}
                  className={`about-image-layer ${idx === currentIndex ? 'active' : ''}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    style={{ objectPosition: img.objectPosition }}
                    className="about-image"
                  />
                  <div className="about-vignette-overlay"></div>
                </div>
              ))}
            </div>

            {/* Geometric luxury accent frames behind the picture with gold corner brackets */}
            <div className={`about-image-accent ${currentItem.theme}`}>
              <span className="corner-bracket top-left"></span>
              <span className="corner-bracket bottom-right"></span>
            </div>
            <div className="about-image-accent-secondary"></div>
          </div>
          
          <div className="about-content">
            <div className="about-status-badge">
              <span className="status-live-dot"></span>
              <span>Accepting Bespoke Commissions</span>
            </div>

            <h3 className="section-eyebrow">Master Portrait Artist</h3>
            <h2 className="section-title">Nikhil Appari</h2>

            <p className="about-lead">
              Transforming raw graphite, charcoal, and color into living emotion. Every commission is crafted with meticulous care to capture not merely a likeness, but the personality and presence of those you hold dear.
            </p>

            <div className="about-pillars">
              <div className="pillar-item">
                <span className="pillar-bullet">✦</span>
                <div className="pillar-text">
                  <strong>Hyper-Realistic Precision:</strong> Micro-detailed shading capturing natural expressions, soulful eyes, and lifelike skin textures.
                </div>
              </div>

              <div className="pillar-item">
                <span className="pillar-bullet">✦</span>
                <div className="pillar-text">
                  <strong>Museum Archival Standards:</strong> Rendered on heavyweight acid-free Strathmore paper using lightfast German graphite and artist pencils.
                </div>
              </div>

              <div className="pillar-item">
                <span className="pillar-bullet">✦</span>
                <div className="pillar-text">
                  <strong>Bespoke Collaboration:</strong> Milestone preview stages ensure the artwork is refined to absolute perfection before dispatch.
                </div>
              </div>
            </div>
            
            <div className="about-cta-container">
              <div className="cta-prompt">
                <span className="cta-prompt-title">Commission a Custom Portrait</span>
                <span className="cta-prompt-desc">Crafted for birthdays, anniversaries, weddings, and personal tributes.</span>
              </div>
              <div className="about-actions">
                <a 
                  href="https://wa.me/919849117467?text=Hi%20Nikhil!%20I%20saw%20your%20sketches%20on%20Aesthetic%20by%20Nikhil%20and%20would%20like%20to%20commission%20a%20portrait." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-whatsapp-luxury"
                >
                  <svg className="wa-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z"/>
                  </svg>
                  <span>Inquire on WhatsApp</span>
                </a>
                <a href="tel:+919849117467" className="btn-phone-luxury">
                  <svg className="phone-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>Direct Call</span>
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
