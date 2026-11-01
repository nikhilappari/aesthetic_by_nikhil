import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: "Prem Sai",
    initials: "PS",
    rating: 5,
    medium: "Color Pencil Study",
    occasion: "Anniversary Gift",
    verified: true,
    text: "It's a beautiful color pencil portrait of my parents. The level of detail, lifelike skin tones, and realism is truly impressive."
  },
  {
    id: 2,
    name: "Sunil Mattaparthi",
    initials: "SM",
    rating: 5,
    medium: "Charcoal on Paper",
    occasion: "Personal Portrait",
    verified: true,
    text: "Absolutely loved my charcoal portrait. It captures every contour and emotion perfectly, creating an artwork that feels deeply personal."
  },
  {
    id: 3,
    name: "Sohan",
    initials: "S",
    rating: 5,
    medium: "Color Sketch",
    occasion: "Birthday Gift",
    verified: true,
    text: "Commissioned a color sketch for a loved one's birthday. It turned out to be the perfect gift! The craftsmanship exceeded all expectations."
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials-section section-padding" id="reviews">
      <div className="container">
        <div className="testimonials-header text-center">
          <span className="section-eyebrow">Voices of Appreciation</span>
          <h2 className="section-title">Collector Stories</h2>
          <p className="testimonials-subtitle">
            Reflections from clients who trusted us with their cherished memories and bespoke handcrafted artworks.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.id} className="testimonial-card">
              {/* Artistic decorative watermark quote in background */}
              <div className="quote-watermark">“</div>

              {/* Top rating & verified badge */}
              <div className="testimonial-card-header">
                <div className="testimonial-stars" aria-label="5 out of 5 stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <span key={i} className="star-icon">★</span>
                  ))}
                </div>
                {t.verified && (
                  <span className="verified-badge">
                    <span className="verified-check">✓</span>
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {/* Review text */}
              <p className="testimonial-text">
                "{t.text}"
              </p>

              {/* Medium Tag */}
              <div className="testimonial-medium-tag">
                <span className="medium-dot"></span>
                <span>{t.medium}</span>
              </div>

              {/* Footer with avatar & collector info */}
              <div className="testimonial-footer">
                <div className="collector-avatar">
                  <span>{t.initials}</span>
                </div>
                <div className="testimonial-info">
                  <h4 className="testimonial-name">{t.name}</h4>
                  <p className="testimonial-occasion">{t.occasion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust metrics bar */}
        <div className="testimonials-trust-bar">
          <div className="trust-item">
            <span className="trust-number">100%</span>
            <span className="trust-label">Handcrafted Authenticity</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-number">5.0 ★</span>
            <span className="trust-label">Client Satisfaction Rating</span>
          </div>
          <div className="trust-divider"></div>
          <div className="trust-item">
            <span className="trust-number">100+</span>
            <span className="trust-label">Portraits Commissioned</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
