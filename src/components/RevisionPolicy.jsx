import React from 'react';
import './RevisionPolicy.css';

const RevisionPolicy = () => {
  return (
    <section className="policy-section section-padding">
      <div className="container">
        <div className="policy-grid">
          <div className="policy-content">
            <h2 className="section-title">Our Artistic Commitment</h2>
            <p className="policy-intro">We strive for perfection in every stroke. To ensure clarity and satisfaction, we follow a transparent revision policy.</p>
            
            <div className="policy-list">
              <div className="policy-item">
                <h4>Refined Perfection</h4>
                <p>Minor refinements can be requested after the initial preview. We want to ensure the likeness is exactly how you imagine it.</p>
              </div>
              <div className="policy-item">
                <h4>Locked Progress</h4>
                <p>Major changes (like changing the reference photo) after work begins may incur additional costs as it requires restarting the process.</p>
              </div>
              <div className="policy-item">
                <h4>Quality Matters</h4>
                <p>The final outcome is heavily dependent on the quality of the reference photo provided. Higher resolution means more detail.</p>
              </div>
            </div>
          </div>
          
          <div className="policy-image glass">
            <img src="/artistic_commitment.jpg" alt="Artistic Commitment - Hand-drawn portrait sketch with drawing pencils" />
            <div className="floating-badge">Handmade Authenticity</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevisionPolicy;
